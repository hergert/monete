# Monenete Development Commands

set dotenv-load

# Default: show available commands
default:
    @just --list

# === Setup ===

# Install dependencies
install:
    bun install

# Initialize project (first time setup)
init:
    bun init -y
    just install

# === Connections ===

# Test Helius RPC connection
test-helius:
    @curl -s -X POST "https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}" \
      -H "Content-Type: application/json" \
      -d '{"jsonrpc":"2.0","id":1,"method":"getSlot"}' | jq .

# Test Helius enhanced API
test-helius-api:
    @curl -s "https://api.helius.xyz/v0/addresses/So11111111111111111111111111111111111111112/balances?api-key=${HELIUS_API_KEY}" | jq . | head -30

# Test database connection
test-db:
    @psql "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_DATABASE}?sslmode=${DB_SSLMODE}" -c "SELECT 1 as connected;"

# === Research ===

# Get transaction by signature
get-tx sig:
    @curl -s -X POST "https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}" \
      -H "Content-Type: application/json" \
      -d '{"jsonrpc":"2.0","id":1,"method":"getTransaction","params":["{{sig}}",{"encoding":"jsonParsed","maxSupportedTransactionVersion":0}]}' | jq .

# Get token metadata
get-token mint:
    @curl -s "https://api.helius.xyz/v0/tokens/metadata?api-key=${HELIUS_API_KEY}" \
      -X POST \
      -H "Content-Type: application/json" \
      -d '{"mintAccounts":["{{mint}}"]}' | jq .

# Get account info
get-account address:
    @curl -s -X POST "https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}" \
      -H "Content-Type: application/json" \
      -d '{"jsonrpc":"2.0","id":1,"method":"getAccountInfo","params":["{{address}}",{"encoding":"jsonParsed"}]}' | jq .

# Get signatures for address (recent transactions)
get-sigs address count="10":
    @curl -s -X POST "https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}" \
      -H "Content-Type: application/json" \
      -d '{"jsonrpc":"2.0","id":1,"method":"getSignaturesForAddress","params":["{{address}}",{"limit":{{count}}}]}' | jq .

# Save transaction to file
save-tx sig name:
    @just get-tx {{sig}} > data/sample_txs/{{name}}.json
    @echo "Saved to data/sample_txs/{{name}}.json"

# === Development ===

# Run TypeScript file
run file:
    bun run {{file}}

# Type check
typecheck:
    bun run tsc --noEmit

# Run tests
test:
    bun test

# === Validation (from CLAUDE.md) ===

# Run all validation checks
dev-validate: typecheck test

# === Database ===

# Open psql shell
db-shell:
    psql "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_DATABASE}?sslmode=${DB_SSLMODE}"

# Run SQL file
db-run file:
    psql "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_DATABASE}?sslmode=${DB_SSLMODE}" -f {{file}}

# === Utilities ===

# Show current slot
slot:
    @just test-helius | jq -r '.result'

# Show env status
env-check:
    @echo "HELIUS_API_KEY: $(if [ -n \"${HELIUS_API_KEY}\" ]; then echo 'set'; else echo 'MISSING'; fi)"
    @echo "DB_HOST: $(if [ -n \"${DB_HOST}\" ]; then echo 'set'; else echo 'MISSING'; fi)"
    @echo "DB_DATABASE: $(if [ -n \"${DB_DATABASE}\" ]; then echo 'set'; else echo 'MISSING'; fi)"
