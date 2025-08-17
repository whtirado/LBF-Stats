import { adminsSteamIDs } from "./config.js";

function isAdminSteamID(steamID: string) {
  return adminsSteamIDs.includes(steamID);
}

export default isAdminSteamID;
