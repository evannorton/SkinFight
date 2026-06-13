import { Box, Flex, Heading, Link, Text } from "@radix-ui/themes";
import NextLink from "next/link";
import type { ReactElement } from "react";

import type { CurrentEventTeamForParticipation } from "~/lib/event-for-display-types";

type CurrentEventTeamsSectionProps = {
  teams: CurrentEventTeamForParticipation[];
  teamTotalPointValuesByTeamId: Map<string, number>;
};

export function CurrentEventTeamsSection(
  props: CurrentEventTeamsSectionProps,
): ReactElement {
  const { teams, teamTotalPointValuesByTeamId } = props;

  return (
    <Box mt="6">
      <Heading as="h2" size="5" weight="bold" mb="3">
        Teams
      </Heading>

      {teams.length === 0 && (
        <Text as="p" size="3" color="gray">
          No teams for this event.
        </Text>
      )}

      {teams.length > 0 && (
        <Flex direction="column" gap="2">
          {teams.map((teamRow) => {
            const teamTotalPointValue =
              teamTotalPointValuesByTeamId.get(teamRow.teamId) ?? 0;
            return (
              <Text key={teamRow.teamId} as="p" size="3">
                <Link asChild underline="hover">
                  <NextLink href={`/teams/${teamRow.teamId}`}>
                    {teamRow.teamName} ({teamTotalPointValue} points)
                  </NextLink>
                </Link>
              </Text>
            );
          })}
        </Flex>
      )}
    </Box>
  );
}
