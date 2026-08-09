import "server-only";

import {
  getAttackDefendPointValue,
  getDefendPointValue,
  isAttackDefendShadingValue,
  sumAttackDefendPointValuesFromRows,
  sumDefendPointValuesFromRows,
} from "~/lib/attack-defend-shading";
import { db } from "~/server/db";

const visibleAttackDefendWhereInput = {
  isHidden: false,
  character: {
    isHidden: false,
  },
};

function addAttackRowPointValueToTeamTotalPointValues(
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

function addDefendRowPointValueToTeamTotalPointValues(
  teamTotalPointValuesByTeamId: Map<string, number>,
  teamId: string,
  shading: string,
  themeId: string | null,
  createdAt: Date,
): void {
  if (isAttackDefendShadingValue(shading) === false) {
    throw new Error(`Unknown attack/defend shading: ${shading}`);
  }
  const currentTeamTotalPointValue =
    teamTotalPointValuesByTeamId.get(teamId) ?? 0;
  teamTotalPointValuesByTeamId.set(
    teamId,
    currentTeamTotalPointValue +
      getDefendPointValue({
        shading,
        hasThemeSelected: themeId !== null,
        submittedAt: createdAt,
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
        createdAt: true,
      },
    }),
  ]);

  return (
    sumAttackDefendPointValuesFromRows(teamAttackRows) +
    sumDefendPointValuesFromRows(teamDefendRows)
  );
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
        createdAt: true,
      },
    }),
  ]);

  for (const teamAttackRow of teamAttackRows) {
    addAttackRowPointValueToTeamTotalPointValues(
      teamTotalPointValuesByTeamId,
      teamAttackRow.teamId,
      teamAttackRow.shading,
      teamAttackRow.themeId,
    );
  }

  for (const teamDefendRow of teamDefendRows) {
    addDefendRowPointValueToTeamTotalPointValues(
      teamTotalPointValuesByTeamId,
      teamDefendRow.teamId,
      teamDefendRow.shading,
      teamDefendRow.themeId,
      teamDefendRow.createdAt,
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
        createdAt: true,
      },
    }),
  ]);

  for (const teamAttackRow of teamAttackRows) {
    addAttackRowPointValueToTeamTotalPointValues(
      teamTotalPointValuesByTeamId,
      teamAttackRow.teamId,
      teamAttackRow.shading,
      teamAttackRow.themeId,
    );
  }

  for (const teamDefendRow of teamDefendRows) {
    addDefendRowPointValueToTeamTotalPointValues(
      teamTotalPointValuesByTeamId,
      teamDefendRow.teamId,
      teamDefendRow.shading,
      teamDefendRow.themeId,
      teamDefendRow.createdAt,
    );
  }

  return teamTotalPointValuesByTeamId;
}
