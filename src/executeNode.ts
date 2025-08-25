import { spawnSync } from "child_process";

export function executeNode(filePath: string) {
  return spawnSync("node", [filePath], {
    stdio: "inherit",
    shell: false,
  });
}
