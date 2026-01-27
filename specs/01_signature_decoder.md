# Spec: Signature Decoder (Component C)

## Purpose
Determine whether a Solana transaction is a Bags.fm token launch.

## Location
`src/signature.ts`

---

## Interface

```typescript
// Program IDs (constants)
export const BAGS_FEE_SHARE_V1 = "FEEhPbKVKnco9EXnaY3i4R5rQVUx91wgVfu8qokixywi";
export const METEORA_DBC = "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN";
export const METEORA_DAMM_V2 = "cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG";

export interface ClassifyResult {
  match: boolean;
  reasons: string[];  // e.g., ["has_fee_share_v1", "has_dbc", "has_dbc_init"]
}

// Extract all program IDs from a transaction
export function extractPrograms(tx: SolanaTransaction): Set<string>;

// Check if transaction contains DBC init instruction
export function hasDbcInit(tx: SolanaTransaction): boolean;

// Main classifier
export function isBagsLaunchTx(tx: SolanaTransaction): ClassifyResult;
```

---

## Classification Rules

A transaction is a **Bags launch** if ALL of the following are true:

1. **Has Fee Share V1 program**
   - `FEEhPbKVKnco9EXnaY3i4R5rQVUx91wgVfu8qokixywi` appears in `accountKeys`

2. **Has Meteora DBC program**
   - `dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN` appears in `accountKeys`

3. **Contains DBC init instruction**
   - One of the instructions targets the DBC program
   - The instruction is `initialize_virtual_pool_with_spl_token` (discriminator check preferred)

**Important**: DBC alone is NOT sufficient. Many platforms use Meteora DBC.

---

## Transaction Structure

Solana RPC returns transactions in this structure (simplified):

```typescript
interface SolanaTransaction {
  result: {
    transaction: {
      message: {
        accountKeys: string[];  // All accounts in the tx
        instructions: Array<{
          programIdIndex: number;  // Index into accountKeys
          accounts: number[];      // Indices into accountKeys
          data: string;            // Base58-encoded instruction data
        }>;
      };
    };
    meta: {
      err: null | object;
      innerInstructions: Array<{...}>;
    };
  };
}
```

---

## Implementation Steps

### 1. `extractPrograms(tx)`

```typescript
export function extractPrograms(tx: unknown): Set<string> {
  const programs = new Set<string>();

  // Get accountKeys from the transaction
  const accountKeys = tx?.result?.transaction?.message?.accountKeys;
  if (!Array.isArray(accountKeys)) return programs;

  // Get instructions
  const instructions = tx?.result?.transaction?.message?.instructions;
  if (!Array.isArray(instructions)) return programs;

  // Each instruction's programIdIndex points to the program
  for (const ix of instructions) {
    const programId = accountKeys[ix.programIdIndex];
    if (programId) programs.add(programId);
  }

  // Also check inner instructions
  const innerInstructions = tx?.result?.meta?.innerInstructions;
  if (Array.isArray(innerInstructions)) {
    for (const inner of innerInstructions) {
      for (const ix of inner.instructions || []) {
        const programId = accountKeys[ix.programIdIndex];
        if (programId) programs.add(programId);
      }
    }
  }

  return programs;
}
```

### 2. `hasDbcInit(tx)`

Two approaches (implement at least one):

**Approach A: Instruction discriminator**
- DBC `initialize_virtual_pool_with_spl_token` has a specific 8-byte discriminator
- Decode instruction data, check first 8 bytes
- More reliable but requires knowing the discriminator

**Approach B: Heuristic pattern**
- Check for DBC program instruction with sufficient account count (typically 15+)
- Less reliable but simpler to implement initially

