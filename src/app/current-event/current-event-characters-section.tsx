"use client";

import {
  AlertDialog,
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Text,
  TextField,
} from "@radix-ui/themes";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent, ReactElement } from "react";
import { useRef, useState } from "react";

import { CurrentEventCharacterEditDialog } from "~/app/current-event/current-event-character-edit-dialog";
import { CurrentEventCharacterViewDialog } from "~/app/current-event/current-event-character-view-dialog";
import { parseJsonApiErrorMessage } from "~/lib/parse-json-api-error-message";
import type { CurrentEventCharacterForDisplay } from "~/lib/character-for-display";

type CurrentEventCharactersSectionProps = {
  eventId: string;
  characters: CurrentEventCharacterForDisplay[];
};

export function CurrentEventCharactersSection(
  props: CurrentEventCharactersSectionProps,
): ReactElement {
  const { eventId, characters } = props;
  const router = useRouter();
  const pngFileInputRef = useRef<HTMLInputElement>(null);
  const [newCharacterName, setNewCharacterName] = useState<string>("");
  const [selectedPngFile, setSelectedPngFile] = useState<File | null>(null);
  const [isCreatingCharacter, setIsCreatingCharacter] = useState<boolean>(false);
  const [createCharacterErrorMessage, setCreateCharacterErrorMessage] = useState<
    string | null
  >(null);
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(
    null,
  );
  const [viewingCharacterId, setViewingCharacterId] = useState<string | null>(
    null,
  );
  const [pendingDeleteCharacter, setPendingDeleteCharacter] =
    useState<CurrentEventCharacterForDisplay | null>(null);
  const [deletingCharacterId, setDeletingCharacterId] = useState<string | null>(
    null,
  );
  const [deleteCharacterErrorMessage, setDeleteCharacterErrorMessage] = useState<
    string | null
  >(null);

  const trimmedNewCharacterName = newCharacterName.trim();
  const isCreateCharacterDisabled =
    isCreatingCharacter === true ||
    trimmedNewCharacterName.length === 0 ||
    selectedPngFile === null;

  const editingCharacter =
    editingCharacterId !== null
      ? (characters.find((characterRow) => characterRow.id === editingCharacterId) ??
        null)
      : null;

  const viewingCharacter =
    viewingCharacterId !== null
      ? (characters.find((characterRow) => characterRow.id === viewingCharacterId) ??
        null)
      : null;

  const handlePngFileInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0] ?? null;
    setSelectedPngFile(selectedFile);
    setCreateCharacterErrorMessage(null);
  };

  const handleDeleteCharacterConfirm = async (): Promise<void> => {
    if (pendingDeleteCharacter === null) {
      return;
    }

    setDeletingCharacterId(pendingDeleteCharacter.id);
    setDeleteCharacterErrorMessage(null);

    try {
      const deleteCharacterResponse = await fetch(
        `/api/characters/${pendingDeleteCharacter.id}`,
        { method: "DELETE" },
      );

      if (deleteCharacterResponse.ok === false) {
        const errorMessage = await parseJsonApiErrorMessage(
          deleteCharacterResponse,
          "Failed to delete character.",
        );
        setDeleteCharacterErrorMessage(errorMessage);
        setDeletingCharacterId(null);
        return;
      }

      if (editingCharacterId === pendingDeleteCharacter.id) {
        setEditingCharacterId(null);
      }
      if (viewingCharacterId === pendingDeleteCharacter.id) {
        setViewingCharacterId(null);
      }
      setPendingDeleteCharacter(null);
      setDeletingCharacterId(null);
      router.refresh();
    } catch {
      setDeleteCharacterErrorMessage("Failed to delete character.");
      setDeletingCharacterId(null);
    }
  };

  const handleCreateCharacterFormSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    if (isCreateCharacterDisabled === true) {
      return;
    }
    if (selectedPngFile === null) {
      return;
    }

    setIsCreatingCharacter(true);
    setCreateCharacterErrorMessage(null);

    const createCharacterFormData = new FormData();
    createCharacterFormData.append("name", trimmedNewCharacterName);
    createCharacterFormData.append("eventId", eventId);
    createCharacterFormData.append("file", selectedPngFile);

    try {
      const createCharacterResponse = await fetch("/api/characters", {
        method: "POST",
        body: createCharacterFormData,
      });

      if (createCharacterResponse.ok === false) {
        const errorMessage = await parseJsonApiErrorMessage(
          createCharacterResponse,
          "Failed to add character.",
        );
        setCreateCharacterErrorMessage(errorMessage);
        setIsCreatingCharacter(false);
        return;
      }

      setNewCharacterName("");
      setSelectedPngFile(null);
      if (pngFileInputRef.current !== null) {
        pngFileInputRef.current.value = "";
      }
      setIsCreatingCharacter(false);
      router.refresh();
    } catch {
      setCreateCharacterErrorMessage("Failed to add character.");
      setIsCreatingCharacter(false);
    }
  };

  return (
    <Box mt="6">
      <Heading as="h2" size="5" weight="bold" mb="3">
        Your characters
      </Heading>

      {characters.length > 0 && (
        <Flex direction="column" gap="3" mb="6">
          {characters.map((characterRow) => {
            return (
              <Flex
                key={characterRow.id}
                align="center"
                justify="between"
                gap="3"
                p="3"
                style={{
                  border: "1px solid var(--gray-a6)",
                  borderRadius: "var(--radius-3)",
                }}
              >
                <Link
                  asChild
                  underline="none"
                  style={{ color: "inherit", flex: 1, minWidth: 0 }}
                >
                  <NextLink href={`/characters/${characterRow.id}`}>
                    <Flex align="center" gap="3" style={{ minWidth: 0 }}>
                      <Box
                        style={{
                          width: "64px",
                          height: "64px",
                          flexShrink: 0,
                          overflow: "hidden",
                          borderRadius: "var(--radius-2)",
                          backgroundColor: "var(--gray-a3)",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="skinfight-skin-png-image"
                          src={characterRow.fileUrl}
                          alt={characterRow.name}
                          width={64}
                          height={64}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            display: "block",
                          }}
                        />
                      </Box>
                      <Text size="3" weight="medium">
                        {characterRow.name}
                      </Text>
                    </Flex>
                  </NextLink>
                </Link>
                <Flex gap="2" style={{ flexShrink: 0 }}>
                  <Button
                    type="button"
                    variant="soft"
                    onClick={() => {
                      setViewingCharacterId(characterRow.id);
                    }}
                  >
                    View
                  </Button>
                  <Button
                    type="button"
                    variant="soft"
                    onClick={() => {
                      setEditingCharacterId(characterRow.id);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="soft"
                    color="red"
                    disabled={deletingCharacterId !== null}
                    onClick={() => {
                      setDeleteCharacterErrorMessage(null);
                      setPendingDeleteCharacter(characterRow);
                    }}
                  >
                    Delete
                  </Button>
                </Flex>
              </Flex>
            );
          })}
        </Flex>
      )}

      {editingCharacter !== null && (
        <CurrentEventCharacterEditDialog
          character={editingCharacter}
          isOpen={editingCharacterId !== null}
          onOpenChange={(isDialogOpen) => {
            if (isDialogOpen === false) {
              setEditingCharacterId(null);
            }
          }}
        />
      )}

      {viewingCharacter !== null && (
        <CurrentEventCharacterViewDialog
          character={viewingCharacter}
          isOpen={viewingCharacterId !== null}
          onOpenChange={(isDialogOpen) => {
            if (isDialogOpen === false) {
              setViewingCharacterId(null);
            }
          }}
        />
      )}

      {characters.length === 0 && (
        <Text as="p" size="3" color="gray" mb="4">
          No characters yet. Add your first character below.
        </Text>
      )}

      <AlertDialog.Root
        open={pendingDeleteCharacter !== null}
        onOpenChange={(isAlertDialogOpen) => {
          if (isAlertDialogOpen === false) {
            setPendingDeleteCharacter(null);
            setDeleteCharacterErrorMessage(null);
          }
        }}
      >
        <AlertDialog.Content style={{ maxWidth: "min(24rem, 100vw - 2rem)" }}>
          <AlertDialog.Title>Delete character?</AlertDialog.Title>
          <AlertDialog.Description size="2" mt="2">
            {pendingDeleteCharacter !== null
              ? `This will permanently remove "${pendingDeleteCharacter.name}".`
              : "This will permanently remove this character."}
          </AlertDialog.Description>
          {deleteCharacterErrorMessage !== null && (
            <Text size="2" color="red" mt="2">
              {deleteCharacterErrorMessage}
            </Text>
          )}
          <Flex gap="2" justify="end" mt="4">
            <AlertDialog.Cancel>
              <Button
                type="button"
                variant="soft"
                disabled={deletingCharacterId !== null}
              >
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <Button
              type="button"
              color="red"
              disabled={
                pendingDeleteCharacter === null ||
                deletingCharacterId !== null
              }
              onClick={() => {
                void handleDeleteCharacterConfirm();
              }}
            >
              {deletingCharacterId !== null ? "Deleting…" : "Delete"}
            </Button>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>

      <Box asChild style={{ maxWidth: "28rem" }}>
        <form onSubmit={handleCreateCharacterFormSubmit}>
          <Flex direction="column" gap="3">
            <Flex direction="column" gap="1">
              <Text as="label" size="2" weight="medium" htmlFor="character-name">
                Name
              </Text>
              <TextField.Root
                id="character-name"
                value={newCharacterName}
                placeholder="Character name"
                disabled={isCreatingCharacter === true}
                onChange={(textFieldChangeEvent) => {
                  setNewCharacterName(textFieldChangeEvent.target.value);
                  setCreateCharacterErrorMessage(null);
                }}
              />
            </Flex>

            <Flex direction="column" gap="1">
              <Text as="label" size="2" weight="medium" htmlFor="character-png-file">
                PNG file
              </Text>
              <input
                ref={pngFileInputRef}
                id="character-png-file"
                type="file"
                accept="image/png,.png"
                disabled={isCreatingCharacter === true}
                onChange={handlePngFileInputChange}
              />
              {selectedPngFile !== null && (
                <Text size="2" color="gray">
                  Selected: {selectedPngFile.name}
                </Text>
              )}
            </Flex>

            <Button
              type="submit"
              disabled={isCreateCharacterDisabled === true}
            >
              {isCreatingCharacter === true ? "Adding…" : "Add character"}
            </Button>

            {createCharacterErrorMessage !== null && (
              <Text size="2" color="red">
                {createCharacterErrorMessage}
              </Text>
            )}
          </Flex>
        </form>
      </Box>
    </Box>
  );
}
