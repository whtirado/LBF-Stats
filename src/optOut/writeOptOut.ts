import { writeFileSync } from "fs";
import readOptOut, { optOutJsonPath, type OptOutData } from "./readOptOut.js";

function writeOptOut(entry: string): void {
  try {
    const data: OptOutData = readOptOut();

    if (!data.liveStats.includes(entry)) {
      data.liveStats.push(entry);
    }

    const payload = JSON.stringify(data, null, 2);

    writeFileSync(optOutJsonPath, payload, "utf-8");
  } catch (err) {}
}

export default writeOptOut;
