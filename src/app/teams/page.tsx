import { Box, Heading, Text } from "@radix-ui/themes";
import type { Metadata } from "next";
import type { ReactElement } from "react";

import {
  TeamsPageEventSection,
  type TeamsPageEventWithTeams,
} from "~/app/teams/teams-page-event-section";
import { db } from "~/server/db";
import { getTeamTotalPointValuesByTeamId } from "~/server/team-point-values";

export const metadata: Metadata = {
  title: "Teams · SkinFight",
};

export default async function TeamsPage(): Promise<ReactElement> {
  const [eventsWithTeamsData, teamTotalPointValuesByTeamId] = await Promise.all(
    [
      db.event.findMany({
        orderBy: { date: "desc" },
        select: {
          id: true,
          name: true,
          date: true,
          endDate: true,
          eventTeams: {
            orderBy: { sortOrder: "asc" },
            select: {
              sortOrder: true,
              team: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      getTeamTotalPointValuesByTeamId(),
    ],
  );

  const eventsWithTeams: TeamsPageEventWithTeams[] = eventsWithTeamsData.map(
    (event) => {
      return {
        id: event.id,
        name: event.name,
        startsAtIso: event.date.toISOString(),
        endsAtIso: event.endDate.toISOString(),
        teams: event.eventTeams.map((eventTeam) => {
          return {
            id: eventTeam.team.id,
            name: eventTeam.team.name,
            sortOrder: eventTeam.sortOrder,
          };
        }),
      };
    },
  );

  const teamTotalPointValuesRecord: Record<string, number> = Object.fromEntries(
    teamTotalPointValuesByTeamId.entries(),
  );

  return (
    <Box px="6" py="6">
      <Heading as="h1" size="8" mb="6">
        Teams
      </Heading>

      {eventsWithTeams.length === 0 && (
        <Text as="p" size="3" color="gray">
          No events found.
        </Text>
      )}

      {eventsWithTeams.map((event) => {
        return (
          <TeamsPageEventSection
            key={event.id}
            event={event}
            teamTotalPointValuesByTeamId={teamTotalPointValuesRecord}
          />
        );
      })}
    </Box>
  );
}
