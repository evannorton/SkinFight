import "server-only";

import type { Prisma } from "../../generated/prisma";

import { getBackblazeEnvConfig } from "~/server/backblaze-env";
import { deletePngFromBackblazeByPublicFileUrl } from "~/server/backblaze-storage";
import type { db as databaseClient } from "~/server/db";

export async function deleteBackblazeFilesForPublicFileUrls(
  publicFileUrls: readonly string[],
): Promise<void> {
  if (getBackblazeEnvConfig() === null) {
    return;
  }

  for (const publicFileUrl of publicFileUrls) {
    try {
      await deletePngFromBackblazeByPublicFileUrl(publicFileUrl);
    } catch {
      console.error(`Failed to delete file from Backblaze: ${publicFileUrl}`);
    }
  }
}

export async function deleteBackblazeFilesForCharactersWhere(
  database: typeof databaseClient,
  characterWhereInput: Prisma.CharacterWhereInput,
): Promise<void> {
  const characterRows = await database.character.findMany({
    where: characterWhereInput,
    select: { file: true },
  });
  const publicFileUrls = characterRows.map((characterRow) => characterRow.file);
  await deleteBackblazeFilesForPublicFileUrls(publicFileUrls);
}

export async function deleteBackblazeFilesForAttacksWhere(
  database: typeof databaseClient,
  attackWhereInput: Prisma.AttackWhereInput,
): Promise<void> {
  const attackRows = await database.attack.findMany({
    where: attackWhereInput,
    select: { file: true },
  });
  const publicFileUrls = attackRows.map((attackRow) => attackRow.file);
  await deleteBackblazeFilesForPublicFileUrls(publicFileUrls);
}

export async function deleteBackblazeFilesForDefendsWhere(
  database: typeof databaseClient,
  defendWhereInput: Prisma.DefendWhereInput,
): Promise<void> {
  const defendRows = await database.defend.findMany({
    where: defendWhereInput,
    select: { file: true },
  });
  const publicFileUrls = defendRows.map((defendRow) => defendRow.file);
  await deleteBackblazeFilesForPublicFileUrls(publicFileUrls);
}

export async function deleteBackblazeFilesForEventUploads(
  database: typeof databaseClient,
  eventId: string,
): Promise<void> {
  await deleteBackblazeFilesForCharactersWhere(database, { eventId });
  await deleteBackblazeFilesForAttacksWhere(database, { eventId });
  await deleteBackblazeFilesForDefendsWhere(database, { eventId });
}
