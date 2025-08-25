import { fileURLToPath } from "url";
import type { TextChannel } from "discord.js";
import { EmbedBuilder, AttachmentBuilder } from "discord.js";

const outputPath = fileURLToPath(
  new URL("../assets/output_high_contrast.png", import.meta.url)
);

async function sendUpdatedImageHighContrast(channel: TextChannel) {
  const imageAttachment = new AttachmentBuilder(outputPath);

  const embed = new EmbedBuilder()
    .setTitle("LBF Map Update (High Contrast)")
    .setDescription(
      "Click on map to enlarge.\n\nYellow:\nAdmin\n\nGreen:\nVerified on Discord\n\nRed:\nNot in our Discord (SUS)"
    )
    .setColor(0x0099ff)
    .setTimestamp()
    .setFooter({
      text: "Updated every 3 minutes. May be outdated by up to 3 minutes.",
    })
    .setImage("attachment://output_high_contrast.png");

  await channel.send({ embeds: [embed], files: [imageAttachment] });
}

export default sendUpdatedImageHighContrast;
