"use client";

import { Box, Heading, Link, Text } from "@radix-ui/themes";
import NextLink from "next/link";
import type { ReactElement } from "react";

import { useBrowserEventDisplayNameWithDateTimeRange } from "~/lib/use-browser-event-display-name-with-datetime-range";

export type TeamsPageEventWithTeams = {
  id: string;
  name: string;
  startsAtIso: string;
  endsAtIso: string;
  teams: Array<{ id: string; name: string; sortOrder: number }>;
};

type TeamsPageEventSectionProps = {
  event: TeamsPageEventWithTeams;
  teamTotalPointValuesByTeamId: Record<string, number>;
};

export function TeamsPageEventSection(
  props: TeamsPageEventSectionProps,
): ReactElement {
  const { event, teamTotalPointValuesByTeamId } = props;
  const eventDisplayName = useBrowserEventDisplayNameWithDateTimeRange({
    eventName: event.name,
    startsAt: event.startsAtIso,
    endsAt: event.endsAtIso,
    emptyNameFallback: "Unnamed Event",
  });

  return (
    <Box mb="6">
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
              teamTotalPointValuesByTeamId[team.id] ?? 0;
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
}
