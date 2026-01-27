#!/usr/bin/env python3
"""Filter Claude stream-json output into readable log lines."""
import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Error log path - relative to project root
ERROR_LOG = Path(os.environ.get("ERROR_LOG", "logs/errors.jsonl"))

def log(msg):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)

def log_error(error_type: str, tool_name: str, message: str, context: dict = None):
    """Append error entry to JSONL error log."""
    entry = {
        "timestamp": datetime.now().isoformat(),
        "iteration": os.environ.get("ITERATION", "?"),
        "error_type": error_type,
        "tool_name": tool_name,
        "message": message,
    }
    if context:
        entry["context"] = context
    ERROR_LOG.parent.mkdir(parents=True, exist_ok=True)
    with open(ERROR_LOG, "a") as f:
        f.write(json.dumps(entry) + "\n")

# Track last tool calls for error context
last_tool_calls = {}

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        event = json.loads(line)
    except:
        continue

    t = event.get("type", "")

    if t == "assistant":
        # Claude is thinking/responding
        msg = event.get("message", {})
        content = msg.get("content", [])
        for block in content:
            if block.get("type") == "tool_use":
                tool = block.get("name", "?")
                inp = block.get("input", {})
                tool_id = block.get("id", "")
                # Track for error context
                last_tool_calls[tool_id] = {"tool": tool, "input": inp}
                if tool == "WebFetch":
                    log(f"🌐 WebFetch: {inp.get('url', '?')[:60]}")
                elif tool == "WebSearch":
                    log(f"🔍 WebSearch: {inp.get('query', '?')}")
                elif tool == "Read":
                    log(f"📖 Read: {inp.get('file_path', '?')}")
                elif tool == "Write":
                    log(f"✏️  Write: {inp.get('file_path', '?')}")
                elif tool == "Edit":
                    log(f"✏️  Edit: {inp.get('file_path', '?')}")
                elif tool == "Bash":
                    cmd = inp.get('command', '?')[:80]
                    log(f"💻 Bash: {cmd}")
                elif tool == "Glob":
                    pattern = inp.get('pattern', '?')
                    path = inp.get('path', '.')
                    log(f"🔎 Glob: {pattern} in {path}")
                elif tool == "Grep":
                    pattern = inp.get('pattern', '?')[:40]
                    path = inp.get('path', '.')
                    log(f"🔎 Grep: '{pattern}' in {path}")
                elif tool == "Task":
                    desc = inp.get('description', inp.get('prompt', '?'))[:50]
                    log(f"🤖 Task: {desc}")
                else:
                    # Show first input value for unknown tools
                    first_val = str(list(inp.values())[0])[:50] if inp else '?'
                    log(f"🔧 {tool}: {first_val}")
            elif block.get("type") == "text":
                text = block.get("text", "")[:100]
                if text.strip():
                    log(f"💬 {text}")

    elif t == "user":
        # Tool results
        msg = event.get("message", {})
        content = msg.get("content", [])
        for block in content:
            if block.get("type") == "tool_result":
                tool_id = block.get("tool_use_id", "")
                is_error = block.get("is_error", False)
                error_content = str(block.get("content", ""))
                if is_error:
                    log(f"❌ Tool error: {error_content[:80]}")
                    # Get tool context
                    ctx = last_tool_calls.get(tool_id, {})
                    tool_name = ctx.get("tool", "unknown")
                    # Detect error type
                    if "403" in error_content:
                        error_type = "http_403"
                    elif "permission" in error_content.lower() or "approval" in error_content.lower():
                        error_type = "permission_denied"
                    elif "exit code" in error_content.lower():
                        error_type = "exit_code"
                    else:
                        error_type = "tool_error"
                    log_error(error_type, tool_name, error_content[:200], ctx.get("input"))

    elif t == "result":
        subtype = event.get("subtype", "")
        cost = event.get("total_cost_usd", 0)
        turns = event.get("num_turns", 0)
        denials = event.get("permission_denials", [])

        if denials:
            log(f"⚠️  Permission denied for {len(denials)} tool calls")
            for d in denials:
                tool_name = d.get("tool_name", "unknown")
                tool_input = d.get("tool_input", {})
                log(f"   - {tool_name}: {str(tool_input)[:60]}")
                log_error("permission_denied", tool_name, "Permission denied by settings", tool_input)

        log(f"✅ Done: {turns} turns, ${cost:.4f}")
        if subtype == "error_max_turns":
            log(f"⚠️  Hit max turns limit")
