export const ATTACK_DEFEND_THEME_POINT_MULTIPLIER = 1.5;

export const DEFEND_NON_FRIDAY_POINT_MULTIPLIER = 0.5;

export const SKINFIGHT_SCORING_TIME_ZONE = "America/Chicago";

export type AttackDefendShadingForDisplay = {
  id: string;
  label: string;
  pointValue: number;
};

export function getAttackDefendPointValue(params: {
  pointValue: number;
  hasThemeSelected: boolean;
}): number {
  if (params.hasThemeSelected === true) {
    return params.pointValue * ATTACK_DEFEND_THEME_POINT_MULTIPLIER;
  }
  return params.pointValue;
}

export function isDefendFullPointsDay(date: Date): boolean {
  const weekdayShortName = new Intl.DateTimeFormat("en-US", {
    timeZone: SKINFIGHT_SCORING_TIME_ZONE,
    weekday: "short",
  }).format(date);
  return weekdayShortName === "Fri";
}

export function getDefendPointValue(params: {
  pointValue: number;
  hasThemeSelected: boolean;
  submittedAt: Date;
}): number {
  const fullPointValue = getAttackDefendPointValue({
    pointValue: params.pointValue,
    hasThemeSelected: params.hasThemeSelected,
  });
  if (isDefendFullPointsDay(params.submittedAt) === true) {
    return fullPointValue;
  }
  return fullPointValue * DEFEND_NON_FRIDAY_POINT_MULTIPLIER;
}

export type AttackDefendPointRow = {
  pointValue: number;
  themeId: string | null;
};

export type DefendPointRow = {
  pointValue: number;
  themeId: string | null;
  createdAt: Date;
};

export function sumAttackDefendPointValuesFromRows(
  attackDefendPointRows: AttackDefendPointRow[],
): number {
  let totalPointValue = 0;
  for (const attackDefendPointRow of attackDefendPointRows) {
    totalPointValue += getAttackDefendPointValue({
      pointValue: attackDefendPointRow.pointValue,
      hasThemeSelected: attackDefendPointRow.themeId !== null,
    });
  }
  return totalPointValue;
}

export function sumDefendPointValuesFromRows(
  defendPointRows: DefendPointRow[],
): number {
  let totalPointValue = 0;
  for (const defendPointRow of defendPointRows) {
    totalPointValue += getDefendPointValue({
      pointValue: defendPointRow.pointValue,
      hasThemeSelected: defendPointRow.themeId !== null,
      submittedAt: defendPointRow.createdAt,
    });
  }
  return totalPointValue;
}

export function formatAttackDefendShadingLabelWithPointValue(
  shading: Pick<AttackDefendShadingForDisplay, "label" | "pointValue">,
  pointMultiplier?: number,
): string {
  const resolvedPointMultiplier = pointMultiplier ?? 1;
  const pointValue = shading.pointValue * resolvedPointMultiplier;
  return `${shading.label} (${pointValue} points)`;
}
