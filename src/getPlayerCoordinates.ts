import { readFileSync, readdirSync } from "fs";
import { saveEditorSavesPath } from "./config.js";
import { join } from "path";

function getPlayerCoordinates() {
  // Only include .json files
  const playerFiles = readdirSync(saveEditorSavesPath).filter((file) =>
    file.endsWith(".json")
  );

  const playerCoordinates = [];

  for (const file of playerFiles) {
    const filePath = join(saveEditorSavesPath, file);
    const fileContent = readFileSync(filePath, "utf-8");

    const playerData = JSON.parse(fileContent);

    playerCoordinates.push({
      x: Math.round(playerData.X),
      y: Math.round(playerData.Y),
      color: "red",
    });
  }

  return playerCoordinates;
}

export default getPlayerCoordinates;
