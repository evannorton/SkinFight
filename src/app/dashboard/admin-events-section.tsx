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

import { EventTeamsEditor } from "~/app/dashboard/event-teams-editor";
import { formatDateToDatetimeLocalValue } from "~/lib/format-date-to-datetime-local-value";
import { formatEventDateTimeRangeLabel } from "~/lib/format-event-datetime-range-label";
import { api, type RouterOutputs } from "~/trpc/react";

type EventListRow = RouterOutputs["event"]["list"][number];

type EventAdminCardProps = {
  eventRow: EventListRow;
  onEditRequested: (eventRow: EventListRow) => void;
  onDeleteRequested: (eventRow: EventListRow) => void;
};

function EventAdminCard(props: EventAdminCardProps): ReactElement {
  const { eventRow, onEditRequested, onDeleteRequested } = props;
  const formattedDateTime = formatEventDateTimeRangeLabel(
    new Date(eventRow.date),
    new Date(eventRow.endDate),
  );
  const displayTitle =
    eventRow.name.trim().length > 0 ? eventRow.name : "Untitled";

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
          {displayTitle}
        </Heading>
        <Text size="2" color="gray" mb="3" style={{ display: "block" }}>
          {formattedDateTime}
        </Text>
        {eventRow.eventTeams.length > 0 && (
          <Text as="p" size="2" color="gray" mb="4" style={{ display: "block" }}>
            {eventRow.eventTeams
              .map((eventTeamRow) => eventTeamRow.team.name)
              .join(", ")}
          </Text>
        )}
        {eventRow.eventTeams.length === 0 && (
          <Text as="p" size="2" color="gray" mb="4" style={{ display: "block" }}>
            No teams
          </Text>
        )}
        <Flex gap="2" wrap="wrap">
          <Button
            type="button"
            variant="soft"
            onClick={() => {
              onEditRequested(eventRow);
            }}
          >
            Edit
          </Button>
          <Button
            type="button"
            color="red"
            variant="soft"
            onClick={() => {
              onDeleteRequested(eventRow);
            }}
          >
            Delete
          </Button>
        </Flex>
      </Box>
    </Card>
  );
}

