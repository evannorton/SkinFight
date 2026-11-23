import "server-only";

import {
  getAttackDefendPointValue,
  getDefendPointValue,
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

const attackDefendShadingPointValueSelect = {
  themeId: true,
  shading: {
    select: {
      pointValue: true,
    },
  },
} as const;

function mapAttackRowsToPointRows(
  attackRows: {
    themeId: string | null;
    shading: { pointValue: number };
  }[],
): { pointValue: number; themeId: string | null }[] {
  return attackRows.map((attackRow) => {
    return {
      pointValue: attackRow.shading.pointValue,
      themeId: attackRow.themeId,
    };
  });
}

function mapDefendRowsToPointRows(
  defendRows: {
    themeId: string | null;
    createdAt: Date;
    shading: { pointValue: number };
  }[],
): { pointValue: number; themeId: string | null; createdAt: Date }[] {
  return defendRows.map((defendRow) => {
    return {
      pointValue: defendRow.shading.pointValue,
      themeId: defendRow.themeId,
      createdAt: defendRow.createdAt,
    };
  });
}

function addAttackRowPointValueToTeamTotalPointValues(
  teamTotalPointValuesByTeamId: Map<string, number>,
  teamId: string,
  pointValue: number,
  themeId: string | null,
): void {
  const currentTeamTotalPointValue =
    teamTotalPointValuesByTeamId.get(teamId) ?? 0;
  teamTotalPointValuesByTeamId.set(
    teamId,
    currentTeamTotalPointValue +
      getAttackDefendPointValue({
        pointValue,
        hasThemeSelected: themeId !== null,
      }),
  );
}

function addDefendRowPointValueToTeamTotalPointValues(
  teamTotalPointValuesByTeamId: Map<string, number>,
  teamId: string,
  pointValue: number,
  themeId: string | null,
  createdAt: Date,
): void {
  const currentTeamTotalPointValue =
    teamTotalPointValuesByTeamId.get(teamId) ?? 0;
  teamTotalPointValuesByTeamId.set(
    teamId,
    currentTeamTotalPointValue +
      getDefendPointValue({
        pointValue,
        hasThemeSelected: themeId !== null,
        submittedAt: createdAt,
      }),
  );
}

function addAttackRowPointValueToUserTotalPointValues(
  userTotalPointValuesByUserId: Map<string, number>,
  userId: string,
  pointValue: number,
  themeId: string | null,
): void {
  const currentUserTotalPointValue =
    userTotalPointValuesByUserId.get(userId) ?? 0;
  userTotalPointValuesByUserId.set(
    userId,
    currentUserTotalPointValue +
      getAttackDefendPointValue({
        pointValue,
        hasThemeSelected: themeId !== null,
      }),
  );
}

function addDefendRowPointValueToUserTotalPointValues(
  userTotalPointValuesByUserId: Map<string, number>,
  userId: string,
  pointValue: number,
  themeId: string | null,
  createdAt: Date,
): void {
  const currentUserTotalPointValue =
    userTotalPointValuesByUserId.get(userId) ?? 0;
  userTotalPointValuesByUserId.set(
    userId,
    currentUserTotalPointValue +
      getDefendPointValue({
        pointValue,
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
      select: attackDefendShadingPointValueSelect,
    }),
    db.defend.findMany({
      where: {
        teamId: teamId,
        ...visibleAttackDefendWhereInput,
      },
      select: {
        ...attackDefendShadingPointValueSelect,
        createdAt: true,
      },
    }),
  ]);

  return (
    sumAttackDefendPointValuesFromRows(mapAttackRowsToPointRows(teamAttackRows)) +
    sumDefendPointValuesFromRows(mapDefendRowsToPointRows(teamDefendRows))
  );
}

