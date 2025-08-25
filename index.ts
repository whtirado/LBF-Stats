import dotenv from "dotenv";
import cron from "node-cron";
import {
  discordMapChannelID,
  discordActiveMembersChannelID,
  discordDinoPopulationChannelID,
  discordAdminBunkerLiveMembersChannelID,
} from "./src/config.js";
import getPlayerSaves from "./src/getPlayerSaves.js";
import sendUpdatedImage from "./src/sendUpdatedImage.js";
import plotPlayerPoints from "./src/plotPlayerPoints.js";
import getActivePlayers from "./src/getActivePlayers.js";
import decryptPlayerSaves from "./src/decryptPlayerSaves.js";
import sendNoActiveMembers from "./src/sendNoActiveMembers.js";
import { Client, GatewayIntentBits, Partials, TextChannel } from "discord.js";
import { handleOptOutReaction } from "./src/optOut/optOutMember.js";
import sendUpdatedActiveMembers from "./src/sendUpdatedActiveMembers.js";
import calculateDinoPercentages from "./src/calculateDinoPopulation.js";
import sendUpdatedDinoPopulation from "./src/sendUpdatedDinoPopulation.js";
import generatePopulationChartBuffer from "./src/generatePopulationChart.js";
import plotPlayerPointsHighContrast from "./src/plotPlayerPointsHighContrast.js";
import sendUpdatedImageHighContrast from "./src/sendUpdatedImageHighContrast.js";
import getActivePlayersForAdmins from "./src/getActivePlayersForAdmins.js";
import { executeNode } from "./src/executeNode.js";

dotenv.config();

async function deleteChannelMessages(channel: TextChannel) {
  const fetched = await channel.messages.fetch({ limit: 100 });

  if (fetched.size) {
    await channel.bulkDelete(fetched, true);
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
  ],
});

client.once("ready", async () => {
  console.log(`Bot is online: LBF Stats`);

  const mapChannel = (await client.channels.fetch(
    discordMapChannelID
  )) as TextChannel;

  const channelActiveMembers = (await client.channels.fetch(
    discordActiveMembersChannelID
  )) as TextChannel;

  const channelDinoPopulation = (await client.channels.fetch(
    discordDinoPopulationChannelID
  )) as TextChannel;

  const channelAdminBunkerLiveMembers = (await client.channels.fetch(
    discordAdminBunkerLiveMembersChannelID
  )) as TextChannel;

  if (
    !mapChannel ||
    !channelActiveMembers ||
    !channelDinoPopulation ||
    !channelAdminBunkerLiveMembers
  ) {
    console.error("Channel not found or is not a text channel.");
    return;
  }

  const minutesSinceLastSave = 3;

  // The task to run (extracted so it can be scheduled)
  async function runTask() {
    try {
      executeNode("C:\\rcon\\commands\\saveServer.cjs");

      getPlayerSaves(minutesSinceLastSave);
      decryptPlayerSaves();

      const activeMembers = getActivePlayers();

      await plotPlayerPoints(activeMembers);
      await plotPlayerPointsHighContrast(activeMembers);
      await deleteChannelMessages(mapChannel);
      await sendUpdatedImageHighContrast(mapChannel);
      await sendUpdatedImage(mapChannel);

      await deleteChannelMessages(channelActiveMembers);

      const dinoPopulation: Record<string, any> = {};

      for (const member of activeMembers) {
        await sendUpdatedActiveMembers(channelActiveMembers, member);

        if (!(member.dino in dinoPopulation)) {
          dinoPopulation[member.dino] = 0;
        }

        dinoPopulation[member.dino] += 1;
      }

      if (activeMembers.length === 0) {
        sendNoActiveMembers(channelActiveMembers);
      }

      await deleteChannelMessages(channelDinoPopulation);

      const populationPercentages = calculateDinoPercentages(dinoPopulation);

      const chartBuffer: Buffer<ArrayBufferLike> =
        await generatePopulationChartBuffer(populationPercentages);

      await sendUpdatedDinoPopulation(channelDinoPopulation, chartBuffer);

      // send active members for admins
      await deleteChannelMessages(channelAdminBunkerLiveMembers);
      const activePlayersForAdmins = getActivePlayersForAdmins();

      for (const member of activePlayersForAdmins) {
        await sendUpdatedActiveMembers(channelAdminBunkerLiveMembers, member);
      }

      if (activePlayersForAdmins.length === 0) {
        sendNoActiveMembers(channelAdminBunkerLiveMembers);
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

client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;

  await handleOptOutReaction(reaction, user);
});

// client.on("messageReactionRemove", async (reaction, user) => {
//   if (user.bot) return;

//   await handleOptOutReactionRemove(reaction, user);
// });

client.login(process.env.DISCORD_TOKEN);
