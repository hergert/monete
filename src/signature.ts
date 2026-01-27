// Bags signature classifier
// The agent will implement this

export const BAGS_FEE_SHARE_V1 = "FEEhPbKVKnco9EXnaY3i4R5rQVUx91wgVfu8qokixywi";
export const METEORA_DBC = "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN";

export interface ClassifyResult {
  match: boolean;
  reasons: string[];
}

/**
 * Extract all program IDs from a transaction
 */
export function extractPrograms(tx: unknown): Set<string> {
  // TODO: Implement
  throw new Error("Not implemented: extractPrograms");
}

/**
 * Check if transaction contains DBC init instruction
 */
export function hasDbcInit(tx: unknown): boolean {
  // TODO: Implement
  throw new Error("Not implemented: hasDbcInit");
}

/**
 * Main classifier: is this a Bags launch transaction?
 */
export function isBagsLaunchTx(tx: unknown): ClassifyResult {
  // TODO: Implement
  throw new Error("Not implemented: isBagsLaunchTx");
}
