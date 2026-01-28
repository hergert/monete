#!/bin/bash
# Analyze curator paper trading results
# Run when you have 10+ completed signals

PAPER_TRADES="reports/paper_trades_curator.json"

echo "=== Curator Results Analysis ==="
echo ""

if [ ! -f "$PAPER_TRADES" ]; then
  echo "No paper trades file found."
  exit 1
fi

bun -e "
const data = require('./$PAPER_TRADES');

const complete = data.trades.filter(t => t.status === 'complete');
const with1h = data.trades.filter(t => t.netReturn1h !== undefined);
const with6h = data.trades.filter(t => t.netReturn6h !== undefined);

console.log('=== Sample Size ===');
console.log('Total signals:', data.totalSignals);
console.log('Complete (24h):', complete.length);
console.log('With 1h data:', with1h.length);
console.log('With 6h data:', with6h.length);
console.log('');

if (with6h.length < 10) {
  console.log('⚠️  Need at least 10 signals with 6h data for meaningful analysis.');
  console.log('    Current: ' + with6h.length + '/10');
  console.log('');
  console.log('Keep the monitor running. Check back later.');
  process.exit(0);
}

// Calculate confidence intervals
const avg = arr => arr.reduce((a,b) => a+b, 0) / arr.length;
const std = arr => {
  const m = avg(arr);
  return Math.sqrt(arr.reduce((s, x) => s + (x-m)**2, 0) / arr.length);
};
const ci95 = (arr) => {
  const m = avg(arr);
  const se = std(arr) / Math.sqrt(arr.length);
  return { mean: m, lower: m - 1.96*se, upper: m + 1.96*se };
};

console.log('=== Performance Analysis ===');
console.log('');

// 1h analysis
if (with1h.length >= 10) {
  const returns1h = with1h.map(t => t.netReturn1h);
  const ci = ci95(returns1h);
  const winRate = (returns1h.filter(r => r > 0).length / returns1h.length * 100);
  console.log('1h Performance (n=' + with1h.length + '):');
  console.log('  Avg net return: ' + ci.mean.toFixed(2) + '%');
  console.log('  95% CI: [' + ci.lower.toFixed(2) + '%, ' + ci.upper.toFixed(2) + '%]');
  console.log('  Win rate: ' + winRate.toFixed(0) + '%');
  console.log('  Verdict: ' + (ci.lower > 0 ? '✓ POSITIVE EDGE (95% confident)' : ci.mean > 0 ? '? POSITIVE but not significant' : '✗ NO EDGE'));
  console.log('');
}

// 6h analysis
if (with6h.length >= 10) {
  const returns6h = with6h.map(t => t.netReturn6h);
  const ci = ci95(returns6h);
  const winRate = (returns6h.filter(r => r > 0).length / returns6h.length * 100);
  console.log('6h Performance (n=' + with6h.length + '):');
  console.log('  Avg net return: ' + ci.mean.toFixed(2) + '%');
  console.log('  95% CI: [' + ci.lower.toFixed(2) + '%, ' + ci.upper.toFixed(2) + '%]');
  console.log('  Win rate: ' + winRate.toFixed(0) + '%');
  console.log('  Verdict: ' + (ci.lower > 0 ? '✓ POSITIVE EDGE (95% confident)' : ci.mean > 0 ? '? POSITIVE but not significant' : '✗ NO EDGE'));
  console.log('');
}

// 24h analysis
if (complete.length >= 10) {
  const returns24h = complete.map(t => t.netReturn24h);
  const ci = ci95(returns24h);
  const winRate = (returns24h.filter(r => r > 0).length / returns24h.length * 100);
  console.log('24h Performance (n=' + complete.length + '):');
  console.log('  Avg net return: ' + ci.mean.toFixed(2) + '%');
  console.log('  95% CI: [' + ci.lower.toFixed(2) + '%, ' + ci.upper.toFixed(2) + '%]');
  console.log('  Win rate: ' + winRate.toFixed(0) + '%');
  console.log('  Verdict: ' + (ci.lower > 0 ? '✓ POSITIVE EDGE (95% confident)' : ci.mean > 0 ? '? POSITIVE but not significant' : '✗ NO EDGE'));
  console.log('');
}

// Per-curator breakdown
console.log('=== Per-Curator Performance ===');
const byCurator = {};
for (const t of with6h) {
  if (!byCurator[t.curator]) byCurator[t.curator] = [];
  byCurator[t.curator].push(t.netReturn6h);
}

const curatorStats = Object.entries(byCurator)
  .map(([curator, returns]) => ({
    curator: curator.slice(0, 12),
    n: returns.length,
    avg: avg(returns),
    winRate: returns.filter(r => r > 0).length / returns.length * 100
  }))
  .sort((a, b) => b.avg - a.avg);

console.log('Curator      | Signals | Avg 6h Net | Win Rate');
console.log('-'.repeat(50));
for (const c of curatorStats) {
  console.log(c.curator.padEnd(12) + ' | ' + c.n.toString().padEnd(7) + ' | ' + c.avg.toFixed(1).padStart(9) + '% | ' + c.winRate.toFixed(0) + '%');
}
console.log('');

// Final recommendation
console.log('=== Recommendation ===');
const returns6h = with6h.map(t => t.netReturn6h);
const ci6h = ci95(returns6h);
if (ci6h.lower > 0) {
  console.log('✓ PROCEED TO REAL TRADING');
  console.log('  6h returns are significantly positive.');
  console.log('  Consider starting with small positions ($10-50).');
} else if (ci6h.mean > 0) {
  console.log('? CONTINUE PAPER TRADING');
  console.log('  Results are positive but not yet significant.');
  console.log('  Need more data to be confident.');
} else {
  console.log('✗ CONSIDER PIVOT');
  console.log('  Curator selection does not show edge.');
  console.log('  Options: Partner-fee model or platform change.');
}
"
