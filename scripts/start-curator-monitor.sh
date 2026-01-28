#!/bin/bash
# Start the curator monitor in a tmux session
# Usage: ./scripts/start-curator-monitor.sh

SESSION="curator"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Source .env if it exists
if [ -f "$PROJECT_DIR/.env" ]; then
  set -a
  source "$PROJECT_DIR/.env"
  set +a
fi

# Check if session already exists
if tmux has-session -t $SESSION 2>/dev/null; then
  echo "Session '$SESSION' already running."
  echo ""
  echo "To attach: tmux attach -t $SESSION"
  echo "To kill:   tmux kill-session -t $SESSION"
  echo "To status: ./scripts/curator-status.sh"
  exit 0
fi

# Check for required env vars
if [ -z "$HELIUS_API_KEY" ] || [ -z "$BIRDEYE_API_KEY" ]; then
  echo "ERROR: Missing environment variables"
  echo ""
  echo "Make sure these are set:"
  echo "  export HELIUS_API_KEY=your_key"
  echo "  export BIRDEYE_API_KEY=your_key"
  echo ""
  echo "Or source your .env file first:"
  echo "  source .env && ./scripts/start-curator-monitor.sh"
  exit 1
fi

# Create new tmux session and run monitor
echo "Starting curator monitor in tmux session '$SESSION'..."
tmux new-session -d -s $SESSION "cd $PROJECT_DIR && source .env 2>/dev/null; bun run src/live-curator-monitor.ts"

echo ""
echo "Monitor started!"
echo ""
echo "Commands:"
echo "  tmux attach -t $SESSION     # View live output"
echo "  ./scripts/curator-status.sh # Quick status check"
echo "  tmux kill-session -t $SESSION  # Stop monitor"
echo ""
echo "Detach from tmux: Ctrl+B, then D"
