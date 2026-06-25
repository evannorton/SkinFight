import "server-only";

import type { Character } from "../../generated/prisma";

import {
  authorizeUserCharacterEventParticipation,
  type AuthorizedCharacterEventParticipation,
} from "~/server/character-event-authorization";
import { db } from "~/server/db";

export type AuthorizedCharacterForUserResult =
  | {
      isAuthorized: true;
      character: Character;
      participation: AuthorizedCharacterEventParticipation;
    }
  | { isAuthorized: false; errorMessage: string; httpStatus: number };

export async function findCharacterAuthorizedForUserCurrentTeam(params: {
  characterId: string;
  userId: string;
}): Promise<AuthorizedCharacterForUserResult> {
  const existingCharacter = await db.character.findFirst({
    where: {
      id: params.characterId,
      userId: params.userId,
    },
  });
  if (existingCharacter === null) {
    return {
      isAuthorized: false,
      errorMessage: "Character not found.",
      httpStatus: 404,
    };
  }

  const eventAuthorizationResult =
    await authorizeUserCharacterEventParticipation({
      userId: params.userId,
      eventId: existingCharacter.eventId,
    });
  if (eventAuthorizationResult.isAuthorized === false) {
    return {
      isAuthorized: false,
      errorMessage: eventAuthorizationResult.errorMessage,
      httpStatus: eventAuthorizationResult.httpStatus,
    };
  }

  if (
    existingCharacter.teamId !== eventAuthorizationResult.participation.teamId
  ) {
    return {
      isAuthorized: false,
      errorMessage: "Character not found.",
      httpStatus: 404,
    };
  }

  return {
    isAuthorized: true,
    character: existingCharacter,
    participation: eventAuthorizationResult.participation,
  };
}
