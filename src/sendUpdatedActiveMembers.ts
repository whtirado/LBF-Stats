import { fileURLToPath } from "url";
import type { TextChannel } from "discord.js";
import { EmbedBuilder, AttachmentBuilder } from "discord.js";

const susImage = fileURLToPath(new URL("../assets/sus.png", import.meta.url));

async function sendUpdatedActiveMembers(
  channel: TextChannel,
  member: Record<string, any>
) {
  // Format member data for description
  const memberCopy = JSON.parse(JSON.stringify(member));
  delete memberCopy.x;
  delete memberCopy.y;
  delete memberCopy.member;

  const color = memberCopy.color?.toLowerCase?.();
  delete memberCopy.color;

  const colorMap: Record<string, number> = {
    yellow: 0xffff00,
    red: 0xff0000,
    green: 0x00ff00,
  };

  const embedColor = colorMap[color] || 0x0099ff;

  const embed = new EmbedBuilder();

  // Attach the local sus image and use it as the embed thumbnail
  const susAttachment = new AttachmentBuilder(susImage, { name: "sus.png" });

  // If we have a Discord user ID, try to fetch the user and use their avatar
  // as the embed thumbnail. Fail silently and continue if fetch fails.
  const userId = memberCopy.memberID?.toString?.();

  let isSus = false;

  if (userId) {
    try {
      const user = await channel.client.users.fetch(userId);
      const avatarUrl = user.displayAvatarURL({ extension: "png", size: 512 });

      memberCopy.username = user.username;

      // Use the local sus image as the thumbnail; keep the user's avatar as the author icon
      embed
        .setAuthor({
          name: user?.globalName || "Unknown",
          iconURL: avatarUrl,
        })
        .setThumbnail(avatarUrl);
    } catch (err) {
      isSus = true;
      // ignore fetch errors (invalid ID, bot not in mutual guilds, rate limits, etc.)
      // leave author as Unknown; we'll still attach and use the local sus thumbnail
      embed.setAuthor({ name: "Unknown" });
      embed.setThumbnail("attachment://sus.png");
    }
  }

  const description = Object.entries(memberCopy).map(
    ([key, value]) => `**${key}:** ${value}`
  );

  embed
    .setTitle(description.join("\n"))
    .setColor(embedColor)
    .setFooter({ text: "Updated every 3 minutes" });

  await channel.send({ embeds: [embed], files: isSus ? [susAttachment] : [] });
}

export default sendUpdatedActiveMembers;
