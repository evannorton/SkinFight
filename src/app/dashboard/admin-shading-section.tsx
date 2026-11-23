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

type ShadingListRow = RouterOutputs["shading"]["list"][number];

type ShadingAdminCardProps = {
  shadingRow: ShadingListRow;
  onEditRequested: (shadingRow: ShadingListRow) => void;
  onDeleteRequested: (shadingRow: ShadingListRow) => void;
};

function ShadingAdminCard(props: ShadingAdminCardProps): ReactElement {
  const { shadingRow, onEditRequested, onDeleteRequested } = props;

  return (
    <Card size="2" variant="surface">
      <Box p="4">
        <Heading
          as="h3"
          size="3"
          weight="bold"
          mb="2"
          style={{ wordBreak: "break-word" }}
        >
          {shadingRow.label}
        </Heading>
        <Text as="p" size="2" color="gray" mb="4">
          {shadingRow.pointValue} points
        </Text>
        <Flex gap="2" wrap="wrap">
          <Button
            type="button"
            variant="soft"
            onClick={() => {
              onEditRequested(shadingRow);
            }}
          >
            Edit
          </Button>
          <Button
            type="button"
            color="red"
            variant="soft"
            onClick={() => {
              onDeleteRequested(shadingRow);
            }}
          >
            Delete
          </Button>
        </Flex>
      </Box>
    </Card>
  );
}

function parsePointValueInput(pointValueInput: string): number | null {
  const trimmedPointValueInput = pointValueInput.trim();
  if (trimmedPointValueInput.length === 0) {
    return null;
  }
  if (/^\d+$/.test(trimmedPointValueInput) === false) {
    return null;
  }
  return Number(trimmedPointValueInput);
}

