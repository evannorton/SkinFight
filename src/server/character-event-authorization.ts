import "server-only";

import type { Event, EventParticipation } from "../../generated/prisma";

import { db } from "~/server/db";

export type AuthorizedCharacterEventParticipation = EventParticipation & {
  teamId: string;
};

export type CharacterEventAuthorizationResult =
  | {
      isAuthorized: true;
      event: Event;
      participation: AuthorizedCharacterEventParticipation;
    }
  | { isAuthorized: false; errorMessage: string; httpStatus: number };

export async function authorizeUserCharacterEventParticipation(params: {
  userId: string;
  eventId: string;
}): Promise<CharacterEventAuthorizationResult> {
  const event = await db.event.findUnique({
    where: { id: params.eventId },
  });
  if (event === null) {
    return {
      isAuthorized: false,
      errorMessage: "Event not found.",
      httpStatus: 404,
    };
  }

  const now = new Date();
  const isEventCurrentlyOngoing =
    event.date.getTime() <= now.getTime() &&
    event.endDate.getTime() >= now.getTime();
  if (isEventCurrentlyOngoing === false) {
    return {
      isAuthorized: false,
      errorMessage: "This event is not currently active.",
      httpStatus: 400,
    };
  }

  const existingParticipation = await db.eventParticipation.findUnique({
    where: {
      userId_eventId: {
        userId: params.userId,
        eventId: params.eventId,
      },
    },
  });
  if ((existingParticipation?.teamId ?? null) === null) {
    return {
      isAuthorized: false,
      errorMessage: "You must join a team before managing characters.",
      httpStatus: 403,
    };
  }

  return {
    isAuthorized: true,
    event,
    participation: existingParticipation as AuthorizedCharacterEventParticipation,
  };
}
