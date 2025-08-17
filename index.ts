import dotenv from "dotenv";
import cron from "node-cron";
import {
  discordActiveMembersChannelID,
  discordMapChannelID,
} from "./src/config.js";
import getPlayerSaves from "./src/getPlayerSaves.js";
import sendUpdatedImage from "./src/sendUpdatedImage.js";
import plotPlayerPoints from "./src/plotPlayerPoints.js";
import getActivePlayers from "./src/getActivePlayers.js";
import decryptPlayerSaves from "./src/decryptPlayerSaves.js";
import sendNoActiveMembers from "./src/sendNoActiveMembers.js";
import { Client, GatewayIntentBits, TextChannel } from "discord.js";
import sendUpdatedActiveMembers from "./src/sendUpdatedActiveMembers.js";

dotenv.config();

async function deleteChannelMessages(channel: TextChannel) {
  const fetched = await channel.messages.fetch({ limit: 100 });

  if (fetched.size) {
    await channel.bulkDelete(fetched, true);
  }
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once("ready", async () => {
  console.log(`Bot is online: LBF Stats`);

  const mapChannel = (await client.channels.fetch(
    discordMapChannelID
  )) as TextChannel;

  const channelActiveMembers = (await client.channels.fetch(
    discordActiveMembersChannelID
  )) as TextChannel;

  if (!mapChannel || !channelActiveMembers) {
    console.error("Channel not found or is not a text channel.");
    return;
  }

  const minutesSinceLastSave = 10;

  // The task to run (extracted so it can be scheduled)
  async function runTask() {
    try {
      getPlayerSaves(minutesSinceLastSave);
      decryptPlayerSaves();

      const activeMembers = getActivePlayers();

      await plotPlayerPoints(activeMembers);
      await deleteChannelMessages(mapChannel);
      await sendUpdatedImage(mapChannel);

      await deleteChannelMessages(channelActiveMembers);

      for (const member of activeMembers) {
        await sendUpdatedActiveMembers(channelActiveMembers, member);
      }

      if (activeMembers.length === 0) {
        sendNoActiveMembers(channelActiveMembers);
      }

      console.log("Run completed:", new Date().toISOString());
    } catch (err) {
      console.error("Error during scheduled run:", err);
    }
  }

  // Run once immediately
  await runTask();

  // Schedule to run every 3 minutes: cron expression '*/3 * * * *'
  cron.schedule("*/3 * * * *", async () => {
    await runTask();
  });
});

client.login(process.env.DISCORD_TOKEN);
