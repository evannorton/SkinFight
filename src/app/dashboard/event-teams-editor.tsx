"use client";

import {
  Box,
  Button,
  Flex,
  Select,
  Text,
} from "@radix-ui/themes";
import type { ReactElement } from "react";
import { useState } from "react";

import type { RouterOutputs } from "~/trpc/react";

type TeamListRow = RouterOutputs["team"]["list"][number];

type EventTeamsEditorProps = {
  draftTeamIds: string[];
  allTeams: TeamListRow[];
  onDraftTeamIdsChange: (draftTeamIds: string[]) => void;
  areInputsDisabled: boolean;
};

export function EventTeamsEditor(props: EventTeamsEditorProps): ReactElement {
  const { draftTeamIds, allTeams, onDraftTeamIdsChange, areInputsDisabled } =
    props;
  const [selectedTeamIdToAdd, setSelectedTeamIdToAdd] = useState<string>("");

  const teamsById = new Map<string, TeamListRow>(
    allTeams.map((teamRow) => [teamRow.id, teamRow]),
  );

  const assignedTeamIds = new Set<string>(draftTeamIds);
  const teamsAvailableToAdd = allTeams.filter(
    (teamRow) => assignedTeamIds.has(teamRow.id) === false,
  );

  const isAddTeamDisabled =
    selectedTeamIdToAdd.length === 0 || areInputsDisabled === true;

  return (
    <Box>
      <Text as="p" size="2" weight="medium" mb="2">
        Teams
      </Text>
      {draftTeamIds.length === 0 && (
        <Text as="p" size="2" color="gray" mb="2">
          No teams on this event yet.
        </Text>
      )}
      {draftTeamIds.length > 0 && (
        <Flex direction="column" gap="2" mb="3">
          {draftTeamIds.map((teamId, teamIndex) => {
            const teamRow = teamsById.get(teamId);
            const teamDisplayName = teamRow?.name ?? "Unknown team";
            const isFirstTeam = teamIndex === 0;
            const isLastTeam = teamIndex === draftTeamIds.length - 1;

            return (
              <Flex key={teamId} align="center" gap="2" wrap="wrap">
                <Text size="2" style={{ flex: "1 1 auto", minWidth: "6rem" }}>
                  {teamDisplayName}
                </Text>
                <Button
                  type="button"
                  size="1"
                  variant="soft"
                  disabled={
                    isFirstTeam === true || areInputsDisabled === true
                  }
                  onClick={() => {
                    if (teamIndex === 0) {
                      return;
                    }
                    const reorderedTeamIds = [...draftTeamIds];
                    const previousTeamId = reorderedTeamIds[teamIndex - 1];
                    const currentTeamId = reorderedTeamIds[teamIndex];
                    if (
                      previousTeamId === undefined ||
                      currentTeamId === undefined
                    ) {
                      return;
                    }
                    reorderedTeamIds[teamIndex - 1] = currentTeamId;
                    reorderedTeamIds[teamIndex] = previousTeamId;
                    onDraftTeamIdsChange(reorderedTeamIds);
                  }}
                >
                  Up
                </Button>
                <Button
                  type="button"
                  size="1"
                  variant="soft"
                  disabled={
                    isLastTeam === true || areInputsDisabled === true
                  }
                  onClick={() => {
                    if (teamIndex === draftTeamIds.length - 1) {
                      return;
                    }
                    const reorderedTeamIds = [...draftTeamIds];
                    const nextTeamId = reorderedTeamIds[teamIndex + 1];
                    const currentTeamId = reorderedTeamIds[teamIndex];
                    if (nextTeamId === undefined || currentTeamId === undefined) {
                      return;
                    }
                    reorderedTeamIds[teamIndex + 1] = currentTeamId;
                    reorderedTeamIds[teamIndex] = nextTeamId;
                    onDraftTeamIdsChange(reorderedTeamIds);
                  }}
                >
                  Down
                </Button>
                <Button
                  type="button"
                  size="1"
                  color="red"
                  variant="soft"
                  disabled={areInputsDisabled === true}
                  onClick={() => {
                    const teamIdsWithoutRemoved = draftTeamIds.filter(
                      (id) => id !== teamId,
                    );
                    onDraftTeamIdsChange(teamIdsWithoutRemoved);
                  }}
                >
                  Remove
                </Button>
              </Flex>
            );
          })}
        </Flex>
      )}
      {teamsAvailableToAdd.length === 0 && draftTeamIds.length > 0 && (
        <Text as="p" size="2" color="gray">
          All teams are already on this event.
        </Text>
      )}
      {teamsAvailableToAdd.length > 0 && (
        <Flex direction="column" gap="2">
          <Select.Root
            disabled={areInputsDisabled === true}
            value={
              selectedTeamIdToAdd.length > 0 ? selectedTeamIdToAdd : undefined
            }
            onValueChange={(value) => {
              setSelectedTeamIdToAdd(value);
            }}
          >
            <Select.Trigger placeholder="Select a team to add" />
            <Select.Content>
              {teamsAvailableToAdd.map((teamRow) => (
                <Select.Item key={teamRow.id} value={teamRow.id}>
                  {teamRow.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Button
            type="button"
            size="2"
            variant="soft"
            disabled={isAddTeamDisabled}
            onClick={() => {
              if (selectedTeamIdToAdd.length === 0) {
                return;
              }
              onDraftTeamIdsChange([...draftTeamIds, selectedTeamIdToAdd]);
              setSelectedTeamIdToAdd("");
            }}
          >
            Add team
          </Button>
        </Flex>
      )}
      {teamsAvailableToAdd.length === 0 && allTeams.length === 0 && (
        <Text as="p" size="2" color="gray">
          Create teams in the Teams section first.
        </Text>
      )}
    </Box>
  );
}
