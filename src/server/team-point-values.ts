import "server-only";

import {
  getAttackDefendPointValue,
  isAttackDefendShadingValue,
  sumAttackDefendPointValuesFromRows,
} from "~/lib/attack-defend-shading";
import { db } from "~/server/db";

const visibleAttackDefendWhereInput = {
  isHidden: false,
  character: {
    isHidden: false,
  },
};

function addAttackDefendRowPointValueToTeamTotalPointValues(
  teamTotalPointValuesByTeamId: Map<string, number>,
  teamId: string,
  shading: string,
  themeId: string | null,
): void {
  if (isAttackDefendShadingValue(shading) === false) {
    throw new Error(`Unknown attack/defend shading: ${shading}`);
  }
  const currentTeamTotalPointValue =
    teamTotalPointValuesByTeamId.get(teamId) ?? 0;
  teamTotalPointValuesByTeamId.set(
    teamId,
    currentTeamTotalPointValue +
      getAttackDefendPointValue({
        shading,
        hasThemeSelected: themeId !== null,
      }),
  );
}

export async function getTeamTotalPointValue(teamId: string): Promise<number> {
  const [teamAttackRows, teamDefendRows] = await Promise.all([
    db.attack.findMany({
      where: {
        teamId: teamId,
        ...visibleAttackDefendWhereInput,
      },
      select: {
        shading: true,
        themeId: true,
      },
    }),
    db.defend.findMany({
      where: {
        teamId: teamId,
        ...visibleAttackDefendWhereInput,
      },
      select: {
        shading: true,
        themeId: true,
      },
    }),
  ]);

  return sumAttackDefendPointValuesFromRows([
    ...teamAttackRows,
    ...teamDefendRows,
  ]);
}

export async function getEventTeamTotalPointValuesByTeamId(
  eventId: string,
): Promise<Map<string, number>> {
  const teamTotalPointValuesByTeamId = new Map<string, number>();

  const [teamAttackRows, teamDefendRows] = await Promise.all([
    db.attack.findMany({
      where: {
        eventId: eventId,
        ...visibleAttackDefendWhereInput,
      },
      select: {
        teamId: true,
        shading: true,
        themeId: true,
      },
    }),
    db.defend.findMany({
      where: {
        eventId: eventId,
        ...visibleAttackDefendWhereInput,
      },
      select: {
        teamId: true,
        shading: true,
        themeId: true,
      },
    }),
  ]);

  for (const teamAttackRow of teamAttackRows) {
    addAttackDefendRowPointValueToTeamTotalPointValues(
      teamTotalPointValuesByTeamId,
      teamAttackRow.teamId,
      teamAttackRow.shading,
      teamAttackRow.themeId,
    );
  }

  for (const teamDefendRow of teamDefendRows) {
    addAttackDefendRowPointValueToTeamTotalPointValues(
      teamTotalPointValuesByTeamId,
      teamDefendRow.teamId,
      teamDefendRow.shading,
      teamDefendRow.themeId,
    );
  }

  return teamTotalPointValuesByTeamId;
}

export async function getTeamTotalPointValuesByTeamId(): Promise<
  Map<string, number>
> {
  const teamTotalPointValuesByTeamId = new Map<string, number>();

  const [teamAttackRows, teamDefendRows] = await Promise.all([
    db.attack.findMany({
      where: visibleAttackDefendWhereInput,
      select: {
        teamId: true,
        shading: true,
        themeId: true,
      },
    }),
    db.defend.findMany({
      where: visibleAttackDefendWhereInput,
      select: {
        teamId: true,
        shading: true,
        themeId: true,
      },
    }),
  ]);

  for (const teamAttackRow of teamAttackRows) {
    addAttackDefendRowPointValueToTeamTotalPointValues(
      teamTotalPointValuesByTeamId,
      teamAttackRow.teamId,
      teamAttackRow.shading,
      teamAttackRow.themeId,
    );
  }

  for (const teamDefendRow of teamDefendRows) {
    addAttackDefendRowPointValueToTeamTotalPointValues(
      teamTotalPointValuesByTeamId,
      teamDefendRow.teamId,
      teamDefendRow.shading,
      teamDefendRow.themeId,
    );
  }

  return teamTotalPointValuesByTeamId;
}
