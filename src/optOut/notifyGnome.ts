import type { Guild } from "discord.js";
import { discordOptOutNotifyUserID } from "../config.js";

/**
 * DM a specific configured user (gnome) with a message, if enabled.
 */
export default async function notifyGnome(
  guild: Guild | null | undefined,
  content: string
): Promise<void> {
  try {
    if (!guild || !discordOptOutNotifyUserID) return;

    const notifyMember = await guild.members
      .fetch({ user: discordOptOutNotifyUserID, force: true })
      .catch(() => null);

    if (!notifyMember) return;

    await notifyMember.user.send(content).catch(() => {});
  } catch {
    // swallow notify errors
  }
}
