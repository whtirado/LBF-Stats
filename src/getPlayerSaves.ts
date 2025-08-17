import { join } from "path";
import { mkdirSync, readdirSync, copyFileSync, statSync, unlinkSync } from "fs";
import { saveFilesPath, saveEditorSavesPath } from "./config.js";

function deleteSaveFiles() {
  try {
    const existing = readdirSync(saveEditorSavesPath);

    for (const f of existing) {
      const p = join(saveEditorSavesPath, f);

      try {
        unlinkSync(p);
      } catch (e) {
        console.error(`Failed to remove ${p}:`, e);
      }
    }
  } catch (e) {
    console.error(`Could not read destination dir ${saveEditorSavesPath}:`, e);
  }
}

function getPlayerSaves(minutesSinceLastSave?: number) {
  try {
    // Ensure destination directory exists
    mkdirSync(saveEditorSavesPath, { recursive: true });

    // Read all files in the source directory
    const files = readdirSync(saveFilesPath);

    // Copy only .sav files to the destination directory
    let copied = 0;

    const now = Date.now();

    deleteSaveFiles();

    for (const file of files) {
      if (
        file.endsWith(".sav") &&
        file !== "SpawnIds.sav" &&
        file !== "Global.sav"
      ) {
        const src = join(saveFilesPath, file);
        const dest = join(saveEditorSavesPath, file);

        try {
          if (minutesSinceLastSave) {
            const stats = statSync(src);
            const minutes = minutesSinceLastSave * 60 * 1000;

            if (now - stats.mtimeMs <= minutes) {
              copyFileSync(src, dest);
              copied++;
            }
          } else {
            copyFileSync(src, dest);
            copied++;
          }
        } catch (e) {
          console.error(`Could not stat file ${src}:`, e);
        }
      }
    }
  } catch (err) {
    console.error("Error copying player saves:", err);
  }
}

export default getPlayerSaves;