export async function getEventUserTeamTotalPointValue(params: {
  eventId: string;
  userId: string;
  teamId: string;
}): Promise<number> {
  const [userAttackRows, userDefendRows] = await Promise.all([
    db.attack.findMany({
      where: {
        eventId: params.eventId,
        userId: params.userId,
        teamId: params.teamId,
        ...visibleAttackDefendWhereInput,
      },
      select: attackDefendShadingPointValueSelect,
    }),
    db.defend.findMany({
      where: {
        eventId: params.eventId,
        userId: params.userId,
        teamId: params.teamId,
        ...visibleAttackDefendWhereInput,
      },
      select: {
        ...attackDefendShadingPointValueSelect,
        createdAt: true,
      },
    }),
  ]);

  return (
    sumAttackDefendPointValuesFromRows(mapAttackRowsToPointRows(userAttackRows)) +
    sumDefendPointValuesFromRows(mapDefendRowsToPointRows(userDefendRows))
  );
}

export async function getTeamUserTotalPointValuesByUserId(
  teamId: string,
): Promise<Map<string, number>> {
  const userTotalPointValuesByUserId = new Map<string, number>();

  const [teamAttackRows, teamDefendRows] = await Promise.all([
    db.attack.findMany({
      where: {
        teamId: teamId,
        ...visibleAttackDefendWhereInput,
      },
      select: {
        userId: true,
        ...attackDefendShadingPointValueSelect,
      },
    }),
    db.defend.findMany({
      where: {
        teamId: teamId,
        ...visibleAttackDefendWhereInput,
      },
      select: {
        userId: true,
        ...attackDefendShadingPointValueSelect,
        createdAt: true,
      },
    }),
  ]);

  for (const teamAttackRow of teamAttackRows) {
    addAttackRowPointValueToUserTotalPointValues(
      userTotalPointValuesByUserId,
      teamAttackRow.userId,
      teamAttackRow.shading.pointValue,
      teamAttackRow.themeId,
    );
  }

  for (const teamDefendRow of teamDefendRows) {
    addDefendRowPointValueToUserTotalPointValues(
      userTotalPointValuesByUserId,
      teamDefendRow.userId,
      teamDefendRow.shading.pointValue,
      teamDefendRow.themeId,
      teamDefendRow.createdAt,
    );
  }

  return userTotalPointValuesByUserId;
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
        ...attackDefendShadingPointValueSelect,
      },
    }),
    db.defend.findMany({
      where: {
        eventId: eventId,
        ...visibleAttackDefendWhereInput,
      },
      select: {
        teamId: true,
        ...attackDefendShadingPointValueSelect,
        createdAt: true,
      },
    }),
  ]);

  for (const teamAttackRow of teamAttackRows) {
    addAttackRowPointValueToTeamTotalPointValues(
      teamTotalPointValuesByTeamId,
      teamAttackRow.teamId,
      teamAttackRow.shading.pointValue,
      teamAttackRow.themeId,
    );
  }

  for (const teamDefendRow of teamDefendRows) {
    addDefendRowPointValueToTeamTotalPointValues(
      teamTotalPointValuesByTeamId,
      teamDefendRow.teamId,
      teamDefendRow.shading.pointValue,
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
        ...attackDefendShadingPointValueSelect,
      },
    }),
    db.defend.findMany({
      where: visibleAttackDefendWhereInput,
      select: {
        teamId: true,
        ...attackDefendShadingPointValueSelect,
        createdAt: true,
      },
    }),
  ]);

  for (const teamAttackRow of teamAttackRows) {
    addAttackRowPointValueToTeamTotalPointValues(
      teamTotalPointValuesByTeamId,
      teamAttackRow.teamId,
      teamAttackRow.shading.pointValue,
      teamAttackRow.themeId,
    );
  }

  for (const teamDefendRow of teamDefendRows) {
    addDefendRowPointValueToTeamTotalPointValues(
      teamTotalPointValuesByTeamId,
      teamDefendRow.teamId,
      teamDefendRow.shading.pointValue,
      teamDefendRow.themeId,
      teamDefendRow.createdAt,
    );
  }

  return teamTotalPointValuesByTeamId;
}
