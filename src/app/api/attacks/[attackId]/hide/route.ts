import { NextResponse } from "next/server";

import { UserRole } from "../../../../../../generated/prisma";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

type AttackHideRouteContext = {
  params: Promise<{ attackId: string }>;
};

export async function POST(
  request: Request,
  context: AttackHideRouteContext,
): Promise<Response> {
  const session = await auth();
  if (session === null) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { attackId } = await context.params;
  if (attackId.length === 0) {
    return NextResponse.json({ error: "Attack ID is required." }, { status: 400 });
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

  const existingAttack = await db.attack.findUnique({
    where: { id: attackId },
    select: { id: true },
  });

  if (existingAttack === null) {
    return NextResponse.json(
      { error: "Attack not found." },
      { status: 404 },
    );
  }

  try {
    await db.attack.update({
      where: { id: attackId },
      data: { isHidden: typedRequestBody.isHidden },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update attack." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
