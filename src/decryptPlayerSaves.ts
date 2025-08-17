import { join } from "path";
import { readdirSync } from "fs";
import { spawnSync } from "child_process";
import { saveEditorSavesPath, saveEditorExePath } from "./config.js";

function decryptPlayerSaves() {
  try {
    // Read all files in the save editor saves directory
    const files = readdirSync(saveEditorSavesPath);

    let decrypted = 0;

    for (const file of files) {
      if (
        file.endsWith(".sav") &&
        file !== "SpawnIds.sav" &&
        file !== "Global.sav"
      ) {
        const filePath = join(saveEditorSavesPath, file);

        const result = spawnSync(saveEditorExePath, ["decrypt", filePath], {
          stdio: "inherit",
        });

        if (result.error) {
          console.error(`Failed to decrypt ${file}:`, result.error);
        } else if (result.status === 0) {
          decrypted++;
        } else {
          console.error(
            `Decryption process for ${file} exited with code ${result.status}`
          );
        }
      }
    }
  } catch (err) {
    console.error("Error decrypting player saves:", err);
  }
}

export default decryptPlayerSaves;
