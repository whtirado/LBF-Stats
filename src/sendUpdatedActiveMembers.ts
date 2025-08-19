import { fileURLToPath } from "url";
import type { TextChannel } from "discord.js";
import isAdminSteamID from "./isAdminSteamID.js";
import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import plotPlayerSUSPoints from "./plotPlayerSUSPoints.js";

const susImage = fileURLToPath(new URL("../assets/sus.png", import.meta.url));

async function sendUpdatedActiveMembers(
  channel: TextChannel,
  member: Record<string, any>
) {
  // Format member data for description
  const memberCopy = JSON.parse(JSON.stringify(member));
  delete memberCopy.member;
  delete memberCopy.color;

  const embed = new EmbedBuilder();

  // Attach the local sus image and use it as the embed thumbnail
  const susAttachment = new AttachmentBuilder(susImage, { name: "sus.png" });

  // If we have a Discord user ID, try to fetch the user and use their avatar
  // as the embed thumbnail. Fail silently and continue if fetch fails.
  const userId = memberCopy.memberID?.toString?.();

  let isSus = false;
  let susAttachmentLocation;

  const isAdmin = isAdminSteamID(memberCopy.steamID);

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
        .setThumbnail(avatarUrl)
        .setColor(isAdminSteamID(memberCopy.steamID) ? 0xffff00 : 0x0099ff);
    } catch (err) {
      // SUS PLAYERS
      isSus = true;
      delete memberCopy.memberID;

      susAttachmentLocation = await plotPlayerSUSPoints(
        memberCopy.x,
        memberCopy.y
      );

      embed
        .setAuthor({ name: "Unknown" })
        .setThumbnail("attachment://sus.png")
        .setDescription("This player has not joined our discord")
        .addFields({
          name: "Profile Checker:",
          value: `https://www.steamidfinder.com/lookup/${memberCopy.steamID}/`,
        })
        .setImage("attachment://sus_player.png")
        .setColor(0xff0000);
    }
  }

  if (isAdmin) {
    memberCopy.admin = true;
  }

  if (isSus) {
    memberCopy.SUS = true;
  }

  delete memberCopy.x;
  delete memberCopy.y;

  const description = Object.entries(memberCopy).map(
    ([key, value]) => `**${key}:** ${value}`
  );

  embed.setTitle(description.join("\n")).setFooter({
    text: "Updated every 3 minutes. May be outdated by up to 10 minutes.",
  });

  await channel.send({
    embeds: [embed],
    files:
      isSus && susAttachmentLocation
        ? [susAttachment, susAttachmentLocation]
        : [],
  });
}

export default sendUpdatedActiveMembers;
