import "server-only";

import { db } from "~/server/db";

const eventBountyCount = 3;

const visibleAttackDefendOnEventCharacterWhereInput = {
  isHidden: false,
  character: {
    isHidden: false,
  },
};

export type EventBountyUserForDisplay = {
  userId: string;
  userName: string | null;
  userEmail: string | null;
  userImage: string | null;
};

function buildAttackDefendCountByCharacterOwnerUserId(
  attackRows: { character: { userId: string } }[],
  defendRows: { character: { userId: string } }[],
): Map<string, number> {
  const attackDefendCountByCharacterOwnerUserId = new Map<string, number>();

  for (const attackRow of attackRows) {
    const characterOwnerUserId = attackRow.character.userId;
    const currentAttackDefendCount =
      attackDefendCountByCharacterOwnerUserId.get(characterOwnerUserId) ?? 0;
    attackDefendCountByCharacterOwnerUserId.set(
      characterOwnerUserId,
      currentAttackDefendCount + 1,
    );
  }

  for (const defendRow of defendRows) {
    const characterOwnerUserId = defendRow.character.userId;
    const currentAttackDefendCount =
      attackDefendCountByCharacterOwnerUserId.get(characterOwnerUserId) ?? 0;
    attackDefendCountByCharacterOwnerUserId.set(
      characterOwnerUserId,
      currentAttackDefendCount + 1,
    );
  }

  return attackDefendCountByCharacterOwnerUserId;
}

async function getUserIdsWithFewestAttackDefendsOnSubmittedCharactersForEvent(
  eventId: string,
): Promise<string[]> {
  const eventCharacterRows = await db.character.findMany({
    where: { eventId: eventId },
    select: { userId: true },
    distinct: ["userId"],
  });

  if (eventCharacterRows.length === 0) {
    return [];
  }

  const [attackRows, defendRows] = await Promise.all([
    db.attack.findMany({
      where: {
        eventId: eventId,
        ...visibleAttackDefendOnEventCharacterWhereInput,
      },
      select: {
        character: {
          select: {
            userId: true,
          },
        },
      },
    }),
    db.defend.findMany({
      where: {
        eventId: eventId,
        ...visibleAttackDefendOnEventCharacterWhereInput,
      },
      select: {
        character: {
          select: {
            userId: true,
          },
        },
      },
    }),
  ]);

  const attackDefendCountByCharacterOwnerUserId =
    buildAttackDefendCountByCharacterOwnerUserId(attackRows, defendRows);

  const userIdsWithSubmittedCharacters = eventCharacterRows.map(
    (eventCharacterRow) => eventCharacterRow.userId,
  );

  const userIdsSortedByFewestAttackDefends = [
    ...userIdsWithSubmittedCharacters,
  ].sort((leftUserId, rightUserId) => {
    const leftAttackDefendCount =
      attackDefendCountByCharacterOwnerUserId.get(leftUserId) ?? 0;
    const rightAttackDefendCount =
      attackDefendCountByCharacterOwnerUserId.get(rightUserId) ?? 0;
    if (leftAttackDefendCount !== rightAttackDefendCount) {
      return leftAttackDefendCount - rightAttackDefendCount;
    }
    return leftUserId.localeCompare(rightUserId);
  });

  return userIdsSortedByFewestAttackDefends.slice(0, eventBountyCount);
}

export async function regenerateEventBountiesForEvent(
  eventId: string,
): Promise<void> {
  const bountyUserIds =
    await getUserIdsWithFewestAttackDefendsOnSubmittedCharactersForEvent(
      eventId,
    );

  await db.$transaction(async (transactionClient) => {
    await transactionClient.eventBounty.deleteMany({
      where: { eventId: eventId },
    });

    for (const bountyUserId of bountyUserIds) {
      await transactionClient.eventBounty.create({
        data: {
          eventId: eventId,
          userId: bountyUserId,
        },
      });
    }
  });
}

export async function getEventBountyUsersForDisplay(
  eventId: string,
): Promise<EventBountyUserForDisplay[]> {
  const eventBountyRows = await db.eventBounty.findMany({
    where: { eventId: eventId },
    orderBy: { createdAt: "asc" },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return eventBountyRows.map((eventBountyRow) => ({
    userId: eventBountyRow.user.id,
    userName: eventBountyRow.user.name,
    userEmail: eventBountyRow.user.email,
    userImage: eventBountyRow.user.image,
  }));
}
