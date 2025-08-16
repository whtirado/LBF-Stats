import type { TextChannel } from "discord.js";
import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import readSteamJSON, {
  type PlayerSteamData,
  type SteamData,
} from "./readSteamJSON.js";

async function sendUpdatedImage(channel: TextChannel) {
  const imageAttachment = new AttachmentBuilder("assets/image.png");

  const embed = new EmbedBuilder()
    .setTitle("LBF Map Update")
    .setDescription("Click on map to enlarge.")
    .setColor(0x0099ff)
    .setTimestamp()
    .setImage("attachment://image.png");

  await channel.send({ embeds: [embed], files: [imageAttachment] });
}

export default sendUpdatedImage;
