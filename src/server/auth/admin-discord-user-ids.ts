import { env } from "~/env";

export function parseAdminDiscordUserIdsFromEnv(): string[] {
  const rawList = env.ADMIN_DISCORD_USER_IDS;
  if (rawList === undefined) {
    return [];
  }
  return rawList
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
}
