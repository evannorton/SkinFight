import "server-only";

import type { Prisma } from "../../generated/prisma";

import type { CharactersGridFilterValues } from "~/lib/characters-grid-filters";
import { formatEventDateTimeRangeLabel } from "~/lib/format-event-datetime-range-label";

export function buildCharactersGridCharacterWhereInput(
  filterValues: CharactersGridFilterValues,
): Prisma.CharacterWhereInput {
  const characterWhereInput: Prisma.CharacterWhereInput = {};
  if (filterValues.teamId !== null) {
    characterWhereInput.teamId = filterValues.teamId;
  }
  if (filterValues.eventId !== null) {
    characterWhereInput.eventId = filterValues.eventId;
  }
  if (filterValues.userId !== null) {
    characterWhereInput.userId = filterValues.userId;
  }
  return characterWhereInput;
}

export function buildUserDisplayNameForCharactersGridFilter(params: {
  userName: string | null;
  userEmail: string | null;
}): string {
  const trimmedUserName = params.userName?.trim() ?? "";
  if (trimmedUserName.length > 0) {
    return trimmedUserName;
  }
  if (params.userEmail !== null && params.userEmail.length > 0) {
    return params.userEmail;
  }
  return "Unknown user";
}

export function buildEventDisplayNameForCharactersGridFilter(params: {
  eventName: string;
  eventDate: Date;
  eventEndDate: Date;
}): string {
  const trimmedEventName = params.eventName.trim();
  const eventTitle =
    trimmedEventName.length > 0 ? trimmedEventName : "Unnamed event";
  const eventDateTimeRangeLabel = formatEventDateTimeRangeLabel(
    params.eventDate,
    params.eventEndDate,
  );
  return `${eventTitle} (${eventDateTimeRangeLabel})`;
}
