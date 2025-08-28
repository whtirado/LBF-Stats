import path from "path";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { discordGuildID } from "./config.js";

// Load environment variables from one directory above this file's location
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export function manageGems(
  memberDiscordId: string,
  gemAmount: number,
  reason?: string
) {
  const url = `https://unbelievaboat.com/api/v1/guilds/${discordGuildID}/users/${memberDiscordId}`;

  const requestOptions: any = {
    method: "PATCH",
    headers: {
      accept: "application/json",
      Authorization: process.env.UNBELIEVABOAT_TOKEN as string,
    },
    body: JSON.stringify({
      bank: gemAmount,
      reason: reason ? reason : "Gem update",
    }),
  };

  fetch(url, requestOptions)
    .then((response) => response.json())
    .catch((_) => {
      return;
    });
}
