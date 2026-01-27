# Spec: Ingestion Layer (Component A)

## Purpose
Receive Solana transaction events and forward them to the normalizer.

## Location
`src/ingestion/`

---

## Modes

### Replay Mode (Required for E2E)

**File**: `src/ingestion/replay.ts`

Reads events from `data/replay/events.jsonl` and emits them in order.

```typescript
export interface ReplayOptions {
  eventsFile: string;  // default: "data/replay/events.jsonl"
  onEvent: (event: RawEvent) => Promise<void>;
}

export async function runReplay(options: ReplayOptions): Promise<ReplaySummary>;
```

**Implementation**:
1. Open events file
2. Read line by line
3. Parse JSON
4. Call `onEvent` for each event
5. Return summary (events processed, errors)

### Live Mode (Optional, not required for completion)

**File**: `src/ingestion/live.ts`

Connects to Helius WebSocket and streams transactions.

```typescript
export interface LiveOptions {
  heliusApiKey: string;
  programs: string[];  // Program IDs to filter
  onEvent: (event: RawEvent) => Promise<void>;
}

export async function runLive(options: LiveOptions): Promise<void>;
```

**Not required for Ralph completion** but should be stubbed.

---

## Raw Event Format

```typescript
export interface RawEvent {
  source: "replay" | "websocket" | "webhook";
  received_at: string;  // ISO timestamp
  signature: string;
  slot: number;
  instruction_index: number;
  payload: unknown;  // Full transaction JSON
}
```

---

## Replay File Format

`data/replay/events.jsonl` (JSON Lines):

```jsonl
{"type":"launch","timestamp":"2024-01-27T10:00:00Z","signature":"abc...","slot":123456,"instruction_index":0,"data":{...}}
{"type":"wallet_action","timestamp":"2024-01-27T10:00:01Z","signature":"def...","slot":123457,"instruction_index":1,"data":{...}}
```

Each line is a complete JSON object.

---

## CLI Commands

### `bun run ingest:replay`

Runs replay ingestion:
1. Reads `data/replay/events.jsonl`
2. Normalizes and dedupes
3. Writes to database
4. Prints summary

```typescript
// src/ingest-replay.ts
import { runReplay } from "./ingestion/replay";
import { normalize } from "./normalizer";
import { db } from "./db";

async function main() {
  await db.migrate();

  let processed = 0;
  let duplicates = 0;

  await runReplay({
    eventsFile: "data/replay/events.jsonl",
    onEvent: async (event) => {
      const result = await normalize(event);
      if (result.isDuplicate) {
        duplicates++;
      } else {
        processed++;
      }
    }
  });

  console.log(`Processed: ${processed}, Duplicates: ${duplicates}`);
}
```

---

## Error Handling

- Invalid JSON lines: log warning, skip, continue
- Missing required fields: log warning, skip, continue
- Database errors: log error, abort

---

## Tests

```typescript
describe("replay ingestion", () => {
  test("processes all events from file", async () => {
    const events: RawEvent[] = [];

    await runReplay({
      eventsFile: "data/replay/events.jsonl",
      onEvent: async (e) => events.push(e)
    });

    expect(events.length).toBeGreaterThan(0);
  });

  test("handles empty file gracefully", async () => {
    // Create temp empty file, run replay, expect 0 events
  });
});
```
