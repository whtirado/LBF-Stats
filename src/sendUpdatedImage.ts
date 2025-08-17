import { fileURLToPath } from "url";
import type { TextChannel } from "discord.js";
import { EmbedBuilder, AttachmentBuilder } from "discord.js";

const outputPath = fileURLToPath(
  new URL("../assets/output.png", import.meta.url)
);

async function sendUpdatedImage(channel: TextChannel) {
  const imageAttachment = new AttachmentBuilder(outputPath);

  const embed = new EmbedBuilder()
    .setTitle("LBF Map Update")
    .setDescription("Click on map to enlarge.")
    .setColor(0x0099ff)
    .setTimestamp()
    .setFooter({ text: "Updated every 3 minutes" })
    .setImage("attachment://output.png");

  await channel.send({ embeds: [embed], files: [imageAttachment] });
}

export default sendUpdatedImage;
