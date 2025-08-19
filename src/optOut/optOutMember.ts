import { MessageReaction, User } from "discord.js";
import type { PartialMessageReaction, PartialUser } from "discord.js";
import {
  adminDiscordIDs,
  discordOptOutMessageID,
  greenCircleEmoji,
  redCircleEmoji,
  noEntryEmoji,
  liveStatsOptOutRoleID,
} from "../config.js";
import writeOptOut from "./writeOptOut.js";
import removeOptOut from "./removeOptOut.js";
import notifyGnome from "./notifyGnome.js";
import isMemberTenure from "./isMemberTenure.js";
import addMemberRole from "./addMemberRole.js";

export function isMemberAdmin(userID: string): boolean {
  return adminDiscordIDs.includes(userID);
}

export async function handleOptOutReaction(
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser
): Promise<void> {
  const messageHeader = `<@${user.id}> [${user.displayName}, ${user.username}]`;

  try {
    if (reaction.partial) await reaction.fetch();
    const message = reaction.message;

    if (message.id !== discordOptOutMessageID) return;

    const isThumbsUp = reaction.emoji.name === noEntryEmoji;

    if (!isThumbsUp) return;

    if (isMemberAdmin(user.id)) {
      await user.send(
        `${redCircleEmoji} Nice try. As LBF staff, you can't opt out of Live Stats.`
      );

      // Notify a specific member when someone opts out (if configured)
      await notifyGnome(
        message.guild,
        `${messageHeader} has tried to opt out of Live Stats.`
      );

      return;
    }

    // Enforce minimum membership tenure (30 days) before allowing opt-out
    const minDays = 30;
    const guild = message.guild;
    const days = await isMemberTenure(guild, user.id);

    if (days === null) {
      await user.send(
        `${redCircleEmoji} We couldn't verify how long you've been in the server. Please try again later or contact staff.`
      );

      return;
    }

    if (days < minDays) {
      const remaining = minDays - days;

      await user.send(
        `${redCircleEmoji} You must be a member for at least ${minDays} days to opt out. You have been a member for ${days} day${
          days === 1 ? "" : "s"
        }. Please wait ${remaining} more day${remaining === 1 ? "" : "s"}.`
      );

      await notifyGnome(
        guild,
        `${messageHeader} Opt-out blocked: only ${days} day${
          days === 1 ? "" : "s"
        } in server (min 30).`
      );

      return;
    }

    // Only non-bot users will call this (checked by caller)
    writeOptOut(user.id);

    // Give the user the opt-out role in Discord (best-effort)
    await addMemberRole(message.guild, user.id, liveStatsOptOutRoleID);

    // DM user and say that they have opted out of Live Stats
    await user.send(`${redCircleEmoji} You have opted out of Live Stats.`);

    // Notify a specific member when someone opts out (if configured)
    await notifyGnome(
      message.guild,
      `${messageHeader} has opted out of Live Stats.`
    );
  } catch (err) {
    await user.send(
      `${redCircleEmoji} Sorry, an error has prevented you from opting out of Live Stats. Please contact staff.`
    );
  }
}

export async function handleOptOutReactionRemove(
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser
): Promise<void> {
  const messageHeader = `<@${user.id}> [${user.displayName}, ${user.username}]`;

  try {
    if (reaction.partial) await reaction.fetch();
    const message = reaction.message;

    if (message.id !== discordOptOutMessageID) return;

    const isThumbsUp = reaction.emoji.name === noEntryEmoji;

    if (!isThumbsUp) return;

    if (isMemberAdmin(user.id)) {
      return;
    }

    // Only non-bot users will call this (checked by caller)
    removeOptOut(user.id);

    // DM user and say that they have opted out of Live Stats
    await user.send(
      `${greenCircleEmoji} Thank you! You have opted in to Live Stats.`
    );

    // Notify a specific member when someone opts out (if configured)
    await notifyGnome(
      message.guild,
      `${messageHeader} has opted in of Live Stats.`
    );
  } catch (err) {
    await user.send(
      `${redCircleEmoji} Sorry, an error has prevented you from opting in to Live Stats. Please contact staff.`
    );
  }
}
