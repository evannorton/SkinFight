export type AttackDefendShadingValue = "ONE" | "TWO" | "THREE";

export const ATTACK_DEFEND_SHADING_OPTIONS: AttackDefendShadingValue[] = [
  "ONE",
  "TWO",
  "THREE",
];

export const ATTACK_DEFEND_SHADING_POINT_VALUES: Record<
  AttackDefendShadingValue,
  number
> = {
  ONE: 5,
  TWO: 15,
  THREE: 25,
};

export const ATTACK_DEFEND_THEME_POINT_MULTIPLIER = 1.5;

export const DEFEND_NON_FRIDAY_POINT_MULTIPLIER = 0.5;

export const SKINFIGHT_SCORING_TIME_ZONE = "America/Chicago";

export function getAttackDefendShadingPointValue(
  shading: AttackDefendShadingValue,
): number {
  return ATTACK_DEFEND_SHADING_POINT_VALUES[shading];
}

export function getAttackDefendPointValue(params: {
  shading: AttackDefendShadingValue;
  hasThemeSelected: boolean;
}): number {
  const basePointValue = getAttackDefendShadingPointValue(params.shading);
  if (params.hasThemeSelected === true) {
    return basePointValue * ATTACK_DEFEND_THEME_POINT_MULTIPLIER;
  }
  return basePointValue;
}

export function isDefendFullPointsDay(date: Date): boolean {
  const weekdayShortName = new Intl.DateTimeFormat("en-US", {
    timeZone: SKINFIGHT_SCORING_TIME_ZONE,
    weekday: "short",
  }).format(date);
  return weekdayShortName === "Fri";
}

export function getDefendPointValue(params: {
  shading: AttackDefendShadingValue;
  hasThemeSelected: boolean;
  submittedAt: Date;
}): number {
  const fullPointValue = getAttackDefendPointValue({
    shading: params.shading,
    hasThemeSelected: params.hasThemeSelected,
  });
  if (isDefendFullPointsDay(params.submittedAt) === true) {
    return fullPointValue;
  }
  return fullPointValue * DEFEND_NON_FRIDAY_POINT_MULTIPLIER;
}

export type AttackDefendPointRow = {
  shading: string;
  themeId: string | null;
};

export type DefendPointRow = {
  shading: string;
  themeId: string | null;
  createdAt: Date;
};

export function sumAttackDefendPointValuesFromRows(
  attackDefendPointRows: AttackDefendPointRow[],
): number {
  let totalPointValue = 0;
  for (const attackDefendPointRow of attackDefendPointRows) {
    if (isAttackDefendShadingValue(attackDefendPointRow.shading) === false) {
      throw new Error(
        `Unknown attack/defend shading: ${attackDefendPointRow.shading}`,
      );
    }
    totalPointValue += getAttackDefendPointValue({
      shading: attackDefendPointRow.shading,
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
    if (isAttackDefendShadingValue(defendPointRow.shading) === false) {
      throw new Error(`Unknown attack/defend shading: ${defendPointRow.shading}`);
    }
    totalPointValue += getDefendPointValue({
      shading: defendPointRow.shading,
      hasThemeSelected: defendPointRow.themeId !== null,
      submittedAt: defendPointRow.createdAt,
    });
  }
  return totalPointValue;
}

export function sumAttackDefendShadingPointValues(
  shadings: AttackDefendShadingValue[],
): number {
  let totalPointValue = 0;
  for (const shading of shadings) {
    totalPointValue += getAttackDefendShadingPointValue(shading);
  }
  return totalPointValue;
}

export function sumAttackDefendShadingPointValuesFromShadingRows(
  shadingRows: { shading: string; themeId?: string | null }[],
): number {
  return sumAttackDefendPointValuesFromRows(
    shadingRows.map((shadingRow) => {
      return {
        shading: shadingRow.shading,
        themeId: shadingRow.themeId ?? null,
      };
    }),
  );
}

export function formatAttackDefendShadingLabel(
  shading: AttackDefendShadingValue,
): string {
  if (shading === "ONE") {
    return "A";
  }
  if (shading === "TWO") {
    return "B";
  }
  return "C";
}

export function formatAttackDefendShadingLabelWithPointValue(
  shading: AttackDefendShadingValue,
  pointMultiplier?: number,
): string {
  const shadingLabel = formatAttackDefendShadingLabel(shading);
  const resolvedPointMultiplier = pointMultiplier ?? 1;
  const pointValue =
    getAttackDefendShadingPointValue(shading) * resolvedPointMultiplier;
  return `${shadingLabel} (${pointValue} points)`;
}

export function isAttackDefendShadingValue(
  value: string,
): value is AttackDefendShadingValue {
  if (value === "ONE") {
    return true;
  }
  if (value === "TWO") {
    return true;
  }
  if (value === "THREE") {
    return true;
  }
  return false;
}
