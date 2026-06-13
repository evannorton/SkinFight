import "server-only";

import {
  getAttackDefendShadingPointValue,
  isAttackDefendShadingValue,
  sumAttackDefendShadingPointValuesFromShadingRows,
} from "~/lib/attack-defend-shading";
import { db } from "~/server/db";

const visibleAttackDefendWhereInput = {
  isHidden: false,
  character: {
    isHidden: false,
  },
};

function addShadingRowPointValueToTeamTotalPointValues(
  teamTotalPointValuesByTeamId: Map<string, number>,
  teamId: string,
  shading: string,
): void {
  if (isAttackDefendShadingValue(shading) === false) {
    throw new Error(`Unknown attack/defend shading: ${shading}`);
  }
  const currentTeamTotalPointValue = teamTotalPointValuesByTeamId.get(teamId) ?? 0;
  teamTotalPointValuesByTeamId.set(
    teamId,
    currentTeamTotalPointValue + getAttackDefendShadingPointValue(shading),
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
      },
    }),
    db.defend.findMany({
      where: {
        teamId: teamId,
        ...visibleAttackDefendWhereInput,
      },
      select: {
        shading: true,
      },
    }),
  ]);

  return sumAttackDefendShadingPointValuesFromShadingRows([
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
      },
    }),
  ]);

  for (const teamAttackRow of teamAttackRows) {
    addShadingRowPointValueToTeamTotalPointValues(
      teamTotalPointValuesByTeamId,
      teamAttackRow.teamId,
      teamAttackRow.shading,
    );
  }

  for (const teamDefendRow of teamDefendRows) {
    addShadingRowPointValueToTeamTotalPointValues(
      teamTotalPointValuesByTeamId,
      teamDefendRow.teamId,
      teamDefendRow.shading,
    );
  }

  return teamTotalPointValuesByTeamId;
}

export async function getTeamTotalPointValuesByTeamId(): Promise<Map<string, number>> {
  const teamTotalPointValuesByTeamId = new Map<string, number>();

  const [teamAttackRows, teamDefendRows] = await Promise.all([
    db.attack.findMany({
      where: visibleAttackDefendWhereInput,
      select: {
        teamId: true,
        shading: true,
      },
    }),
    db.defend.findMany({
      where: visibleAttackDefendWhereInput,
      select: {
        teamId: true,
        shading: true,
      },
    }),
  ]);

  for (const teamAttackRow of teamAttackRows) {
    addShadingRowPointValueToTeamTotalPointValues(
      teamTotalPointValuesByTeamId,
      teamAttackRow.teamId,
      teamAttackRow.shading,
    );
  }

  for (const teamDefendRow of teamDefendRows) {
    addShadingRowPointValueToTeamTotalPointValues(
      teamTotalPointValuesByTeamId,
      teamDefendRow.teamId,
      teamDefendRow.shading,
    );
  }

  return teamTotalPointValuesByTeamId;
}
