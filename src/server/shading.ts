import "server-only";

import type { AttackDefendShadingForDisplay } from "~/lib/attack-defend-shading";
import { db } from "~/server/db";

export async function listShadingsForSubmission(): Promise<
  AttackDefendShadingForDisplay[]
> {
  const shadingRows = await db.shading.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      label: true,
      pointValue: true,
    },
  });
  return shadingRows;
}

export async function validateShadingIdForSubmission(params: {
  shadingId: string;
}): Promise<
  | { isValid: true; shadingId: string }
  | { isValid: false; errorMessage: string }
> {
  const shadingRow = await db.shading.findUnique({
    where: { id: params.shadingId },
    select: { id: true },
  });
  if (shadingRow === null) {
    return { isValid: false, errorMessage: "Shading is invalid." };
  }
  return { isValid: true, shadingId: shadingRow.id };
}
