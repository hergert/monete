import { describe, test, expect } from "bun:test";
import { BAGS_FEE_SHARE_V1, METEORA_DBC } from "./signature";

describe("signature constants", () => {
  test("program IDs are defined", () => {
    expect(BAGS_FEE_SHARE_V1).toBe("FEEhPbKVKnco9EXnaY3i4R5rQVUx91wgVfu8qokixywi");
    expect(METEORA_DBC).toBe("dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN");
  });
});

// TODO: Add tests that load fixtures and verify classifier behavior
