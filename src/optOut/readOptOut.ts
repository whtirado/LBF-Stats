import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

export type OptOutData = {
  liveStats: string[];
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const optOutJsonPath = resolve(__dirname, "opt-out.json");

function readOptOut(): OptOutData {
  try {
    const raw = readFileSync(optOutJsonPath, "utf-8");
    const data = JSON.parse(raw) as OptOutData;

    return data;
  } catch (_) {
    return { liveStats: [] } as OptOutData;
  }
}

export default readOptOut;
