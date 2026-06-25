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

export type AttackDefendPointRow = {
  shading: string;
  themeId: string | null;
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
): string {
  const shadingLabel = formatAttackDefendShadingLabel(shading);
  const pointValue = getAttackDefendShadingPointValue(shading);
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
