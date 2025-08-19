import type { Guild } from "discord.js";

/**
 * Adds the Live Stats opt-out role to a guild member.
 * Returns true on success, false on failure (guild/member/permission issues).
 */
export default async function addMemberRole(
  guild: Guild | null,
  userId: string,
  roleId: string
): Promise<boolean> {
  if (!guild) return false;
  try {
    const member = await guild.members.fetch(userId);
    await member.roles.add(roleId);
    return true;
  } catch (err) {
    // Log but don't throw; caller may continue with DM/notifications.
    console.error(`Failed to add role (${roleId}) for user ${userId}:`, err);
    return false;
  }
}
