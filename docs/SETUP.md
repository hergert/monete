# Setup Checklist

## Technical Decisions

| Decision | Choice |
|----------|--------|
| Language | TypeScript |
| Runtime | Bun |
| Database | Postgres |
| Approach | Research first, then code |

---

## Phase 0: Research (Before Any Code)

### 1. Helius Account
- [ ] Sign up at https://helius.dev
- [ ] Get API key (free tier is fine initially)
- [ ] Note: Free tier = 30 requests/sec, 100k credits/day
- [ ] Test: `curl https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`

### 2. Collect Bags Token Data (Manual)
- [ ] Go to bags.fm
- [ ] Collect 20+ token mint addresses from recent launches
- [ ] Save to `data/bags_tokens.json`
- [ ] Note any patterns in the UI (metadata, links, etc.)

### 3. Find Bags SDK / Program IDs
- [ ] Locate Bags SDK GitHub repo
- [ ] Document program IDs:
  - [ ] DBC program ID
  - [ ] DAMM v2 program ID
  - [ ] Fee Share V2 program ID
- [ ] Find IDL files for instruction decoding
- [ ] Save references to `data/bags_programs.json`

### 4. Analyze Sample Transactions
- [ ] Pick 3-5 collected tokens
- [ ] Query creation tx via Helius: `getTransaction`
- [ ] Save raw tx JSON to `data/sample_txs/`
- [ ] Manually identify:
  - [ ] Which program is called
  - [ ] What instruction is used
  - [ ] Which accounts are Bags-specific
  - [ ] Fee Share config presence

### 5. Find Non-Bags DBC Launches (False Positive Set)
- [ ] Research other projects using Meteora DBC
- [ ] Collect 5-10 token addresses
- [ ] Save to `data/non_bags_dbc.json`

### 6. Document Findings
- [ ] Create `data/signature_research.md` with:
  - [ ] Confirmed program IDs
  - [ ] Instruction discriminators observed
  - [ ] Account position patterns
  - [ ] Differentiation factors vs non-Bags

---

## Phase 0: Dev Environment (After Research)

### 7. Bun + TypeScript Setup
- [ ] Install Bun: `curl -fsSL https://bun.sh/install | bash`
- [ ] `bun init`
- [ ] Configure tsconfig.json
- [ ] Add dependencies:
  ```bash
  bun add @solana/web3.js @coral-xyz/anchor helius-sdk
  ```

### 8. Solana CLI (For Later Testing)
- [ ] Install: `sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"`
- [ ] Generate dev keypair: `solana-keygen new --outfile ~/.config/solana/monenete.json`
- [ ] **DO NOT fund** — only needed for Phase 2

---

## Phase 1 Prerequisites (Before Paper Trading)

### 9. Jupiter SDK
- [ ] `bun add @jup-ag/api`
- [ ] Test quote fetching works

### 10. Database
- [ ] Postgres running (local Docker or cloud)
- [ ] Schema created (from PLAN.md data model)

### 11. Helius WebSocket Access
- [ ] Confirm plan tier supports Enhanced WebSockets
- [ ] Or implement webhook fallback

---

## Phase 2 Prerequisites (Before Live Trading)

### 12. Funded Wallet
- [ ] Transfer $500 + ~$20 buffer for fees
- [ ] **Security**: Dedicated wallet, never main wallet
- [ ] Consider hardware wallet for key storage

### 13. Helius Upgrade (If Needed)
- [ ] Monitor usage during Phase 1
- [ ] Developer tier ~$50/mo if hitting limits

---

## Security Checklist

- [ ] Private key NEVER in code or git
- [ ] Use environment variables for all API keys
- [ ] `.env` in `.gitignore` (already done)
- [ ] Separate wallet for trading (not personal funds)
- [ ] Transaction simulation before real executes

---

## Environment Variables Template

```bash
# .env (DO NOT COMMIT)
HELIUS_API_KEY=your_helius_key
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
BIRDEYE_API_KEY=your_birdeye_key
SOLANA_KEYPAIR_PATH=/path/to/monenete.json
DATABASE_URL=postgresql://user:pass@localhost:5432/monenete
```

---

## Data Directory Structure

```
data/
├── bags_tokens.json        # Collected Bags token addresses
├── bags_programs.json      # Program IDs and references
├── non_bags_dbc.json       # False positive test set
├── signature_research.md   # Analysis findings
└── sample_txs/             # Raw transaction JSON
    ├── token1.json
    ├── token2.json
    └── ...
```
