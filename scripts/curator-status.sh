#!/bin/bash
# Quick status check for curator paper trading (v2)
# Shows both price returns and executable returns
# Run anytime: ./scripts/curator-status.sh

PAPER_TRADES="reports/paper_trades_curator.json"

echo "=== Curator Paper Trading Status (v2) ==="
echo ""

if [ ! -f "$PAPER_TRADES" ]; then
  echo "No paper trades file found. Start the monitor first:"
  echo "  ./scripts/start-curator-monitor.sh"
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
console.log('Unexitable:', data.summary.unexitableCount || 0);
console.log('');

// Show pending trades with time remaining
const pending = data.trades.filter(t => t.status !== 'complete');
if (pending.length > 0) {
  console.log('--- Pending Trades ---');
  for (const t of pending) {
    const age = now - t.detectedAt;
    const ageHours = (age / 3600).toFixed(1);
    let nextCheck = '';
    if (t.status === 'pending_1h') nextCheck = '1h in ' + Math.max(0, Math.floor((3600 - age)/60)) + 'm';
    else if (t.status === 'pending_6h') nextCheck = '6h in ' + Math.max(0, Math.floor((21600 - age)/60)) + 'm';
    else if (t.status === 'pending_24h') nextCheck = '24h in ' + Math.max(0, Math.floor((86400 - age)/60)) + 'm';
    const exitStatus = t.exitStatus === 'unexitable' ? ' ⚠️' : '';
    console.log('  ' + t.token.slice(0,12) + '... | Age: ' + ageHours + 'h | ' + nextCheck + exitStatus);
  }
  console.log('');
}

// Show summary stats
const s = data.summary;
console.log('--- Performance (Price Returns) ---');
if (s.avgNetReturn1h !== null) {
  console.log('1h:  ' + s.avgNetReturn1h.toFixed(1) + '% avg | ' + (s.winRate1h?.toFixed(0) || 'N/A') + '% win');
}
if (s.avgNetReturn6h !== null) {
  console.log('6h:  ' + s.avgNetReturn6h.toFixed(1) + '% avg | ' + (s.winRate6h?.toFixed(0) || 'N/A') + '% win');
}
if (s.avgNetReturn24h !== null) {
  console.log('24h: ' + s.avgNetReturn24h.toFixed(1) + '% avg | ' + (s.winRate24h?.toFixed(0) || 'N/A') + '% win');
}

// Show executable returns if available
if (s.avgExecReturn1h !== null || s.exitFeasibleRate1h !== null) {
  console.log('');
  console.log('--- Executable Returns (Real) ---');
  if (s.avgExecReturn1h !== null) {
    console.log('1h Exec: ' + s.avgExecReturn1h.toFixed(1) + '% avg');
  }
  if (s.exitFeasibleRate1h !== null) {
    console.log('Exit Feasible: ' + s.exitFeasibleRate1h.toFixed(0) + '%');
  }
}

if (s.avgNetReturn1h === null && s.avgNetReturn6h === null) {
  console.log('No price data yet. Waiting for 1h checks...');
}
console.log('');

// Show trades with exit data
const withExit = data.trades.filter(t => t.exit1h !== undefined);
if (withExit.length > 0) {
  console.log('--- Exit Feasibility (1h) ---');
  const feasible = withExit.filter(t => t.exit1h?.exists);
  const unexitable = withExit.filter(t => !t.exit1h?.exists);
  console.log('Feasible: ' + feasible.length + ' | Unexitable: ' + unexitable.length);

  // Show worst unexitable
  if (unexitable.length > 0) {
    console.log('');
    console.log('Unexitable tokens (liquidity death):');
    for (const t of unexitable.slice(0, 5)) {
      console.log('  ⚠️ ' + t.token.slice(0,12) + '... | Price: ' + (t.netReturn1h?.toFixed(1) || 'N/A') + '% → Exec: -100%');
    }
  }
}

// Recent completed trades
const complete = data.trades.filter(t => t.status === 'complete').slice(-5);
if (complete.length > 0) {
  console.log('');
  console.log('--- Recent Completed ---');
  for (const t of complete) {
    const priceReturn = t.netReturn6h?.toFixed(1) || 'N/A';
    const execReturn = t.exit6h?.executableReturn?.toFixed(1) || 'N/A';
    const icon = (t.exit6h?.exists && t.netReturn6h > 0) ? '✓' : '✗';
    console.log('  ' + icon + ' ' + t.token.slice(0,12) + '... | Price: ' + priceReturn + '% | Exec: ' + execReturn + '%');
  }
}
"

echo ""
echo "Monitor running? tmux has-session -t curator 2>/dev/null && echo 'Yes' || echo 'No'"
