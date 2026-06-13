import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { authorizeCharacterAttackDefendSubmission } from "~/server/character-attack-defend-authorization";
import {
  parseAttackDefendShadingFieldValue,
  parseCharacterPngFileFieldValue,
} from "~/server/character-form-parsing";
import { getBackblazeEnvConfig } from "~/server/backblaze-env";
import { uploadPngToBackblaze } from "~/server/backblaze-storage";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

type CharacterAttacksRouteContext = {
  params: Promise<{ characterId: string }>;
};

export async function POST(
  request: Request,
  context: CharacterAttacksRouteContext,
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

  const parsedCharacterPngUpload = await parseCharacterPngFileFieldValue(
    formData.get("file"),
  );
  if (parsedCharacterPngUpload.isValid === false) {
    return NextResponse.json(
      { error: parsedCharacterPngUpload.errorMessage },
      { status: 400 },
    );
  }

  const parsedShading = parseAttackDefendShadingFieldValue(
    formData.get("shading"),
  );
  if (parsedShading.isValid === false) {
    return NextResponse.json(
      { error: parsedShading.errorMessage },
      { status: 400 },
    );
  }

  const userId = session.user.id;
  const authorizationResult = await authorizeCharacterAttackDefendSubmission({
    characterId,
    userId,
    submissionKind: "attack",
  });
  if (authorizationResult.isAuthorized === false) {
    return NextResponse.json(
      { error: authorizationResult.errorMessage },
      { status: authorizationResult.httpStatus },
    );
  }

  if (getBackblazeEnvConfig() === null) {
    return NextResponse.json(
      { error: "File storage is not configured." },
      { status: 503 },
    );
  }

  const objectKey = `attacks/${authorizationResult.eventId}/${characterId}/${userId}/${randomUUID()}.png`;
  let publicFileUrl: string;
  try {
    publicFileUrl = await uploadPngToBackblaze({
      objectKey,
      fileBody: parsedCharacterPngUpload.fileBuffer,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to upload attack image." },
      { status: 500 },
    );
  }

  const createdAttack = await db.attack.create({
    data: {
      characterId,
      userId,
      teamId: authorizationResult.submitterTeamId,
      eventId: authorizationResult.eventId,
      file: publicFileUrl,
      shading: parsedShading.shading,
    },
    select: {
      id: true,
      file: true,
    },
  });

  return NextResponse.json({ attack: createdAttack }, { status: 201 });
}
