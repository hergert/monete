// Replay Ingestion
// Reads events from data/replay/events.jsonl and writes to DB

import { existsSync, readFileSync } from "fs";

const REPLAY_FILE = "data/replay/events.jsonl";

interface ReplayEvent {
  type: string;
  signature: string;
  slot: number;
  instruction_index: number;
  payload: unknown;
  timestamp: string;
}

async function main() {
  console.log("=== Replay Ingestion ===\n");

  if (!existsSync(REPLAY_FILE)) {
    console.error(`Replay file not found: ${REPLAY_FILE}`);
    console.error("Create the replay dataset first.");
    process.exit(1);
  }

  const content = readFileSync(REPLAY_FILE, "utf-8");
  const lines = content.trim().split("\n").filter(Boolean);

  console.log(`Found ${lines.length} events to replay`);

  let processed = 0;
  let errors = 0;

  for (const line of lines) {
    try {
      const event: ReplayEvent = JSON.parse(line);

      // TODO: Implement:
      // 1. Normalize event
      // 2. Check dedupe key (signature, instruction_index)
      // 3. Insert to raw_events if not duplicate
      // 4. If Bags launch, insert to launches
      // 5. Extract wallet actions -> wallet_actions

      console.log(`Processing: ${event.signature.slice(0, 16)}... (${event.type})`);
      processed++;
    } catch (e) {
      console.error(`Error processing line: ${e}`);
      errors++;
    }
  }

  console.log(`\nProcessed: ${processed}, Errors: ${errors}`);

  if (errors > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Replay ingestion crashed:", e);
  process.exit(2);
});
