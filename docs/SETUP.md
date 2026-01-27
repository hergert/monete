# Setup Checklist

## Phase 0 Prerequisites (Before Any Code)

### 1. Helius Account
- [ ] Sign up at https://helius.dev
- [ ] Get API key (free tier is fine initially)
- [ ] Note: Free tier = 30 requests/sec, 100k credits/day
- [ ] Test: `curl https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`

### 2. Solana Wallet (Dev/Test)
- [ ] Install Solana CLI: `sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"`
- [ ] Generate keypair: `solana-keygen new --outfile ~/.config/solana/monenete.json`
- [ ] Get public key: `solana-keygen pubkey ~/.config/solana/monenete.json`
- [ ] **DO NOT fund yet** - only needed for Phase 2

### 3. Birdeye API (Optional for Phase 0)
- [ ] Sign up at https://birdeye.so
- [ ] Navigate to API section, generate key
- [ ] Check rate limits / pricing
- [ ] Fallback: manual data collection if API is restrictive

### 4. Development Environment
- [ ] Node.js 18+ or Bun
- [ ] TypeScript setup
- [ ] Git repo (done)

---

## Phase 1 Prerequisites (Before Paper Trading)

### 5. Jupiter SDK
- [ ] Install: `npm install @jup-ag/api`
- [ ] No API key needed (public endpoints)
- [ ] Test quote fetching works

### 6. Bags SDK / IDLs
- [ ] Clone or reference Bags SDK repo (for instruction decoding)
- [ ] Extract IDL for DBC interactions
- [ ] Test instruction parsing

---

## Phase 2 Prerequisites (Before Live Trading)

### 7. Funded Wallet
- [ ] Transfer $500 + ~$20 buffer for fees to trading wallet
- [ ] **Security**: Use dedicated wallet, never main wallet
- [ ] Consider hardware wallet for key storage

### 8. Helius Upgrade (If Needed)
- [ ] Monitor usage during Phase 1
- [ ] Upgrade to paid tier if hitting limits
- [ ] Developer tier ~$50/mo

---

## Security Checklist

- [ ] Private key NEVER in code or git
- [ ] Use environment variables for all API keys
- [ ] `.env` in `.gitignore`
- [ ] Separate wallet for trading (not personal funds)
- [ ] Set up transaction simulation before real executes

---

## Environment Variables Template

```bash
# .env (DO NOT COMMIT)
HELIUS_API_KEY=your_helius_key
BIRDEYE_API_KEY=your_birdeye_key
SOLANA_KEYPAIR_PATH=/path/to/monenete.json
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```
