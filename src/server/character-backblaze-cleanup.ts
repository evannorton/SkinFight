import "server-only";

import type { Prisma } from "../../generated/prisma";

import { getBackblazeEnvConfig } from "~/server/backblaze-env";
import { deleteCharacterPngFromBackblazeByPublicFileUrl } from "~/server/backblaze-storage";
import type { db as databaseClient } from "~/server/db";

export async function deleteBackblazeFilesForCharacterPublicFileUrls(
  publicFileUrls: readonly string[],
): Promise<void> {
  if (getBackblazeEnvConfig() === null) {
    return;
  }

  for (const publicFileUrl of publicFileUrls) {
    try {
      await deleteCharacterPngFromBackblazeByPublicFileUrl(publicFileUrl);
    } catch {
      console.error(
        `Failed to delete character file from Backblaze: ${publicFileUrl}`,
      );
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
  await deleteBackblazeFilesForCharacterPublicFileUrls(publicFileUrls);
}
