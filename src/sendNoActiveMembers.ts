import type { TextChannel } from "discord.js";
import { EmbedBuilder } from "discord.js";

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
