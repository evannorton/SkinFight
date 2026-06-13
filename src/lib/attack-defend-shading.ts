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

export function getAttackDefendShadingPointValue(
  shading: AttackDefendShadingValue,
): number {
  return ATTACK_DEFEND_SHADING_POINT_VALUES[shading];
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
  shadingRows: { shading: string }[],
): number {
  const shadings: AttackDefendShadingValue[] = [];
  for (const shadingRow of shadingRows) {
    if (isAttackDefendShadingValue(shadingRow.shading) === false) {
      throw new Error(`Unknown attack/defend shading: ${shadingRow.shading}`);
    }
    shadings.push(shadingRow.shading);
  }
  return sumAttackDefendShadingPointValues(shadings);
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
