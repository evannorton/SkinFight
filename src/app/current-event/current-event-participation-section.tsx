"use client";

import { Box, Button, Flex, Heading, Link, Text } from "@radix-ui/themes";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useState } from "react";

import type { CurrentEventTeamForParticipation } from "~/server/event-for-display";
import { api } from "~/trpc/react";

type CurrentEventParticipationSectionProps = {
  isUserSignedIn: boolean;
  eventId: string;
  teams: CurrentEventTeamForParticipation[];
  userParticipationTeamId: string | null;
};

export function CurrentEventParticipationSection(
  props: CurrentEventParticipationSectionProps,
): ReactElement {
  const { isUserSignedIn, eventId, teams, userParticipationTeamId } = props;
  const router = useRouter();
  const [participationErrorMessage, setParticipationErrorMessage] = useState<
    string | null
  >(null);
  const [joiningTeamId, setJoiningTeamId] = useState<string | null>(null);
  const [isLeavingTeam, setIsLeavingTeam] = useState<boolean>(false);

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

  const leaveEventTeamMutation = api.eventParticipation.leaveTeam.useMutation({
    onSuccess: async () => {
      setParticipationErrorMessage(null);
      setIsLeavingTeam(false);
      router.refresh();
    },
    onError: (error) => {
      setParticipationErrorMessage(error.message);
      setIsLeavingTeam(false);
    },
  });

  const isParticipationActionPending =
    joiningTeamId !== null ||
    isLeavingTeam === true ||
    joinEventParticipationMutation.isPending === true ||
    leaveEventTeamMutation.isPending === true;

  const userParticipationTeamName =
    userParticipationTeamId !== null
      ? (teams.find((teamRow) => teamRow.teamId === userParticipationTeamId)
          ?.teamName ?? null)
      : null;

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
            <NextLink href="/api/auth/signin">Sign in</NextLink>
          </Link>
        </>
      )}
      {isUserSignedIn === true && userParticipationTeamId !== null && (
        <Flex direction="column" gap="3" align="start">
          <Text as="p" size="3" color="gray">
            You are participating on{" "}
            {userParticipationTeamName ?? "your team"}.
          </Text>
          <Button
            type="button"
            variant="soft"
            color="red"
            disabled={isParticipationActionPending === true}
            onClick={() => {
              setParticipationErrorMessage(null);
              setIsLeavingTeam(true);
              leaveEventTeamMutation.mutate({ eventId });
            }}
          >
            {isLeavingTeam === true && leaveEventTeamMutation.isPending === true
              ? "Leaving…"
              : "Leave team"}
          </Button>
        </Flex>
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
