import { readFileSync } from "fs";

export type OptOutData = {
  liveStats: string[];
};

export const optOutJsonPath = "C:\\botData\\opt-out.json";

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
