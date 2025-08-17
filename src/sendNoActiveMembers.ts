import { fileURLToPath } from "url";
import type { TextChannel } from "discord.js";
import { EmbedBuilder, AttachmentBuilder } from "discord.js";

const outputPath = fileURLToPath(
  new URL("../assets/output.png", import.meta.url)
);

async function sendNoActiveMembers(channel: TextChannel) {
  const embed = new EmbedBuilder()
    .setTitle("LBF Active Members")
    .setDescription("No members detected online.")
    .setColor(0x0099ff)
    .setFooter({ text: "Updated every 3 minutes" })
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}

export default sendNoActiveMembers;
