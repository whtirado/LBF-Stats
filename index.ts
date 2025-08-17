import dotenv from "dotenv";
import cron from "node-cron";
import {
  discordActiveMembersChannelID,
  discordDinoPopulationChannelID,
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
import calculateDinoPercentages from "./src/calculateDinoPopulation.js";
import sendUpdatedDinoPopulation from "./src/sendUpdatedDinoPopulation.js";
import generatePopulationChartBuffer from "./src/generatePopulationChart.js";

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

  const channelDinoPopulation = (await client.channels.fetch(
    discordDinoPopulationChannelID
  )) as TextChannel;

  if (!mapChannel || !channelActiveMembers || !channelDinoPopulation) {
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

      deleteChannelMessages(channelDinoPopulation);

      const populationPercentages = calculateDinoPercentages(dinoPopulation);
      const chartBuffer: Buffer<ArrayBufferLike> =
        await generatePopulationChartBuffer(populationPercentages);

      // sendUpdatedDinoPopulation(channelDinoPopulation, populationPercentages);
      sendUpdatedDinoPopulation(channelDinoPopulation, chartBuffer);

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
