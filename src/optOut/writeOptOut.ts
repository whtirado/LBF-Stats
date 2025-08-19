import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import readOptOut, { type OptOutData } from "./readOptOut.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const optOutJsonPath = resolve(__dirname, "opt-out.json");

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
