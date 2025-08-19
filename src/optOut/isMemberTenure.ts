import type { Guild } from "discord.js";

// Milliseconds in one day
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export default async function isMemberTenure(
  guild: Guild | null | undefined,
  userId: string
): Promise<number | null> {
  try {
    if (!guild) return null;

    const member = await guild.members
      .fetch({ user: userId, force: true })
      .catch(() => null);

    const joinedAt = member?.joinedAt ?? null;
    if (!joinedAt) return null;

    const days = Math.floor((Date.now() - joinedAt.getTime()) / MS_PER_DAY);
    return days;
  } catch {
    return null;
  }
}
