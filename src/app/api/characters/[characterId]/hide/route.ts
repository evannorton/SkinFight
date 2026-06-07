import { NextResponse } from "next/server";

import { UserRole } from "../../../../../../generated/prisma";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

type CharacterHideRouteContext = {
  params: Promise<{ characterId: string }>;
};

export async function POST(
  request: Request,
  context: CharacterHideRouteContext,
): Promise<Response> {
  const session = await auth();
  if (session === null) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { characterId } = await context.params;
  if (characterId.length === 0) {
    return NextResponse.json({ error: "Character ID is required." }, { status: 400 });
  }

  let requestBody: unknown;
  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (
    typeof requestBody !== "object" ||
    requestBody === null ||
    !("isHidden" in requestBody) ||
    typeof (requestBody as { isHidden: unknown }).isHidden !== "boolean"
  ) {
    return NextResponse.json(
      { error: "isHidden must be a boolean." },
      { status: 400 },
    );
  }

  const typedRequestBody = requestBody as { isHidden: boolean };

  const existingCharacter = await db.character.findUnique({
    where: { id: characterId },
    select: { id: true },
  });

  if (existingCharacter === null) {
    return NextResponse.json(
      { error: "Character not found." },
      { status: 404 },
    );
  }

  try {
    await db.character.update({
      where: { id: characterId },
      data: { isHidden: typedRequestBody.isHidden },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update character." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
