"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent, ReactElement } from "react";
import { useRef, useState } from "react";

import { CurrentEventCharacterEditDialog } from "~/app/current-event/current-event-character-edit-dialog";
import { parseJsonApiErrorMessage } from "~/lib/parse-json-api-error-message";
import type { CurrentEventCharacterForDisplay } from "~/server/character-for-display";

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

  const handlePngFileInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0] ?? null;
    setSelectedPngFile(selectedFile);
    setCreateCharacterErrorMessage(null);
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
        Characters
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
                <Button
                  type="button"
                  variant="soft"
                  onClick={() => {
                    setEditingCharacterId(characterRow.id);
                  }}
                >
                  Edit
                </Button>
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

      {characters.length === 0 && (
        <Text as="p" size="3" color="gray" mb="4">
          No characters yet. Add your first character below.
        </Text>
      )}

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
