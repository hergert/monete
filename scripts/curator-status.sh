#!/bin/bash
# Quick status check for curator paper trading (v3)
# Shows all metrics: price/exec returns, probation, principal-back, liquidity
# Run anytime: ./scripts/curator-status.sh

PAPER_TRADES="reports/paper_trades_curator.json"

echo "=== Curator Paper Trading Status (v3) ==="
echo ""

if [ ! -f "$PAPER_TRADES" ]; then
  echo "No paper trades file found. Start the monitor first:"
  echo "  ./scripts/start-curator-monitor.sh"
  exit 1
fi

# Use bun to parse JSON and show stats
bun -e "
const data = require('./$PAPER_TRADES');
const now = Math.floor(Date.now() / 1000);

console.log('Version:', data.version || '1');
console.log('Started:', data.startedAt);
console.log('Updated:', data.lastUpdatedAt);
console.log('');

console.log('--- Signals ---');
console.log('Total:', data.totalSignals);
console.log('Complete:', data.completeSignals);
console.log('Pending:', data.totalSignals - data.completeSignals);
console.log('');

// Pending trades
const pending = data.trades.filter(t => t.status !== 'complete');
if (pending.length > 0) {
  console.log('--- Pending Trades ---');
  for (const t of pending.slice(0, 10)) {
    const age = now - t.detectedAt;
    const ageMin = Math.floor(age / 60);
    let nextCheck = t.status.replace('pending_', '');
    const exitIcon = t.liquidity?.exitStatus === 'unexitable' ? ' ⚠️' :
                     t.liquidity?.exitStatus === 'degraded' ? ' ⚡' : '';
    const probIcon = t.probation?.flaggedAsFlat ? ' 📋' : '';
    console.log('  ' + t.token.slice(0,12) + '... | ' + ageMin + 'm | next: ' + nextCheck + exitIcon + probIcon);
  }
  if (pending.length > 10) console.log('  ... and ' + (pending.length - 10) + ' more');
  console.log('');
}

// Summary stats
const s = data.summary;
console.log('--- Performance ---');
if (s.avgNetReturn1h !== null) {
  console.log('1h:  ' + s.avgNetReturn1h.toFixed(1) + '% price | ' + (s.avgExecReturn1h?.toFixed(1) || 'n/a') + '% exec | ' + (s.winRate1h?.toFixed(0) || 'n/a') + '% win');
}
if (s.avgNetReturn6h !== null) {
  console.log('6h:  ' + s.avgNetReturn6h.toFixed(1) + '% price | ' + (s.winRate6h?.toFixed(0) || 'n/a') + '% win');
}
if (s.avgNetReturn24h !== null) {
  console.log('24h: ' + s.avgNetReturn24h.toFixed(1) + '% price');
}
console.log('');

// Liquidity
console.log('--- Liquidity ---');
console.log('Exit feasible (1h): ' + (s.exitFeasibleRate1h?.toFixed(0) || 'n/a') + '%');
console.log('Unexitable: ' + (s.unexitableCount || 0));
console.log('Degraded (>10% impact): ' + (s.degradedCount || 0));
console.log('');

// Probation
console.log('--- Probation Rule ---');
console.log('Flat at 15m (<5%): ' + (s.flatAt15mCount || 0));
console.log('Would have saved: ' + (s.probationWouldHaveSavedCount || 0));
console.log('');

// Principal-back
console.log('--- Principal-Back Simulation ---');
console.log('Triggered (+50%): ' + (s.principalBackTriggeredCount || 0));
if (s.avgPrincipalBackReturn !== null) {
  console.log('Avg combined return: ' + s.avgPrincipalBackReturn.toFixed(1) + '%');
}
console.log('');

// Conviction
if (s.avgCuratorBuySizeUsd !== null) {
  console.log('--- Conviction ---');
  console.log('Avg curator buy: \$' + s.avgCuratorBuySizeUsd.toFixed(2));
  console.log('');
}

// Recent trades with all data
const withData = data.trades.filter(t => t.checkpoint1h);
if (withData.length > 0) {
  console.log('--- Recent Trades (with 1h data) ---');
  for (const t of withData.slice(-5)) {
    const price1h = t.checkpoint1h?.netReturn?.toFixed(1) || 'n/a';
    const exec1h = t.checkpoint1h?.exit?.executableReturn?.toFixed(1) || 'n/a';
    const liq = t.liquidity?.exitStatus === 'unexitable' ? '⚠️DEAD' :
                t.liquidity?.exitStatus === 'degraded' ? '⚡DEG' : '✓';
    const prob = t.probation?.flaggedAsFlat ? '📋FLAT' : '';
    const pb = t.principalBack?.triggeredAt ? '💰PB' : '';
    console.log('  ' + t.token.slice(0,10) + '.. | P:' + price1h + '% E:' + exec1h + '% | ' + liq + ' ' + prob + ' ' + pb);
  }
}
"

echo ""
tmux has-session -t curator 2>/dev/null && echo "Monitor: RUNNING" || echo "Monitor: STOPPED"
