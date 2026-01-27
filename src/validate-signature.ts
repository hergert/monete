// Signature validation CLI
// Loads fixtures, runs classifier, writes report, exits non-zero if gate fails

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { isBagsLaunchTx } from "./signature";

const BAGS_FIXTURES_DIR = "data/fixtures/bags";
const NON_BAGS_FIXTURES_DIR = "data/fixtures/non_bags_dbc";
const REPORT_PATH = "reports/signature_validation.json";

// Gate thresholds
const MIN_BAGS_MATCHES = 10;
const MIN_NON_BAGS_MATCHES = 20;
const MAX_FALSE_POSITIVE_RATE = 0.05;

interface ValidationReport {
  bags_should_match_n: number;
  bags_matched_n: number;
  non_bags_should_not_match_n: number;
  non_bags_matched_n: number;
  false_positive_rate: number;
  gate_passed: boolean;
  errors: string[];
}

function loadFixtures(dir: string): { name: string; tx: unknown }[] {
  if (!existsSync(dir)) {
    return [];
  }
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  return files.map((f) => ({
    name: f,
    tx: JSON.parse(readFileSync(join(dir, f), "utf-8")),
  }));
}

function main() {
  const bagsFixtures = loadFixtures(BAGS_FIXTURES_DIR);
  const nonBagsFixtures = loadFixtures(NON_BAGS_FIXTURES_DIR);

  const errors: string[] = [];
  let bagsMatched = 0;
  let nonBagsMatched = 0;

  // Test bags fixtures (should all match)
  for (const { name, tx } of bagsFixtures) {
    try {
      const result = isBagsLaunchTx(tx);
      if (result.match) {
        bagsMatched++;
      } else {
        errors.push(`bags/${name}: expected MATCH, got NO_MATCH (${result.reasons.join(", ")})`);
      }
    } catch (e) {
      errors.push(`bags/${name}: error - ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // Test non-bags fixtures (should NOT match)
  for (const { name, tx } of nonBagsFixtures) {
    try {
      const result = isBagsLaunchTx(tx);
      if (result.match) {
        nonBagsMatched++;
        errors.push(`non_bags_dbc/${name}: expected NO_MATCH, got MATCH (${result.reasons.join(", ")})`);
      }
    } catch (e) {
      errors.push(`non_bags_dbc/${name}: error - ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const falsePositiveRate = nonBagsFixtures.length > 0 ? nonBagsMatched / nonBagsFixtures.length : 0;

  const gatePassed =
    bagsFixtures.length >= MIN_BAGS_MATCHES &&
    nonBagsFixtures.length >= MIN_NON_BAGS_MATCHES &&
    bagsMatched === bagsFixtures.length &&
    falsePositiveRate <= MAX_FALSE_POSITIVE_RATE;

  const report: ValidationReport = {
    bags_should_match_n: bagsFixtures.length,
    bags_matched_n: bagsMatched,
    non_bags_should_not_match_n: nonBagsFixtures.length,
    non_bags_matched_n: nonBagsMatched,
    false_positive_rate: falsePositiveRate,
    gate_passed: gatePassed,
    errors: errors.slice(0, 20), // Limit error output
  };

  // Ensure reports directory exists
  if (!existsSync("reports")) {
    mkdirSync("reports", { recursive: true });
  }

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  if (!gatePassed) {
    console.error("\nGate FAILED:");
    if (bagsFixtures.length < MIN_BAGS_MATCHES) {
      console.error(`  - Need ${MIN_BAGS_MATCHES} bags fixtures, have ${bagsFixtures.length}`);
    }
    if (nonBagsFixtures.length < MIN_NON_BAGS_MATCHES) {
      console.error(`  - Need ${MIN_NON_BAGS_MATCHES} non-bags fixtures, have ${nonBagsFixtures.length}`);
    }
    if (bagsMatched !== bagsFixtures.length) {
      console.error(`  - ${bagsFixtures.length - bagsMatched} bags fixtures failed to match`);
    }
    if (falsePositiveRate > MAX_FALSE_POSITIVE_RATE) {
      console.error(`  - False positive rate ${(falsePositiveRate * 100).toFixed(1)}% exceeds ${MAX_FALSE_POSITIVE_RATE * 100}%`);
    }
    process.exit(1);
  }

  console.log("\nGate PASSED");
  process.exit(0);
}

main();
