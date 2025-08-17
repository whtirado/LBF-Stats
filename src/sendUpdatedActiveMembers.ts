import { fileURLToPath } from "url";
import type { TextChannel } from "discord.js";
import { EmbedBuilder, AttachmentBuilder } from "discord.js";

const outputPath = fileURLToPath(
  new URL("../assets/output.png", import.meta.url)
);

async function sendUpdatedActiveMembers(
  channel: TextChannel,
  member: Record<string, any>
) {
  // Format member data for description
  const memberCopy = JSON.parse(JSON.stringify(member));
  delete memberCopy.x;
  delete memberCopy.y;

  const color = memberCopy.color?.toLowerCase?.();
  delete memberCopy.color;

  const description = Object.entries(memberCopy).map(
    ([key, value]) => `**${key}:** ${value}`
  );

  const colorMap: Record<string, number> = {
    yellow: 0xffff00,
    red: 0xff0000,
    green: 0x00ff00,
  };

  const embedColor = colorMap[color] || 0x0099ff;

  const embed = new EmbedBuilder()
    .setTitle(description.join("\n"))
    .setColor(embedColor);

  // If we have a Discord user ID, try to fetch the user and use their avatar
  // as the embed thumbnail. Fail silently and continue if fetch fails.
  const userId = memberCopy.memberID?.toString?.();

  if (userId) {
    try {
      const user = await channel.client.users.fetch(userId);
      const avatarUrl = user.displayAvatarURL({ extension: "png", size: 512 });

      embed.setThumbnail(avatarUrl);
      embed.setAuthor({ name: `${memberCopy.member}`, iconURL: avatarUrl });
    } catch (err) {
      // ignore fetch errors (invalid ID, bot not in mutual guilds, rate limits, etc.)
      // leave embed without thumbnail
    }
  }

  await channel.send({ embeds: [embed] });
}

export default sendUpdatedActiveMembers;
