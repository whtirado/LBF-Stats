import { join } from "path";
import { readdirSync } from "fs";
import isAdminSteamID from "./isAdminSteamID.js";
import readPlayerSaveJSON from "./readPlayerSaveJSON.js";
import { dinoTypes, saveEditorSavesPath } from "./config.js";
import readSteamJSON, { type SteamData } from "./readSteamJSON.js";
import { stringUnknown } from "./strings.js";

export function processDinoPointColor(dinoType: string): string {
  const dinoColors: Record<string, string> = {
    herbivore: "green",
    carnivore: "red",
    omnivore: "yellow",
  };

  return dinoColors[dinoType] || stringUnknown;
}

function getActivePlayersForAdmins() {
  const files = readdirSync(saveEditorSavesPath).filter((file) =>
    file.endsWith(".json")
  );

  const activeMembers: Record<string, any>[] = [];

  const discordMembers: SteamData = readSteamJSON();

  for (const file of files) {
    const playerData = readPlayerSaveJSON(join(saveEditorSavesPath, file));

    if (playerData && playerData.Class) {
      const dino = playerData.Class.split("/")[6];
      const dinoType = dinoTypes[dino] || stringUnknown;
      const steamID = playerData.SteamId;

      const discordMember = discordMembers.accounts.find(
        (member) => member.linkedID === steamID
      );

      activeMembers.push({
        steamID,
        dino,
        type: dinoType,
        color: processDinoPointColor(dinoType),
        member: discordMember?.name || stringUnknown,
        memberID: discordMember?.memberID || stringUnknown,
        x: Math.round(playerData.X),
        y: Math.round(playerData.Y),
      });
    }
  }

  const knownMembers = activeMembers.filter(
    (m) => m.member !== stringUnknown && !isAdminSteamID(m.steamID)
  );

  const adminMembers = activeMembers.filter((m) => isAdminSteamID(m.steamID));
  const unknownMembers = activeMembers.filter(
    (m) => m.member === stringUnknown
  );

  const sortedActiveMembers = [
    ...adminMembers,
    ...knownMembers,
    ...unknownMembers,
  ];

  return sortedActiveMembers;
}

export default getActivePlayersForAdmins;
