import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { authorizeUserCharacterEventParticipation } from "~/server/character-event-authorization";
import {
  parseCharacterNameFieldValue,
  parseCharacterPngFileFieldValue,
} from "~/server/character-form-parsing";
import { getBackblazeEnvConfig } from "~/server/backblaze-env";
import { uploadCharacterPngToBackblaze } from "~/server/backblaze-storage";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function POST(request: Request): Promise<Response> {
  const session = await auth();
  if (session === null) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const parsedCharacterName = parseCharacterNameFieldValue(
    formData.get("name"),
  );
  if (parsedCharacterName.isValid === false) {
    return NextResponse.json(
      { error: parsedCharacterName.errorMessage },
      { status: 400 },
    );
  }

  const eventIdFieldValue = formData.get("eventId");
  if (typeof eventIdFieldValue !== "string" || eventIdFieldValue.length === 0) {
    return NextResponse.json(
      { error: "Event ID is required." },
      { status: 400 },
    );
  }

  const parsedCharacterPngUpload = await parseCharacterPngFileFieldValue(
    formData.get("file"),
  );
  if (parsedCharacterPngUpload.isValid === false) {
    return NextResponse.json(
      { error: parsedCharacterPngUpload.errorMessage },
      { status: 400 },
    );
  }

  const userId = session.user.id;
  const eventAuthorizationResult =
    await authorizeUserCharacterEventParticipation({
      userId,
      eventId: eventIdFieldValue,
    });
  if (eventAuthorizationResult.isAuthorized === false) {
    return NextResponse.json(
      { error: eventAuthorizationResult.errorMessage },
      { status: eventAuthorizationResult.httpStatus },
    );
  }

  if (getBackblazeEnvConfig() === null) {
    return NextResponse.json(
      { error: "File storage is not configured." },
      { status: 503 },
    );
  }

  const objectKey = `characters/${eventIdFieldValue}/${userId}/${randomUUID()}.png`;
  let publicFileUrl: string;
  try {
    publicFileUrl = await uploadCharacterPngToBackblaze({
      objectKey,
      fileBody: parsedCharacterPngUpload.fileBuffer,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to upload character image." },
      { status: 500 },
    );
  }

  const createdCharacter = await db.character.create({
    data: {
      name: parsedCharacterName.trimmedCharacterName,
      file: publicFileUrl,
      userId,
      teamId: eventAuthorizationResult.participation.teamId,
      eventId: eventIdFieldValue,
    },
    select: {
      id: true,
      name: true,
      file: true,
    },
  });

  return NextResponse.json({ character: createdCharacter }, { status: 201 });
}
