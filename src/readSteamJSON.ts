import { readFileSync } from "fs";
import { steamJSONPath } from "./config.js";

export type PlayerSteamData = {
  name: string;
  linkedID: string;
  memberID: string;
  date: string;
};

export type SteamData = {
  accounts: Array<PlayerSteamData>;
};

function readSteamJSON(): SteamData {
  const steamData = readFileSync(steamJSONPath, "utf-8");

  if (steamData.length) {
    return JSON.parse(steamData);
  }

  return {} as SteamData;
}

export default readSteamJSON;
