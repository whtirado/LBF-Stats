import readOptOut from "./readOptOut.js";

/**
 * Returns true if the given Discord user ID is currently opted out of Live Stats.
 */
function isMemberOptOut(memberId: string): boolean {
  try {
    const data = readOptOut();
    return data.liveStats.includes(memberId);
  } catch (_) {
    // On any read/parse error, default to not opted out
    return false;
  }
}

export default isMemberOptOut;
