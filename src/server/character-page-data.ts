import "server-only";

import type {
  CharacterAttackForDisplay,
  CharacterDefendForDisplay,
  CharacterPageForDisplay,
  CharacterPageViewerActionAvailability,
} from "~/lib/character-page-for-display";
import { db } from "~/server/db";

function buildUserDisplayName(params: {
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

async function getCurrentOngoingEventId(): Promise<string | null> {
  const now = new Date();
  const currentOngoingEvent = await db.event.findFirst({
    where: {
      date: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { date: "asc" },
    select: { id: true },
  });
  if (currentOngoingEvent === null) {
    return null;
  }
  return currentOngoingEvent.id;
}

function buildViewerActionAvailability(params: {
  isCharacterInCurrentOngoingEvent: boolean;
  viewerTeamId: string | null;
  viewerUserId: string | null;
  characterTeamId: string;
  characterCreatorUserId: string;
}): CharacterPageViewerActionAvailability {
  if (params.isCharacterInCurrentOngoingEvent === false) {
    return {
      canShowAttackButton: false,
      canShowDefendButton: false,
    };
  }
  if (params.viewerTeamId === null) {
    return {
      canShowAttackButton: false,
      canShowDefendButton: false,
    };
  }
  const isCharacterOnViewerTeam = params.characterTeamId === params.viewerTeamId;
  const isViewerCharacterCreator =
    params.viewerUserId !== null &&
    params.viewerUserId === params.characterCreatorUserId;
  return {
    canShowAttackButton: isCharacterOnViewerTeam === false,
    canShowDefendButton:
      isCharacterOnViewerTeam === true && isViewerCharacterCreator === false,
  };
}

export async function getCharacterPageForDisplay(params: {
  characterId: string;
  viewerUserId: string | null;
  viewerIsAdmin: boolean;
}): Promise<CharacterPageForDisplay | null> {
  const characterRow = await db.character.findUnique({
    where: { id: params.characterId },
    select: {
      id: true,
      name: true,
      file: true,
      userId: true,
      teamId: true,
      eventId: true,
      isHidden: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      team: {
        select: {
          name: true,
        },
      },
      event: {
        select: {
          name: true,
        },
      },
      attacks: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          file: true,
          isHidden: true,
          userId: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          team: {
            select: {
              name: true,
            },
          },
        },
      },
      defends: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          file: true,
          isHidden: true,
          userId: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          team: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (characterRow === null) {
    return null;
  }

  const isViewerCharacterCreator =
    params.viewerUserId !== null && params.viewerUserId === characterRow.userId;
  const canViewerAccessHiddenCharacter =
    params.viewerIsAdmin === true || isViewerCharacterCreator === true;

  if (characterRow.isHidden === true && canViewerAccessHiddenCharacter === false) {
    return null;
  }

  const trimmedEventName = characterRow.event.name.trim();
  const eventDisplayName =
    trimmedEventName.length > 0 ? trimmedEventName : "Unnamed event";

  const currentOngoingEventId = await getCurrentOngoingEventId();
  const isCharacterInCurrentOngoingEvent =
    currentOngoingEventId !== null &&
    characterRow.eventId === currentOngoingEventId;

  let viewerTeamId: string | null = null;
  if (
    params.viewerUserId !== null &&
    isCharacterInCurrentOngoingEvent === true &&
    currentOngoingEventId !== null
  ) {
    const viewerParticipation = await db.eventParticipation.findUnique({
      where: {
        userId_eventId: {
          userId: params.viewerUserId,
          eventId: currentOngoingEventId,
        },
      },
      select: { teamId: true },
    });
    viewerTeamId = viewerParticipation?.teamId ?? null;
  }

  const viewerActionAvailability = buildViewerActionAvailability({
    isCharacterInCurrentOngoingEvent,
    viewerTeamId,
    viewerUserId: params.viewerUserId,
    characterTeamId: characterRow.teamId,
    characterCreatorUserId: characterRow.userId,
  });

  const attacks: CharacterAttackForDisplay[] = characterRow.attacks
    .filter((attackRow) => {
      if (params.viewerIsAdmin === true) {
        return true;
      }
      if (attackRow.isHidden === false) {
        return true;
      }
      if (params.viewerUserId !== null && attackRow.userId === params.viewerUserId) {
        return true;
      }
      return false;
    })
    .map((attackRow) => {
      return {
        id: attackRow.id,
        fileUrl: attackRow.file,
        submitterDisplayName: buildUserDisplayName({
          userName: attackRow.user.name,
          userEmail: attackRow.user.email,
        }),
        submitterTeamName: attackRow.team.name,
        isHidden: attackRow.isHidden,
      };
    });

  const defends: CharacterDefendForDisplay[] = characterRow.defends
    .filter((defendRow) => {
      if (params.viewerIsAdmin === true) {
        return true;
      }
      if (defendRow.isHidden === false) {
        return true;
      }
      if (params.viewerUserId !== null && defendRow.userId === params.viewerUserId) {
        return true;
      }
      return false;
    })
    .map((defendRow) => {
      return {
        id: defendRow.id,
        fileUrl: defendRow.file,
        submitterDisplayName: buildUserDisplayName({
          userName: defendRow.user.name,
          userEmail: defendRow.user.email,
        }),
        submitterTeamName: defendRow.team.name,
        isHidden: defendRow.isHidden,
      };
    });

  return {
    characterDetail: {
      id: characterRow.id,
      name: characterRow.name,
      fileUrl: characterRow.file,
      userDisplayName: buildUserDisplayName({
        userName: characterRow.user.name,
        userEmail: characterRow.user.email,
      }),
      teamName: characterRow.team.name,
      eventName: eventDisplayName,
      isHidden: characterRow.isHidden,
    },
    viewerActionAvailability,
    attacks,
    defends,
  };
}
