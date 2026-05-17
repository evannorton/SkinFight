"use client";

import {
  AlertDialog,
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Grid,
  Heading,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";

import { api, type RouterOutputs } from "~/trpc/react";

type TeamListRow = RouterOutputs["team"]["list"][number];

type TeamAdminCardProps = {
  teamRow: TeamListRow;
  onEditRequested: (teamRow: TeamListRow) => void;
  onDeleteRequested: (teamRow: TeamListRow) => void;
};

function TeamAdminCard(props: TeamAdminCardProps): ReactElement {
  const { teamRow, onEditRequested, onDeleteRequested } = props;

  return (
    <Card size="2" variant="surface">
      <Box p="4">
        <Heading
          as="h3"
          size="3"
          weight="bold"
          mb="4"
          style={{ wordBreak: "break-word" }}
        >
          {teamRow.name}
        </Heading>
        <Flex gap="2" wrap="wrap">
          <Button
            type="button"
            variant="soft"
            onClick={() => {
              onEditRequested(teamRow);
            }}
          >
            Edit
          </Button>
          <Button
            type="button"
            color="red"
            variant="soft"
            onClick={() => {
              onDeleteRequested(teamRow);
            }}
          >
            Delete
          </Button>
        </Flex>
      </Box>
    </Card>
  );
}

export function AdminTeamsSection(): ReactElement {
  const [newTeamName, setNewTeamName] = useState<string>("");
  const [teamBeingEdited, setTeamBeingEdited] = useState<TeamListRow | null>(
    null,
  );
  const [editTeamName, setEditTeamName] = useState<string>("");
  const [pendingDeleteTeam, setPendingDeleteTeam] =
    useState<TeamListRow | null>(null);

  const utils = api.useUtils();
  const listTeamsQuery = api.team.list.useQuery();

  const createTeamMutation = api.team.create.useMutation({
    onSuccess: async () => {
      await utils.team.list.invalidate();
      setNewTeamName("");
    },
  });

  const updateTeamMutation = api.team.update.useMutation({
    onSuccess: async () => {
      await utils.team.list.invalidate();
      setTeamBeingEdited(null);
    },
  });

  const deleteTeamMutation = api.team.delete.useMutation({
    onSuccess: async () => {
      await utils.team.list.invalidate();
      setPendingDeleteTeam(null);
    },
  });

  useEffect(() => {
    if (teamBeingEdited === null) {
      return;
    }
    setEditTeamName(teamBeingEdited.name);
  }, [teamBeingEdited]);

  const trimmedNewTeamName = newTeamName.trim();
  const isTeamCreateFormDisabled = createTeamMutation.isPending === true;
  const isCreateDisabled =
    trimmedNewTeamName.length === 0 || isTeamCreateFormDisabled === true;

  const trimmedEditTeamName = editTeamName.trim();
  const isTeamEditFormDisabled = updateTeamMutation.isPending === true;
  const isSaveEditDisabled =
    teamBeingEdited === null ||
    trimmedEditTeamName.length === 0 ||
    isTeamEditFormDisabled === true;

  return (
    <Box mt="6">
      <Separator size="4" mb="6" />
      <Heading as="h3" size="5" weight="bold" mb="3">
        Teams
      </Heading>

      <Flex direction="column" gap="3" mb="6" style={{ maxWidth: "28rem" }}>
        <Text as="label" size="2" weight="medium" htmlFor="team-name">
          Team name
        </Text>
        <TextField.Root
          id="team-name"
          disabled={isTeamCreateFormDisabled === true}
          value={newTeamName}
          placeholder="Team name"
          onChange={(event) => {
            setNewTeamName(event.target.value);
          }}
        />
        <Button
          type="button"
          disabled={isCreateDisabled === true}
          onClick={() => {
            if (trimmedNewTeamName.length === 0) {
              return;
            }
            createTeamMutation.mutate({ name: trimmedNewTeamName });
          }}
        >
          {createTeamMutation.isPending === true ? "Creating…" : "Create team"}
        </Button>
        {createTeamMutation.error !== null && (
          <Text size="2" color="red">
            {createTeamMutation.error.message}
          </Text>
        )}
      </Flex>

      {listTeamsQuery.isLoading === true && (
        <Text size="2" color="gray">
          Loading…
        </Text>
      )}
      {listTeamsQuery.isSuccess === true && listTeamsQuery.data.length === 0 && (
        <Text size="2" color="gray">
          No teams yet.
        </Text>
      )}
      {listTeamsQuery.isSuccess === true && listTeamsQuery.data.length > 0 && (
        <Grid
          columns={{ initial: "1", sm: "2", md: "3" }}
          gap="4"
          width="100%"
        >
          {listTeamsQuery.data.map((teamRow) => (
            <TeamAdminCard
              key={teamRow.id}
              teamRow={teamRow}
              onEditRequested={(row) => {
                setTeamBeingEdited(row);
              }}
              onDeleteRequested={(row) => {
                setPendingDeleteTeam(row);
              }}
            />
          ))}
        </Grid>
      )}

      <Dialog.Root
        open={teamBeingEdited !== null}
        onOpenChange={(open) => {
          if (open === false && isTeamEditFormDisabled === true) {
            return;
          }
          if (open === false) {
            setTeamBeingEdited(null);
          }
        }}
      >
        <Dialog.Content style={{ maxWidth: "min(28rem, 100vw - 2rem)" }}>
          <Dialog.Title>Edit team</Dialog.Title>
          <Flex direction="column" gap="3" mt="3">
            <Text as="label" size="2" weight="medium" htmlFor="edit-team-name">
              Team name
            </Text>
            <TextField.Root
              id="edit-team-name"
              disabled={isTeamEditFormDisabled === true}
              value={editTeamName}
              onChange={(event) => {
                setEditTeamName(event.target.value);
              }}
            />
            {updateTeamMutation.error !== null && (
              <Text size="2" color="red">
                {updateTeamMutation.error.message}
              </Text>
            )}
            <Flex gap="2" justify="end" mt="2">
              <Dialog.Close>
                <Button
                  type="button"
                  variant="soft"
                  disabled={isTeamEditFormDisabled === true}
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="button"
                disabled={isSaveEditDisabled === true}
                onClick={() => {
                  if (teamBeingEdited === null) {
                    return;
                  }
                  if (trimmedEditTeamName.length === 0) {
                    return;
                  }
                  updateTeamMutation.mutate({
                    id: teamBeingEdited.id,
                    name: trimmedEditTeamName,
                  });
                }}
              >
                {updateTeamMutation.isPending === true ? "Saving…" : "Save"}
              </Button>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <AlertDialog.Root
        open={pendingDeleteTeam !== null}
        onOpenChange={(open) => {
          if (open === false) {
            setPendingDeleteTeam(null);
          }
        }}
      >
        <AlertDialog.Content style={{ maxWidth: "min(24rem, 100vw - 2rem)" }}>
          <AlertDialog.Title>Delete team?</AlertDialog.Title>
          <AlertDialog.Description size="2" mt="2">
            {pendingDeleteTeam !== null
              ? `This will permanently remove "${pendingDeleteTeam.name}".`
              : "This will permanently remove this team."}
          </AlertDialog.Description>
          {deleteTeamMutation.error !== null && (
            <Text size="2" color="red" mt="2">
              {deleteTeamMutation.error.message}
            </Text>
          )}
          <Flex gap="2" justify="end" mt="4">
            <AlertDialog.Cancel>
              <Button type="button" variant="soft">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <Button
              type="button"
              color="red"
              disabled={
                pendingDeleteTeam === null ||
                deleteTeamMutation.isPending === true
              }
              onClick={() => {
                if (pendingDeleteTeam === null) {
                  return;
                }
                deleteTeamMutation.mutate({ id: pendingDeleteTeam.id });
              }}
            >
              {deleteTeamMutation.isPending === true ? "Deleting…" : "Delete"}
            </Button>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  );
}
