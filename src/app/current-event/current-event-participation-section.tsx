"use client";

import { Box, Button, Flex, Heading, Link, Text } from "@radix-ui/themes";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useState } from "react";

import type { CurrentEventTeamForParticipation } from "~/lib/event-for-display-types";
import { api } from "~/trpc/react";

type CurrentEventParticipationSectionProps = {
  isUserSignedIn: boolean;
  eventId: string;
  teams: CurrentEventTeamForParticipation[];
  userParticipationTeamId: string | null;
  userContributedPointValue: number | null;
};

export function CurrentEventParticipationSection(
  props: CurrentEventParticipationSectionProps,
): ReactElement {
  const {
    isUserSignedIn,
    eventId,
    teams,
    userParticipationTeamId,
    userContributedPointValue,
  } = props;
  const router = useRouter();
  const [participationErrorMessage, setParticipationErrorMessage] = useState<
    string | null
  >(null);
  const [joiningTeamId, setJoiningTeamId] = useState<string | null>(null);

  const joinEventParticipationMutation =
    api.eventParticipation.join.useMutation({
      onSuccess: async () => {
        setParticipationErrorMessage(null);
        setJoiningTeamId(null);
        router.refresh();
      },
      onError: (error) => {
        setParticipationErrorMessage(error.message);
        setJoiningTeamId(null);
      },
    });

  const isParticipationActionPending =
    joiningTeamId !== null ||
    joinEventParticipationMutation.isPending === true;

  const userParticipationTeamName =
    userParticipationTeamId !== null
      ? (teams.find((teamRow) => teamRow.teamId === userParticipationTeamId)
          ?.teamName ?? null)
      : null;

  let participationStatusMessage: string | null = null;
  if (isUserSignedIn === true && userParticipationTeamId !== null) {
    participationStatusMessage = `You are participating on ${userParticipationTeamName ?? "your team"}.`;
    if (userContributedPointValue !== null) {
      participationStatusMessage = `You are participating on ${userParticipationTeamName ?? "your team"}. You have contributed ${userContributedPointValue} points to your team.`;
    }
  }

  return (
    <Box mt="6">
      <Heading as="h2" size="5" weight="bold" mb="3">
        Participate
      </Heading>
      {isUserSignedIn === false && (
        <>
          <Text as="p" size="3" color="gray" mb="3">
            You must sign in to participate in this event.
          </Text>
          <Link asChild size="3" weight="medium" underline="hover">
            <NextLink href="/signin">Sign in</NextLink>
          </Link>
        </>
      )}
      {participationStatusMessage !== null && (
        <Text as="p" size="3" color="gray">
          {participationStatusMessage}
        </Text>
      )}
      {isUserSignedIn === true &&
        userParticipationTeamId === null &&
        teams.length === 0 && (
          <Text as="p" size="3" color="gray">
            No teams are available for this event yet.
          </Text>
        )}
      {isUserSignedIn === true &&
        userParticipationTeamId === null &&
        teams.length > 0 && (
          <Flex direction="column" gap="2">
            {teams.map((teamRow) => {
              return (
                <Flex
                  key={teamRow.teamId}
                  align="center"
                  justify="between"
                  gap="3"
                >
                  <Text size="3">{teamRow.teamName}</Text>
                  <Button
                    type="button"
                    variant="soft"
                    disabled={isParticipationActionPending === true}
                    onClick={() => {
                      setParticipationErrorMessage(null);
                      setJoiningTeamId(teamRow.teamId);
                      joinEventParticipationMutation.mutate({
                        eventId,
                        teamId: teamRow.teamId,
                      });
                    }}
                  >
                    {joiningTeamId === teamRow.teamId &&
                    joinEventParticipationMutation.isPending === true
                      ? "Joining…"
                      : "Join"}
                  </Button>
                </Flex>
              );
            })}
          </Flex>
        )}
      {participationErrorMessage !== null && (
        <Text size="2" color="red" mt="2">
          {participationErrorMessage}
        </Text>
      )}
    </Box>
  );
}
