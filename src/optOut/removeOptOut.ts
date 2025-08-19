import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import readOptOut, { type OptOutData } from "./readOptOut.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const optOutJsonPath = resolve(__dirname, "opt-out.json");

function removeOptOut(entry: string): void {
  try {
    const data: OptOutData = readOptOut();

    const next = {
      ...data,
      liveStats: data.liveStats.filter((id) => id !== entry),
    } satisfies OptOutData;

    const payload = JSON.stringify(next, null, 2);
    writeFileSync(optOutJsonPath, payload, "utf-8");
  } catch (_) {
    // swallow errors to avoid crashing the bot; reading/writing failures are non-critical here
  }
}

export default removeOptOut;