```typescript
export function hasDbcInit(tx: unknown): boolean {
  const accountKeys = tx?.result?.transaction?.message?.accountKeys;
  const instructions = tx?.result?.transaction?.message?.instructions;

  if (!Array.isArray(accountKeys) || !Array.isArray(instructions)) {
    return false;
  }

  for (const ix of instructions) {
    const programId = accountKeys[ix.programIdIndex];
    if (programId === METEORA_DBC) {
      // Heuristic: DBC init has many accounts (15+)
      if (ix.accounts.length >= 15) {
        return true;
      }
      // TODO: Add discriminator check for more accuracy
    }
  }

  return false;
}
```

### 3. `isBagsLaunchTx(tx)`

```typescript
export function isBagsLaunchTx(tx: unknown): ClassifyResult {
  const reasons: string[] = [];

  const programs = extractPrograms(tx);

  const hasFeeShare = programs.has(BAGS_FEE_SHARE_V1);
  const hasDbc = programs.has(METEORA_DBC);
  const hasInit = hasDbcInit(tx);

  if (hasFeeShare) reasons.push("has_fee_share_v1");
  if (hasDbc) reasons.push("has_dbc");
  if (hasInit) reasons.push("has_dbc_init");

  const match = hasFeeShare && hasDbc && hasInit;

  return { match, reasons };
}
```

---

## Validation Gate

**File**: `bun run validate:signature`
**Output**: `reports/signature_validation.json`

**Pass criteria**:
- `bags_should_match_n >= 10`
- `non_bags_should_not_match_n >= 20`
- `false_positive_rate <= 0.05` (5%)

**False positive rate** = `non_bags_matched / non_bags_total`

---

## Output Artifact

**File**: `bags_signature_v1.json`

```json
{
  "version": "1.0.0",
  "created_at": "2024-01-27T12:00:00Z",
  "programs": {
    "fee_share_v1": "FEEhPbKVKnco9EXnaY3i4R5rQVUx91wgVfu8qokixywi",
    "meteora_dbc": "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN",
    "meteora_damm_v2": "cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG"
  },
  "rules": {
    "required_programs": ["fee_share_v1", "meteora_dbc"],
    "required_instructions": ["dbc_init"]
  },
  "test_vectors": {
    "should_match": ["sig1...", "sig2...", "..."],
    "should_not_match": ["sig3...", "sig4...", "..."]
  },
  "validation": {
    "bags_tested": 10,
    "non_bags_tested": 20,
    "false_positive_rate": 0.0
  }
}
```

---

## CLI Tool

**Command**: `bun run sig:check <path-to-tx.json>`

**Output**:
```
MATCH
Reasons: has_fee_share_v1, has_dbc, has_dbc_init
```
or
```
NO_MATCH
Reasons: has_dbc (missing: has_fee_share_v1)
```

---

## Tests

**File**: `src/signature.test.ts`

```typescript
import { describe, test, expect } from "bun:test";
import { isBagsLaunchTx, extractPrograms } from "./signature";
import { readdirSync, readFileSync } from "fs";

describe("signature decoder", () => {
  // Load all bags fixtures
  const bagsFixtures = readdirSync("data/fixtures/bags")
    .filter(f => f.endsWith(".json"))
    .map(f => ({
      name: f,
      tx: JSON.parse(readFileSync(`data/fixtures/bags/${f}`, "utf-8"))
    }));

  // Load all non-bags fixtures
  const nonBagsFixtures = readdirSync("data/fixtures/non_bags_dbc")
    .filter(f => f.endsWith(".json"))
    .map(f => ({
      name: f,
      tx: JSON.parse(readFileSync(`data/fixtures/non_bags_dbc/${f}`, "utf-8"))
    }));

  test("all bags fixtures should match", () => {
    for (const { name, tx } of bagsFixtures) {
      const result = isBagsLaunchTx(tx);
      expect(result.match).toBe(true);
    }
  });

  test("no non-bags fixtures should match", () => {
    let falsePositives = 0;
    for (const { name, tx } of nonBagsFixtures) {
      const result = isBagsLaunchTx(tx);
      if (result.match) falsePositives++;
    }
    const fpRate = falsePositives / nonBagsFixtures.length;
    expect(fpRate).toBeLessThanOrEqual(0.05);
  });
});
```
