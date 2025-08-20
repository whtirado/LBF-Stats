import { writeFileSync } from "fs";
import readOptOut, { optOutJsonPath, type OptOutData } from "./readOptOut.js";

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
