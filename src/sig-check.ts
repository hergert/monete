// Manual signature check CLI
// Usage: bun run sig:check <path-to-tx.json>

import { readFileSync } from "fs";
import { isBagsLaunchTx } from "./signature";

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: bun run sig:check <path-to-tx.json>");
    process.exit(1);
  }

  const txPath = args[0];

  try {
    const txData = JSON.parse(readFileSync(txPath!, "utf-8"));
    const result = isBagsLaunchTx(txData);

    console.log(result.match ? "MATCH" : "NO_MATCH");
    console.log("Reasons:", result.reasons.join(", ") || "(none)");

    process.exit(result.match ? 0 : 1);
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : String(e));
    process.exit(2);
  }
}

main();
