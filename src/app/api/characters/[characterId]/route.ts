import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { authorizeUserCharacterEventParticipation } from "~/server/character-event-authorization";
import {
  parseCharacterNameFieldValue,
  parseOptionalCharacterPngFileFieldValue,
} from "~/server/character-form-parsing";
import { getBackblazeEnvConfig } from "~/server/backblaze-env";
import {
  deleteCharacterPngFromBackblazeByPublicFileUrl,
  uploadCharacterPngToBackblaze,
} from "~/server/backblaze-storage";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

type CharacterRouteContext = {
  params: Promise<{ characterId: string }>;
};

export async function PATCH(
  request: Request,
  context: CharacterRouteContext,
): Promise<Response> {
  const session = await auth();
  if (session === null) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { characterId } = await context.params;
  if (characterId.length === 0) {
    return NextResponse.json({ error: "Character ID is required." }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data." },
      { status: 400 },
    );
  }

  const parsedCharacterName = parseCharacterNameFieldValue(formData.get("name"));
  if (parsedCharacterName.isValid === false) {
    return NextResponse.json(
      { error: parsedCharacterName.errorMessage },
      { status: 400 },
    );
  }

  const parsedOptionalCharacterPngUpload =
    await parseOptionalCharacterPngFileFieldValue(formData.get("file"));
  if (parsedOptionalCharacterPngUpload.isValid === false) {
    return NextResponse.json(
      { error: parsedOptionalCharacterPngUpload.errorMessage },
      { status: 400 },
    );
  }

  const userId = session.user.id;
  const existingCharacter = await db.character.findFirst({
    where: {
      id: characterId,
      userId,
    },
  });
  if (existingCharacter === null) {
    return NextResponse.json({ error: "Character not found." }, { status: 404 });
  }

  const eventAuthorizationResult = await authorizeUserCharacterEventParticipation({
    userId,
    eventId: existingCharacter.eventId,
  });
  if (eventAuthorizationResult.isAuthorized === false) {
    return NextResponse.json(
      { error: eventAuthorizationResult.errorMessage },
      { status: eventAuthorizationResult.httpStatus },
    );
  }

  if (
    existingCharacter.teamId !==
    eventAuthorizationResult.participation.teamId
  ) {
    return NextResponse.json({ error: "Character not found." }, { status: 404 });
  }

  const isCharacterNameUnchanged =
    parsedCharacterName.trimmedCharacterName === existingCharacter.name;
  const isCharacterFileReplacementRequested =
    parsedOptionalCharacterPngUpload.isValid === true &&
    parsedOptionalCharacterPngUpload.hasFile === true;
  if (
    isCharacterNameUnchanged === true &&
    isCharacterFileReplacementRequested === false
  ) {
    return NextResponse.json(
      { error: "No changes to save." },
      { status: 400 },
    );
  }

  let replacementPublicFileUrl: string | null = null;
  if (isCharacterFileReplacementRequested === true) {
    if (getBackblazeEnvConfig() === null) {
      return NextResponse.json(
        { error: "File storage is not configured." },
        { status: 503 },
      );
    }

    const replacementObjectKey = `characters/${existingCharacter.eventId}/${userId}/${randomUUID()}.png`;
    try {
      replacementPublicFileUrl = await uploadCharacterPngToBackblaze({
        objectKey: replacementObjectKey,
        fileBody: parsedOptionalCharacterPngUpload.fileBuffer,
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to upload character image." },
        { status: 500 },
      );
    }
  }

  const previousPublicFileUrl = existingCharacter.file;
  let updatedCharacter: { id: string; name: string; file: string };
  try {
    updatedCharacter = await db.character.update({
      where: { id: existingCharacter.id },
      data: {
        name: parsedCharacterName.trimmedCharacterName,
        ...(replacementPublicFileUrl !== null
          ? { file: replacementPublicFileUrl }
          : {}),
      },
      select: {
        id: true,
        name: true,
        file: true,
      },
    });
  } catch {
    if (replacementPublicFileUrl !== null) {
      try {
        await deleteCharacterPngFromBackblazeByPublicFileUrl(
          replacementPublicFileUrl,
        );
      } catch {
        // best-effort cleanup of orphaned upload
      }
    }
    return NextResponse.json(
      { error: "Failed to update character." },
      { status: 500 },
    );
  }

  if (
    replacementPublicFileUrl !== null &&
    previousPublicFileUrl !== replacementPublicFileUrl
  ) {
    try {
      await deleteCharacterPngFromBackblazeByPublicFileUrl(previousPublicFileUrl);
    } catch {
      console.error(
        `Failed to delete replaced character file from Backblaze: ${previousPublicFileUrl}`,
      );
    }
  }

  return NextResponse.json({ character: updatedCharacter }, { status: 200 });
}
