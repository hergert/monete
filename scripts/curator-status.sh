#!/bin/bash
# Quick status check for curator paper trading
# Run anytime: ./scripts/curator-status.sh

PAPER_TRADES="reports/paper_trades_curator.json"

echo "=== Curator Paper Trading Status ==="
echo ""

if [ ! -f "$PAPER_TRADES" ]; then
  echo "No paper trades file found. Start the monitor first:"
  echo "  bun run src/live-curator-monitor.ts"
  exit 1
fi

# Use bun to parse JSON and calculate stats
bun -e "
const data = require('./$PAPER_TRADES');
const now = Math.floor(Date.now() / 1000);

console.log('Started:', data.startedAt);
console.log('Updated:', data.lastUpdatedAt);
console.log('');
console.log('--- Signals ---');
console.log('Total:', data.totalSignals);
console.log('Complete:', data.completeSignals);
console.log('Pending:', data.totalSignals - data.completeSignals);
console.log('');

// Show pending trades with time remaining
const pending = data.trades.filter(t => t.status !== 'complete');
if (pending.length > 0) {
  console.log('--- Pending Trades ---');
  for (const t of pending) {
    const age = now - t.detectedAt;
    const ageHours = (age / 3600).toFixed(1);
    let nextCheck = '';
    if (t.status === 'pending_1h') nextCheck = '1h check in ' + Math.max(0, 3600 - age) + 's';
    else if (t.status === 'pending_6h') nextCheck = '6h check in ' + Math.max(0, 21600 - age) + 's';
    else if (t.status === 'pending_24h') nextCheck = '24h check in ' + Math.max(0, 86400 - age) + 's';
    console.log('  ' + t.token.slice(0,12) + '... | Age: ' + ageHours + 'h | ' + nextCheck);
  }
  console.log('');
}

// Show summary stats if we have data
const s = data.summary;
console.log('--- Performance ---');
if (s.avgNetReturn1h !== null) {
  console.log('1h:  ' + s.avgNetReturn1h.toFixed(1) + '% avg net | ' + s.winRate1h.toFixed(0) + '% win rate');
}
if (s.avgNetReturn6h !== null) {
  console.log('6h:  ' + s.avgNetReturn6h.toFixed(1) + '% avg net | ' + s.winRate6h.toFixed(0) + '% win rate');
}
if (s.avgNetReturn24h !== null) {
  console.log('24h: ' + s.avgNetReturn24h.toFixed(1) + '% avg net | ' + s.winRate24h.toFixed(0) + '% win rate');
}
if (s.avgNetReturn1h === null && s.avgNetReturn6h === null && s.avgNetReturn24h === null) {
  console.log('No completed trades yet. Waiting for price checks...');
}
console.log('');

// Recent completed trades
const complete = data.trades.filter(t => t.status === 'complete').slice(-5);
if (complete.length > 0) {
  console.log('--- Recent Completed ---');
  for (const t of complete) {
    const icon = t.netReturn6h > 0 ? '✓' : '✗';
    console.log('  ' + icon + ' ' + t.token.slice(0,12) + '... | 6h: ' + (t.netReturn6h?.toFixed(1) || 'N/A') + '%');
  }
}
"

echo ""
echo "Monitor running? Check: tmux attach -t curator"