export function AdminShadingSection(): ReactElement {
  const [newShadingLabel, setNewShadingLabel] = useState<string>("");
  const [newShadingPointValueInput, setNewShadingPointValueInput] =
    useState<string>("");
  const [shadingBeingEdited, setShadingBeingEdited] =
    useState<ShadingListRow | null>(null);
  const [editShadingLabel, setEditShadingLabel] = useState<string>("");
  const [editShadingPointValueInput, setEditShadingPointValueInput] =
    useState<string>("");
  const [pendingDeleteShading, setPendingDeleteShading] =
    useState<ShadingListRow | null>(null);

  const utils = api.useUtils();
  const listShadingsQuery = api.shading.list.useQuery();

  const createShadingMutation = api.shading.create.useMutation({
    onSuccess: async () => {
      await utils.shading.list.invalidate();
      setNewShadingLabel("");
      setNewShadingPointValueInput("");
    },
  });

  const updateShadingMutation = api.shading.update.useMutation({
    onSuccess: async () => {
      await utils.shading.list.invalidate();
      setShadingBeingEdited(null);
    },
  });

  const deleteShadingMutation = api.shading.delete.useMutation({
    onSuccess: async () => {
      await utils.shading.list.invalidate();
      setPendingDeleteShading(null);
    },
  });

  useEffect(() => {
    if (shadingBeingEdited === null) {
      return;
    }
    setEditShadingLabel(shadingBeingEdited.label);
    setEditShadingPointValueInput(String(shadingBeingEdited.pointValue));
  }, [shadingBeingEdited]);

  const trimmedNewShadingLabel = newShadingLabel.trim();
  const parsedNewShadingPointValue = parsePointValueInput(
    newShadingPointValueInput,
  );
  const isShadingCreateFormDisabled = createShadingMutation.isPending === true;
  const isCreateDisabled =
    trimmedNewShadingLabel.length === 0 ||
    parsedNewShadingPointValue === null ||
    isShadingCreateFormDisabled === true;

  const trimmedEditShadingLabel = editShadingLabel.trim();
  const parsedEditShadingPointValue = parsePointValueInput(
    editShadingPointValueInput,
  );
  const isShadingEditFormDisabled = updateShadingMutation.isPending === true;
  const isSaveEditDisabled =
    shadingBeingEdited === null ||
    trimmedEditShadingLabel.length === 0 ||
    parsedEditShadingPointValue === null ||
    isShadingEditFormDisabled === true;

  return (
    <Box mt="6">
      <Separator size="4" mb="6" />
      <Heading as="h3" size="5" weight="bold" mb="3">
        Shading values
      </Heading>
      <Text as="p" size="2" color="gray" mb="4">
        Labels and point values shown when submitting enemy or friendly team
        attacks.
      </Text>

      <Flex direction="column" gap="3" mb="6" style={{ maxWidth: "28rem" }}>
        <Text as="label" size="2" weight="medium" htmlFor="shading-label">
          Label
        </Text>
        <TextField.Root
          id="shading-label"
          disabled={isShadingCreateFormDisabled === true}
          value={newShadingLabel}
          placeholder="A"
          onChange={(event) => {
            setNewShadingLabel(event.target.value);
          }}
        />
        <Text
          as="label"
          size="2"
          weight="medium"
          htmlFor="shading-point-value"
        >
          Point value
        </Text>
        <TextField.Root
          id="shading-point-value"
          type="number"
          min={0}
          step={1}
          disabled={isShadingCreateFormDisabled === true}
          value={newShadingPointValueInput}
          placeholder="5"
          onChange={(event) => {
            setNewShadingPointValueInput(event.target.value);
          }}
        />
        <Button
          type="button"
          disabled={isCreateDisabled === true}
          onClick={() => {
            if (trimmedNewShadingLabel.length === 0) {
              return;
            }
            if (parsedNewShadingPointValue === null) {
              return;
            }
            createShadingMutation.mutate({
              label: trimmedNewShadingLabel,
              pointValue: parsedNewShadingPointValue,
            });
          }}
        >
          {createShadingMutation.isPending === true
            ? "Creating…"
            : "Create shading"}
        </Button>
        {createShadingMutation.error !== null && (
          <Text size="2" color="red">
            {createShadingMutation.error.message}
          </Text>
        )}
      </Flex>

      {listShadingsQuery.isLoading === true && (
        <Text size="2" color="gray">
          Loading…
        </Text>
      )}
      {listShadingsQuery.isSuccess === true &&
        listShadingsQuery.data.length === 0 && (
          <Text size="2" color="gray">
            No shading values yet.
          </Text>
        )}
      {listShadingsQuery.isSuccess === true &&
        listShadingsQuery.data.length > 0 && (
          <Grid
            columns={{ initial: "1", sm: "2", md: "3" }}
            gap="4"
            width="100%"
          >
            {listShadingsQuery.data.map((shadingRow) => (
              <ShadingAdminCard
                key={shadingRow.id}
                shadingRow={shadingRow}
                onEditRequested={(row) => {
                  setShadingBeingEdited(row);
                }}
                onDeleteRequested={(row) => {
                  setPendingDeleteShading(row);
                }}
              />
            ))}
          </Grid>
        )}

      <Dialog.Root
        open={shadingBeingEdited !== null}
        onOpenChange={(open) => {
          if (open === false && isShadingEditFormDisabled === true) {
            return;
          }
          if (open === false) {
            setShadingBeingEdited(null);
          }
        }}
      >
        <Dialog.Content style={{ maxWidth: "min(28rem, 100vw - 2rem)" }}>
          <Dialog.Title>Edit shading</Dialog.Title>
          <Flex direction="column" gap="3" mt="3">
            <Text
              as="label"
              size="2"
              weight="medium"
              htmlFor="edit-shading-label"
            >
              Label
            </Text>
            <TextField.Root
              id="edit-shading-label"
              disabled={isShadingEditFormDisabled === true}
              value={editShadingLabel}
              onChange={(event) => {
                setEditShadingLabel(event.target.value);
              }}
            />
            <Text
              as="label"
              size="2"
              weight="medium"
              htmlFor="edit-shading-point-value"
            >
              Point value
            </Text>
            <TextField.Root
              id="edit-shading-point-value"
              type="number"
              min={0}
              step={1}
              disabled={isShadingEditFormDisabled === true}
              value={editShadingPointValueInput}
              onChange={(event) => {
                setEditShadingPointValueInput(event.target.value);
              }}
            />
            {updateShadingMutation.error !== null && (
              <Text size="2" color="red">
                {updateShadingMutation.error.message}
              </Text>
            )}
            <Flex gap="2" justify="end" mt="2">
              <Dialog.Close>
                <Button
                  type="button"
                  variant="soft"
                  disabled={isShadingEditFormDisabled === true}
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="button"
                disabled={isSaveEditDisabled === true}
                onClick={() => {
                  if (shadingBeingEdited === null) {
                    return;
                  }
                  if (trimmedEditShadingLabel.length === 0) {
                    return;
                  }
                  if (parsedEditShadingPointValue === null) {
                    return;
                  }
                  updateShadingMutation.mutate({
                    id: shadingBeingEdited.id,
                    label: trimmedEditShadingLabel,
                    pointValue: parsedEditShadingPointValue,
                  });
                }}
              >
                {updateShadingMutation.isPending === true ? "Saving…" : "Save"}
              </Button>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <AlertDialog.Root
        open={pendingDeleteShading !== null}
        onOpenChange={(open) => {
          if (open === false) {
            setPendingDeleteShading(null);
          }
        }}
      >
        <AlertDialog.Content style={{ maxWidth: "min(24rem, 100vw - 2rem)" }}>
          <AlertDialog.Title>Delete shading?</AlertDialog.Title>
          <AlertDialog.Description size="2" mt="2">
            {pendingDeleteShading !== null
              ? `This will permanently remove "${pendingDeleteShading.label}". Shading values still used by attacks cannot be deleted.`
              : "This will permanently remove this shading value."}
          </AlertDialog.Description>
          {deleteShadingMutation.error !== null && (
            <Text size="2" color="red" mt="2">
              {deleteShadingMutation.error.message}
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
                pendingDeleteShading === null ||
                deleteShadingMutation.isPending === true
              }
              onClick={() => {
                if (pendingDeleteShading === null) {
                  return;
                }
                deleteShadingMutation.mutate({ id: pendingDeleteShading.id });
              }}
            >
              {deleteShadingMutation.isPending === true
                ? "Deleting…"
                : "Delete"}
            </Button>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  );
}
