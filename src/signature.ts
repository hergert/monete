// Bags signature classifier
// Detects Bags.fm launches by checking for Fee Share V1 + Meteora DBC programs

export const BAGS_FEE_SHARE_V1 = "FEEhPbKVKnco9EXnaY3i4R5rQVUx91wgVfu8qokixywi";
export const METEORA_DBC = "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN";

export interface ClassifyResult {
  match: boolean;
  reasons: string[];
}

interface TransactionMessage {
  accountKeys?: string[];
}

interface LoadedAddresses {
  writable?: string[];
  readonly?: string[];
}

interface InnerInstruction {
  programIdIndex?: number;
}

interface InnerInstructionGroup {
  instructions?: InnerInstruction[];
}

interface TransactionMeta {
  loadedAddresses?: LoadedAddresses;
  innerInstructions?: InnerInstructionGroup[];
}

interface ParsedTransaction {
  transaction?: {
    message?: TransactionMessage;
  };
  meta?: TransactionMeta;
}

/**
 * Extract all program IDs from a transaction
 * Includes programs from:
 * - transaction.message.accountKeys
 * - meta.loadedAddresses (versioned transactions)
 * - Programs invoked via innerInstructions
 */
export function extractPrograms(tx: unknown): Set<string> {
  const programs = new Set<string>();

  if (!tx || typeof tx !== "object") {
    return programs;
  }

  const parsed = tx as ParsedTransaction;

  // Get account keys from transaction message
  const accountKeys = parsed.transaction?.message?.accountKeys;
  if (Array.isArray(accountKeys)) {
    for (const key of accountKeys) {
      if (typeof key === "string") {
        programs.add(key);
      }
    }
  }

  // Get loaded addresses from meta (for versioned transactions)
  const loadedAddresses = parsed.meta?.loadedAddresses;
  if (loadedAddresses) {
    if (Array.isArray(loadedAddresses.writable)) {
      for (const key of loadedAddresses.writable) {
        if (typeof key === "string") {
          programs.add(key);
        }
      }
    }
    if (Array.isArray(loadedAddresses.readonly)) {
      for (const key of loadedAddresses.readonly) {
        if (typeof key === "string") {
          programs.add(key);
        }
      }
    }
  }

  // Note: innerInstructions reference accountKeys by index, so we don't need
  // to extract additional program IDs from them - they're already in accountKeys

  return programs;
}

/**
 * Check if transaction contains DBC init instruction
 * For now, we just check if DBC program is present.
 * A more rigorous check would decode the instruction discriminator.
 */
export function hasDbcInit(tx: unknown): boolean {
  const programs = extractPrograms(tx);
  return programs.has(METEORA_DBC);
}

/**
 * Main classifier: is this a Bags launch transaction?
 *
 * Bags launch criteria (from PLAN.md):
 * - Transaction contains Fee Share V1 program (Bags-specific)
 * - Transaction contains Meteora DBC program (shared infra)
 *
 * Fee Share V1 alone is the key differentiator - it's Bags-specific.
 * DBC alone is NOT sufficient (shared Meteora infra, causes false positives).
 */
export function isBagsLaunchTx(tx: unknown): ClassifyResult {
  const reasons: string[] = [];
  const programs = extractPrograms(tx);

  const hasFeeShareV1 = programs.has(BAGS_FEE_SHARE_V1);
  const hasDbc = programs.has(METEORA_DBC);

  if (hasFeeShareV1) {
    reasons.push("has_fee_share_v1");
  } else {
    reasons.push("missing_fee_share_v1");
  }

  if (hasDbc) {
    reasons.push("has_dbc");
  } else {
    reasons.push("missing_dbc");
  }

  // Match if BOTH Fee Share V1 AND DBC are present
  const match = hasFeeShareV1 && hasDbc;

  return { match, reasons };
}
