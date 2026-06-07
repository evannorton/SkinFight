import { NextResponse } from "next/server";

import { UserRole } from "../../../../../../generated/prisma";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

type DefendHideRouteContext = {
  params: Promise<{ defendId: string }>;
};

export async function POST(
  request: Request,
  context: DefendHideRouteContext,
): Promise<Response> {
  const session = await auth();
  if (session === null) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { defendId } = await context.params;
  if (defendId.length === 0) {
    return NextResponse.json({ error: "Defend ID is required." }, { status: 400 });
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

  const existingDefend = await db.defend.findUnique({
    where: { id: defendId },
    select: { id: true },
  });

  if (existingDefend === null) {
    return NextResponse.json(
      { error: "Defend not found." },
      { status: 404 },
    );
  }

  try {
    await db.defend.update({
      where: { id: defendId },
      data: { isHidden: typedRequestBody.isHidden },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update defend." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
