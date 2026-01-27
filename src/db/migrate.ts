// Database Migration Runner
// Creates tables defined in specs/PROJECT_CONTRACT.md

// TODO: Add postgres client (e.g., postgres or pg)

const MIGRATIONS = [
  // raw_events - all ingested events
  `CREATE TABLE IF NOT EXISTS raw_events (
    id SERIAL PRIMARY KEY,
    source TEXT NOT NULL,
    signature TEXT NOT NULL,
    slot BIGINT NOT NULL,
    instruction_index INT NOT NULL,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    payload_json JSONB NOT NULL,
    UNIQUE(signature, instruction_index)
  )`,

  // launches - detected Bags launches
  `CREATE TABLE IF NOT EXISTS launches (
    id SERIAL PRIMARY KEY,
    mint TEXT NOT NULL UNIQUE,
    launch_signature TEXT NOT NULL,
    launch_slot BIGINT NOT NULL,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    is_bags BOOLEAN NOT NULL,
    signature_version TEXT NOT NULL,
    dbc_pool_address TEXT,
    pool_authority TEXT,
    fee_share_config TEXT,
    is_migrated BOOLEAN DEFAULT FALSE
  )`,

  // wallet_actions - wallet trading activity
  `CREATE TABLE IF NOT EXISTS wallet_actions (
    id SERIAL PRIMARY KEY,
    wallet TEXT NOT NULL,
    mint TEXT NOT NULL,
    action TEXT NOT NULL,
    slot BIGINT NOT NULL,
    ts_chain TIMESTAMPTZ,
    amount_in NUMERIC,
    amount_out NUMERIC,
    tx_signature TEXT NOT NULL
  )`,

  // quotes - stored quote data
  `CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    mint TEXT NOT NULL,
    ts TIMESTAMPTZ DEFAULT NOW(),
    in_amount_usd NUMERIC,
    price_impact_bps INT,
    expected_out NUMERIC,
    route_json JSONB
  )`,

  // positions - paper and real positions
  `CREATE TABLE IF NOT EXISTS positions (
    id SERIAL PRIMARY KEY,
    position_id TEXT NOT NULL UNIQUE,
    mint TEXT NOT NULL,
    entry_ts TIMESTAMPTZ,
    entry_sig TEXT,
    entry_price NUMERIC,
    size_usd NUMERIC,
    exit_ts TIMESTAMPTZ,
    exit_sig TEXT,
    exit_price NUMERIC,
    pnl_usd NUMERIC,
    pnl_pct NUMERIC,
    exit_reason TEXT
  )`,

  // wallet_scores - computed wallet metrics
  `CREATE TABLE IF NOT EXISTS wallet_scores (
    id SERIAL PRIMARY KEY,
    wallet TEXT NOT NULL,
    window_start TIMESTAMPTZ,
    window_end TIMESTAMPTZ,
    signals_n INT,
    ev_mean NUMERIC,
    ev_lower_bound NUMERIC,
    sniper_score NUMERIC,
    deployer_score NUMERIC,
    status TEXT,
    UNIQUE(wallet, window_start, window_end)
  )`,

  // trade_journal - decision log
  `CREATE TABLE IF NOT EXISTS trade_journal (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    launch_json JSONB NOT NULL,
    wallets_json JSONB,
    toxicity_json JSONB,
    quote_json JSONB,
    economics_json JSONB,
    decision_json JSONB NOT NULL,
    outcome_json JSONB
  )`,

  // Indexes
  `CREATE INDEX IF NOT EXISTS idx_raw_events_signature ON raw_events(signature)`,
  `CREATE INDEX IF NOT EXISTS idx_wallet_actions_wallet ON wallet_actions(wallet)`,
  `CREATE INDEX IF NOT EXISTS idx_wallet_actions_mint ON wallet_actions(mint)`,
];

async function main() {
  console.log("=== Database Migration ===\n");

  // TODO: Connect to Postgres and run migrations
  // For now, just print what would be run

  console.log("Migrations to run:");
  for (let i = 0; i < MIGRATIONS.length; i++) {
    const migration = MIGRATIONS[i]!;
    const preview = migration.slice(0, 60).replace(/\n/g, " ");
    console.log(`  ${i + 1}. ${preview}...`);
  }

  console.error("\nNot implemented: actual DB connection");
  console.error("Add a postgres client (e.g., bun add postgres) and implement.");
  process.exit(1);
}

main().catch((e) => {
  console.error("Migration crashed:", e);
  process.exit(2);
});
