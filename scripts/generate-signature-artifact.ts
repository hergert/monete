#!/usr/bin/env bun
// Generate bags_signature_v1.json artifact
// Extracts test vectors from fixtures and includes validation results

import { readdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { BAGS_FEE_SHARE_V1, METEORA_DBC } from "../src/signature";

const BAGS_FIXTURES_DIR = "data/fixtures/bags";
const NON_BAGS_FIXTURES_DIR = "data/fixtures/non_bags_dbc";
const VALIDATION_REPORT_PATH = "reports/signature_validation.json";
const OUTPUT_PATH = "bags_signature_v1.json";

interface FixtureMeta {
  signature: string;
  source?: string;
  collected_at?: string;
}

interface Fixture {
  _meta?: FixtureMeta;
  slot?: number;
  blockTime?: number;
}

interface ValidationReport {
  bags_should_match_n: number;
  bags_matched_n: number;
  non_bags_should_not_match_n: number;
  non_bags_matched_n: number;
  false_positive_rate: number;
  gate_passed: boolean;
  errors: string[];
}

function extractSignature(filePath: string): string | null {
  try {
    const data = JSON.parse(readFileSync(filePath, "utf-8")) as Fixture;
    return data._meta?.signature ?? null;
  } catch {
    return null;
  }
}

function loadFixtureSignatures(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  const signatures: string[] = [];
  for (const f of files) {
    const sig = extractSignature(join(dir, f));
    if (sig) {
      signatures.push(sig);
    }
  }
  return signatures;
}

function main() {
  // Extract test vectors from fixtures
  const bagsSignatures = loadFixtureSignatures(BAGS_FIXTURES_DIR);
  const nonBagsSignatures = loadFixtureSignatures(NON_BAGS_FIXTURES_DIR);

  // Load validation report
  let validationResults: ValidationReport | null = null;
  if (existsSync(VALIDATION_REPORT_PATH)) {
    validationResults = JSON.parse(readFileSync(VALIDATION_REPORT_PATH, "utf-8")) as ValidationReport;
  }

  // Build the artifact
  const artifact = {
    schema_version: "1.0.0",
    generated_at: new Date().toISOString(),
    programs: {
      fee_share_v1: {
        address: BAGS_FEE_SHARE_V1,
        description: "Bags Fee Share V1 - primary Bags differentiator",
        required: true,
      },
      fee_share_v2: {
        address: "FEE2tBhKAt7shrod19QttSVREUYPiyMzoku1mL1gqVK",
        description: "Bags Fee Share V2 - appears unused",
        required: false,
      },
      meteora_dbc: {
        address: METEORA_DBC,
        description: "Meteora Dynamic Bonding Curve - shared infra",
        required: true,
      },
      meteora_damm_v2: {
        address: "cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG",
        description: "Meteora DAMM v2 - post-migration pools",
        required: false,
      },
    },
    instruction_discriminators: {
      initialize_virtual_pool_with_spl_token: {
        description: "DBC pool initialization instruction",
        notes: "Anchor discriminator: sha256('global:initialize_virtual_pool_with_spl_token')[0..8]",
      },
    },
    required_account_roles: {
      pool_authority: {
        index: 0,
        description: "PDA that controls the pool, must be excluded from holder concentration checks",
      },
      quote_vault: {
        index: 7,
        description: "Vault holding quote token (SOL)",
      },
      base_vault: {
        index: 8,
        description: "Vault holding base token (meme token)",
      },
    },
    rules: {
      bags_launch_match: {
        logic: "AND",
        conditions: [
          {
            name: "has_fee_share_v1",
            description: "Transaction must contain Fee Share V1 program",
            program: BAGS_FEE_SHARE_V1,
          },
          {
            name: "has_dbc",
            description: "Transaction must contain Meteora DBC program",
            program: METEORA_DBC,
          },
        ],
        notes: "Fee Share V1 is the key differentiator - DBC alone causes false positives",
      },
    },
    denylist: {
      patterns: [],
      notes: "Known non-Bags DBC patterns that should be excluded. Currently empty - FP rate is 0%.",
    },
    test_vectors: {
      should_match: bagsSignatures,
      should_not_match: nonBagsSignatures,
    },
    validation_results: validationResults
      ? {
          bags_fixtures_n: validationResults.bags_should_match_n,
          bags_matched_n: validationResults.bags_matched_n,
          non_bags_fixtures_n: validationResults.non_bags_should_not_match_n,
          non_bags_matched_n: validationResults.non_bags_matched_n,
          false_positive_rate: validationResults.false_positive_rate,
          false_negative_rate:
            validationResults.bags_should_match_n > 0
              ? (validationResults.bags_should_match_n - validationResults.bags_matched_n) /
                validationResults.bags_should_match_n
              : 0,
          gate_passed: validationResults.gate_passed,
          coverage: {
            bags_coverage: validationResults.bags_should_match_n,
            non_bags_coverage: validationResults.non_bags_should_not_match_n,
          },
        }
      : null,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(artifact, null, 2));
  console.log(`Generated ${OUTPUT_PATH}`);
  console.log(`  - ${bagsSignatures.length} Bags test vectors`);
  console.log(`  - ${nonBagsSignatures.length} non-Bags test vectors`);
  if (validationResults) {
    console.log(`  - False positive rate: ${(validationResults.false_positive_rate * 100).toFixed(1)}%`);
    console.log(`  - Gate passed: ${validationResults.gate_passed}`);
  }
}

main();
