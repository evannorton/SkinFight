import { Box, Heading, Link, Text } from "@radix-ui/themes";
import type { Metadata } from "next";
import NextLink from "next/link";
import type { ReactElement } from "react";

import { db } from "~/server/db";
import { getTeamTotalPointValuesByTeamId } from "~/server/team-point-values";

export const metadata: Metadata = {
  title: "Teams · SkinFight",
};

type EventWithTeams = {
  id: string;
  name: string;
  date: Date;
  endDate: Date;
  teams: Array<{ id: string; name: string; sortOrder: number }>;
};

function buildEventDisplayName(eventName: string, eventDate: Date, eventEndDate: Date): string {
  const startDateString = eventDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const endDateString = eventEndDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const displayName = eventName === "" ? "Unnamed Event" : eventName;
  return `${displayName} (${startDateString} - ${endDateString})`;
}

export default async function TeamsPage(): Promise<ReactElement> {
  const [eventsWithTeamsData, teamTotalPointValuesByTeamId] = await Promise.all([
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
  ]);

  const eventsWithTeams: EventWithTeams[] = eventsWithTeamsData.map((event) => {
    return {
      id: event.id,
      name: event.name,
      date: event.date,
      endDate: event.endDate,
      teams: event.eventTeams.map((eventTeam) => {
        return {
          id: eventTeam.team.id,
          name: eventTeam.team.name,
          sortOrder: eventTeam.sortOrder,
        };
      }),
    };
  });

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
        const eventDisplayName = buildEventDisplayName(event.name, event.date, event.endDate);
        return (
          <Box key={event.id} mb="6">
            <Heading as="h2" size="6" mb="3">
              {eventDisplayName}
            </Heading>

            {event.teams.length === 0 && (
              <Text as="p" size="3" color="gray" ml="4">
                No teams for this event.
              </Text>
            )}

            {event.teams.length > 0 && (
              <Box ml="4">
                {event.teams.map((team) => {
                  const teamTotalPointValue =
                    teamTotalPointValuesByTeamId.get(team.id) ?? 0;
                  return (
                    <Text key={team.id} as="p" size="3" mb="2">
                      <Link asChild underline="hover">
                        <NextLink href={`/teams/${team.id}`}>
                          {team.name} ({teamTotalPointValue} points)
                        </NextLink>
                      </Link>
                    </Text>
                  );
                })}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
