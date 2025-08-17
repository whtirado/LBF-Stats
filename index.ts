import dotenv from "dotenv";
import {
  discordActiveMembersChannelID,
  discordMapChannelID,
} from "./src/config.js";
import { Client, GatewayIntentBits, TextChannel } from "discord.js";
import sendUpdatedImage from "./src/sendUpdatedImage.js";
import getPlayerSaves from "./src/getPlayerSaves.js";
import decryptPlayerSaves from "./src/decryptPlayerSaves.js";
import plotPlayerPoints from "./src/plotPlayerPoints.js";
import getActivePlayers from "./src/getActivePlayers.js";
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

  if (mapChannel && channelActiveMembers) {
    await deleteChannelMessages(mapChannel);
    await sendUpdatedImage(mapChannel);

    const minutesSinceLastSave = 5;

    getPlayerSaves();
    // getPlayerSaves(minutesSinceLastSave);
    decryptPlayerSaves();

    const activeMembers = getActivePlayers();

    await plotPlayerPoints(activeMembers);

    await deleteChannelMessages(channelActiveMembers);

    for (const member of activeMembers) {
      await sendUpdatedActiveMembers(channelActiveMembers, member);
    }
  } else {
    console.error("Channel not found or is not a text channel.");
  }
});

client.login(process.env.DISCORD_TOKEN);