export function AdminEventsSection(): ReactElement {
  const [newEventName, setNewEventName] = useState<string>("");
  const [selectedStartDateTimeLocalInput, setSelectedStartDateTimeLocalInput] =
    useState<string>("");
  const [selectedEndDateTimeLocalInput, setSelectedEndDateTimeLocalInput] =
    useState<string>("");
  const [eventBeingEdited, setEventBeingEdited] = useState<EventListRow | null>(
    null,
  );
  const [editEventName, setEditEventName] = useState<string>("");
  const [editStartDateTimeLocalInput, setEditStartDateTimeLocalInput] =
    useState<string>("");
  const [editEndDateTimeLocalInput, setEditEndDateTimeLocalInput] =
    useState<string>("");
  const [editEventTeamIds, setEditEventTeamIds] = useState<string[]>([]);
  const [pendingDeleteEvent, setPendingDeleteEvent] =
    useState<EventListRow | null>(null);

  const utils = api.useUtils();
  const listEventsQuery = api.event.list.useQuery();
  const listTeamsQuery = api.team.list.useQuery();

  const createEventMutation = api.event.create.useMutation({
    onSuccess: async () => {
      await utils.event.list.invalidate();
      setNewEventName("");
      setSelectedStartDateTimeLocalInput("");
      setSelectedEndDateTimeLocalInput("");
    },
  });

  const updateEventMutation = api.event.update.useMutation({
    onSuccess: async () => {
      await utils.event.list.invalidate();
      setEventBeingEdited(null);
    },
  });

  const deleteEventMutation = api.event.delete.useMutation({
    onSuccess: async () => {
      await utils.event.list.invalidate();
      setPendingDeleteEvent(null);
    },
  });

  useEffect(() => {
    if (eventBeingEdited === null) {
      return;
    }
    setEditEventName(eventBeingEdited.name);
    setEditStartDateTimeLocalInput(
      formatDateToDatetimeLocalValue(new Date(eventBeingEdited.date)),
    );
    setEditEndDateTimeLocalInput(
      formatDateToDatetimeLocalValue(new Date(eventBeingEdited.endDate)),
    );
    setEditEventTeamIds(
      eventBeingEdited.eventTeams.map((eventTeamRow) => eventTeamRow.teamId),
    );
  }, [eventBeingEdited]);

  const trimmedNewEventName = newEventName.trim();
  const isCreateDisabled =
    trimmedNewEventName.length === 0 ||
    selectedStartDateTimeLocalInput.length === 0 ||
    selectedEndDateTimeLocalInput.length === 0 ||
    createEventMutation.isPending === true;

  const trimmedEditEventName = editEventName.trim();
  const isEventEditFormDisabled = updateEventMutation.isPending === true;
  const isSaveEditDisabled =
    eventBeingEdited === null ||
    trimmedEditEventName.length === 0 ||
    editStartDateTimeLocalInput.length === 0 ||
    editEndDateTimeLocalInput.length === 0 ||
    isEventEditFormDisabled === true;

  return (
    <Box mt="6">
      <Separator size="4" mb="6" />
      <Heading as="h3" size="5" weight="bold" mb="3">
        Events
      </Heading>

      <Flex direction="column" gap="3" mb="6" style={{ maxWidth: "28rem" }}>
        <Text as="label" size="2" weight="medium" htmlFor="event-name">
          Event name
        </Text>
        <TextField.Root
          id="event-name"
          value={newEventName}
          placeholder="Event name"
          onChange={(event) => {
            setNewEventName(event.target.value);
          }}
        />
        <Text as="label" size="2" weight="medium" htmlFor="event-start-datetime">
          Start date and time
        </Text>
        <TextField.Root
          className="skinfight-event-datetime-text-field"
          id="event-start-datetime"
          type="datetime-local"
          step={60}
          value={selectedStartDateTimeLocalInput}
          onChange={(event) => {
            setSelectedStartDateTimeLocalInput(event.target.value);
          }}
        />
        <Text as="label" size="2" weight="medium" htmlFor="event-end-datetime">
          End date and time
        </Text>
        <TextField.Root
          className="skinfight-event-datetime-text-field"
          id="event-end-datetime"
          type="datetime-local"
          step={60}
          value={selectedEndDateTimeLocalInput}
          onChange={(event) => {
            setSelectedEndDateTimeLocalInput(event.target.value);
          }}
        />
        <Button
          type="button"
          disabled={isCreateDisabled}
          onClick={() => {
            if (trimmedNewEventName.length === 0) {
              return;
            }
            if (selectedStartDateTimeLocalInput.length === 0) {
              return;
            }
            if (selectedEndDateTimeLocalInput.length === 0) {
              return;
            }
            const parsedStartDate = new Date(selectedStartDateTimeLocalInput);
            const parsedEndDate = new Date(selectedEndDateTimeLocalInput);
            if (Number.isNaN(parsedStartDate.getTime()) === true) {
              return;
            }
            if (Number.isNaN(parsedEndDate.getTime()) === true) {
              return;
            }
            if (parsedEndDate.getTime() <= parsedStartDate.getTime()) {
              return;
            }
            createEventMutation.mutate({
              name: trimmedNewEventName,
              date: parsedStartDate,
              endDate: parsedEndDate,
            });
          }}
        >
          {createEventMutation.isPending === true
            ? "Creating…"
            : "Create event"}
        </Button>
        {createEventMutation.error !== null && (
          <Text size="2" color="red">
            {createEventMutation.error.message}
          </Text>
        )}
      </Flex>

      {listEventsQuery.isLoading === true && (
        <Text size="2" color="gray">
          Loading…
        </Text>
      )}
      {listEventsQuery.isSuccess === true &&
        listEventsQuery.data.length === 0 && (
          <Text size="2" color="gray">
            No events yet.
          </Text>
        )}
      {listEventsQuery.isSuccess === true &&
        listEventsQuery.data.length > 0 && (
          <Grid
            columns={{ initial: "1", sm: "2", md: "3" }}
            gap="4"
            width="100%"
          >
            {listEventsQuery.data.map((eventRow) => (
              <EventAdminCard
                key={eventRow.id}
                eventRow={eventRow}
                onEditRequested={(row) => {
                  setEventBeingEdited(row);
                }}
                onDeleteRequested={(row) => {
                  setPendingDeleteEvent(row);
                }}
              />
            ))}
          </Grid>
        )}

      <Dialog.Root
        open={eventBeingEdited !== null}
        onOpenChange={(open) => {
          if (open === false && isEventEditFormDisabled === true) {
            return;
          }
          if (open === false) {
            setEventBeingEdited(null);
          }
        }}
      >
        <Dialog.Content style={{ maxWidth: "min(32rem, 100vw - 2rem)" }}>
          <Dialog.Title>Edit event</Dialog.Title>
          <Flex direction="column" gap="3" mt="3">
            <Text as="label" size="2" weight="medium" htmlFor="edit-event-name">
              Event name
            </Text>
            <TextField.Root
              id="edit-event-name"
              disabled={isEventEditFormDisabled === true}
              value={editEventName}
              onChange={(event) => {
                setEditEventName(event.target.value);
              }}
            />
            <Text
              as="label"
              size="2"
              weight="medium"
              htmlFor="edit-event-start-datetime"
            >
              Start date and time
            </Text>
            <TextField.Root
              className="skinfight-event-datetime-text-field"
              id="edit-event-start-datetime"
              type="datetime-local"
              step={60}
              disabled={isEventEditFormDisabled === true}
              value={editStartDateTimeLocalInput}
              onChange={(event) => {
                setEditStartDateTimeLocalInput(event.target.value);
              }}
            />
            <Text
              as="label"
              size="2"
              weight="medium"
              htmlFor="edit-event-end-datetime"
            >
              End date and time
            </Text>
            <TextField.Root
              className="skinfight-event-datetime-text-field"
              id="edit-event-end-datetime"
              type="datetime-local"
              step={60}
              disabled={isEventEditFormDisabled === true}
              value={editEndDateTimeLocalInput}
              onChange={(event) => {
                setEditEndDateTimeLocalInput(event.target.value);
              }}
            />
            {eventBeingEdited !== null && (
              <EventTeamsEditor
                draftTeamIds={editEventTeamIds}
                allTeams={listTeamsQuery.data ?? []}
                onDraftTeamIdsChange={setEditEventTeamIds}
                areInputsDisabled={isEventEditFormDisabled === true}
              />
            )}
            {updateEventMutation.error !== null && (
              <Text size="2" color="red">
                {updateEventMutation.error.message}
              </Text>
            )}
            <Flex gap="2" justify="end" mt="2">
              <Dialog.Close>
                <Button
                  type="button"
                  variant="soft"
                  disabled={isEventEditFormDisabled === true}
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="button"
                disabled={isSaveEditDisabled === true}
                onClick={() => {
                  if (eventBeingEdited === null) {
                    return;
                  }
                  if (trimmedEditEventName.length === 0) {
                    return;
                  }
                  if (editStartDateTimeLocalInput.length === 0) {
                    return;
                  }
                  if (editEndDateTimeLocalInput.length === 0) {
                    return;
                  }
                  const parsedEditStartDate = new Date(
                    editStartDateTimeLocalInput,
                  );
                  const parsedEditEndDate = new Date(editEndDateTimeLocalInput);
                  if (Number.isNaN(parsedEditStartDate.getTime()) === true) {
                    return;
                  }
                  if (Number.isNaN(parsedEditEndDate.getTime()) === true) {
                    return;
                  }
                  if (
                    parsedEditEndDate.getTime() <= parsedEditStartDate.getTime()
                  ) {
                    return;
                  }
                  updateEventMutation.mutate({
                    id: eventBeingEdited.id,
                    name: trimmedEditEventName,
                    date: parsedEditStartDate,
                    endDate: parsedEditEndDate,
                    teamIds: editEventTeamIds,
                  });
                }}
              >
                {updateEventMutation.isPending === true ? "Saving…" : "Save"}
              </Button>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <AlertDialog.Root
        open={pendingDeleteEvent !== null}
        onOpenChange={(open) => {
          if (open === false) {
            setPendingDeleteEvent(null);
          }
        }}
      >
        <AlertDialog.Content style={{ maxWidth: "min(24rem, 100vw - 2rem)" }}>
          <AlertDialog.Title>Delete event?</AlertDialog.Title>
          <AlertDialog.Description size="2" mt="2">
            {pendingDeleteEvent !== null &&
            pendingDeleteEvent.name.trim().length > 0
              ? `This will permanently remove "${pendingDeleteEvent.name.trim()}".`
              : "This will permanently remove this event."}
          </AlertDialog.Description>
          {deleteEventMutation.error !== null && (
            <Text size="2" color="red" mt="2">
              {deleteEventMutation.error.message}
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
                pendingDeleteEvent === null ||
                deleteEventMutation.isPending === true
              }
              onClick={() => {
                if (pendingDeleteEvent === null) {
                  return;
                }
                deleteEventMutation.mutate({ id: pendingDeleteEvent.id });
              }}
            >
              {deleteEventMutation.isPending === true ? "Deleting…" : "Delete"}
            </Button>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  );
}
