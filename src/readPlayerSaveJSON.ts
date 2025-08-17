import { readFileSync } from "fs";

function readPlayerSaveJSON(filePath: string) {
  try {
    const data = readFileSync(filePath, "utf-8");

    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

export default readPlayerSaveJSON;
