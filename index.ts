import dotenv from "dotenv";
import { discordChannelID } from "./src/config.js";
import { Client, GatewayIntentBits, TextChannel } from "discord.js";
import sendUpdatedImage from "./src/sendUpdatedImage.js";
import getPlayerSaves from "./src/getPlayerSaves.js";
import decryptPlayerSaves from "./src/decryptPlayerSaves.js";

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once("ready", async () => {
  console.log(`Bot is online: LBF Stats`);
  const channel = await client.channels.fetch(discordChannelID);

  if (channel && channel.isTextBased()) {
    const minutesSinceLastSave = 5;

    sendUpdatedImage(channel as TextChannel);
    getPlayerSaves();
    decryptPlayerSaves();
  } else {
    console.error("Channel not found or is not a text channel.");
  }
});

client.login(process.env.DISCORD_TOKEN);
