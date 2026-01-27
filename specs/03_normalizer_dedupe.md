# Spec: Normalizer + Dedupe (Component B)

## Purpose
Transform raw events into canonical format and prevent duplicate processing.

## Location
`src/normalizer.ts`

---

## Dedupe Key

**Canonical key**: `(signature, instruction_index)`

Two events with the same signature AND instruction_index are duplicates.

**Why both fields?**
- A single transaction can have multiple relevant instructions
- Each instruction should be processed exactly once
- Signature alone would miss multi-instruction transactions

---

## Interface

```typescript
export interface NormalizedEvent {
  id: string;  // UUID
  source: string;
  signature: string;
  slot: number;
  instruction_index: number;
  received_at: Date;
  event_type: "launch" | "wallet_action" | "quote" | "unknown";
  payload: unknown;
}

export interface NormalizeResult {
  event: NormalizedEvent | null;
  isDuplicate: boolean;
  dedupeKey: string;
}

export async function normalize(raw: RawEvent): Promise<NormalizeResult>;
```

---

## Implementation

```typescript
import { db } from "./db";

export async function normalize(raw: RawEvent): Promise<NormalizeResult> {
  const dedupeKey = `${raw.signature}:${raw.instruction_index}`;

  // Check if already exists
  const existing = await db.query(
    "SELECT id FROM raw_events WHERE signature = $1 AND instruction_index = $2",
    [raw.signature, raw.instruction_index]
  );

  if (existing.rows.length > 0) {
    return { event: null, isDuplicate: true, dedupeKey };
  }

  // Determine event type
  const eventType = classifyEventType(raw);

  // Create normalized event
  const event: NormalizedEvent = {
    id: crypto.randomUUID(),
    source: raw.source,
    signature: raw.signature,
    slot: raw.slot,
    instruction_index: raw.instruction_index,
    received_at: new Date(raw.received_at),
    event_type: eventType,
    payload: raw.payload,
  };

  // Insert to database
  await db.query(
    `INSERT INTO raw_events (source, signature, slot, instruction_index, received_at, payload_json)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (signature, instruction_index) DO NOTHING`,
    [event.source, event.signature, event.slot, event.instruction_index, event.received_at, JSON.stringify(event.payload)]
  );

  return { event, isDuplicate: false, dedupeKey };
}

function classifyEventType(raw: RawEvent): NormalizedEvent["event_type"] {
  // Check payload structure to determine type
  if (raw.payload?.type === "launch") return "launch";
  if (raw.payload?.type === "wallet_action") return "wallet_action";
  if (raw.payload?.type === "quote") return "quote";
  return "unknown";
}
```

---

## Database Constraint

The `raw_events` table must have a unique constraint:

```sql
CREATE TABLE raw_events (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  signature TEXT NOT NULL,
  slot BIGINT NOT NULL,
  instruction_index INT NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  payload_json JSONB NOT NULL,
  UNIQUE(signature, instruction_index)  -- Dedupe constraint
);
```

---

## Verification

### DB Integrity Check

```typescript
export async function checkDedupeIntegrity(): Promise<{ ok: boolean; duplicates: number }> {
  const result = await db.query(`
    SELECT signature, instruction_index, COUNT(*) as cnt
    FROM raw_events
    GROUP BY signature, instruction_index
    HAVING COUNT(*) > 1
  `);

  return {
    ok: result.rows.length === 0,
    duplicates: result.rows.length
  };
}
```

This should always return `{ ok: true, duplicates: 0 }`.

---

## Tests

```typescript
describe("normalizer", () => {
  test("first event is not duplicate", async () => {
    const raw = createTestEvent("sig1", 0);
    const result = await normalize(raw);
    expect(result.isDuplicate).toBe(false);
  });

  test("same event twice is duplicate", async () => {
    const raw = createTestEvent("sig2", 0);
    await normalize(raw);
    const result2 = await normalize(raw);
    expect(result2.isDuplicate).toBe(true);
  });

  test("same signature different instruction is not duplicate", async () => {
    const raw1 = createTestEvent("sig3", 0);
    const raw2 = createTestEvent("sig3", 1);
    await normalize(raw1);
    const result2 = await normalize(raw2);
    expect(result2.isDuplicate).toBe(false);
  });
});
```

---

## Integration with Signature Decoder

After normalization, if `event_type === "launch"`, run signature decoder:

```typescript
if (event.event_type === "launch") {
  const classifyResult = isBagsLaunchTx(event.payload);

  if (classifyResult.match) {
    await db.query(
      `INSERT INTO launches (mint, launch_signature, launch_slot, is_bags, signature_version)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (mint) DO NOTHING`,
      [extractMint(event.payload), event.signature, event.slot, true, "v1"]
    );
  }
}
```
