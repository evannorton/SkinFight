import "server-only";

import type { Character } from "../../generated/prisma";

import { authorizeUserCharacterEventParticipation } from "~/server/character-event-authorization";
import { db } from "~/server/db";

export type CharacterAttackDefendSubmissionKind = "attack" | "defend";

export type CharacterAttackDefendAuthorizationResult =
  | {
      isAuthorized: true;
      character: Character;
      submitterTeamId: string;
      eventId: string;
    }
  | { isAuthorized: false; errorMessage: string; httpStatus: number };

export async function authorizeCharacterAttackDefendSubmission(params: {
  characterId: string;
  userId: string;
  submissionKind: CharacterAttackDefendSubmissionKind;
}): Promise<CharacterAttackDefendAuthorizationResult> {
  const existingCharacter = await db.character.findUnique({
    where: { id: params.characterId },
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

  const submitterTeamId = eventAuthorizationResult.participation.teamId;
  const isCharacterOnSubmitterTeam =
    existingCharacter.teamId === submitterTeamId;

  if (params.submissionKind === "attack") {
    if (isCharacterOnSubmitterTeam === true) {
      return {
        isAuthorized: false,
        errorMessage:
          "You cannot submit an enemy team attack on a character on your own team.",
        httpStatus: 400,
      };
    }
  }

  if (params.submissionKind === "defend") {
    if (isCharacterOnSubmitterTeam === false) {
      return {
        isAuthorized: false,
        errorMessage:
          "You can only submit friendly team Attacks on characters on your team.",
        httpStatus: 400,
      };
    }
    if (existingCharacter.userId === params.userId) {
      return {
        isAuthorized: false,
        errorMessage:
          "You cannot submit a friendly team Attack on a character you created.",
        httpStatus: 400,
      };
    }
  }

  return {
    isAuthorized: true,
    character: existingCharacter,
    submitterTeamId,
    eventId: existingCharacter.eventId,
  };
}
