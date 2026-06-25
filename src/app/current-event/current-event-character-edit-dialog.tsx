"use client";

import { Button, Dialog, Flex, Text, TextField } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent, ReactElement } from "react";
import { useEffect, useRef, useState } from "react";

import { parseJsonApiErrorMessage } from "~/lib/parse-json-api-error-message";
import type { CurrentEventCharacterForDisplay } from "~/lib/character-for-display";

type CurrentEventCharacterEditDialogProps = {
  character: CurrentEventCharacterForDisplay;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function CurrentEventCharacterEditDialog(
  props: CurrentEventCharacterEditDialogProps,
): ReactElement {
  const { character, isOpen, onOpenChange } = props;
  const router = useRouter();
  const replacementPngFileInputRef = useRef<HTMLInputElement>(null);
  const [editedCharacterName, setEditedCharacterName] = useState<string>(
    character.name,
  );
  const [selectedReplacementPngFile, setSelectedReplacementPngFile] =
    useState<File | null>(null);
  const [isSavingCharacterEdits, setIsSavingCharacterEdits] =
    useState<boolean>(false);
  const [saveCharacterEditsErrorMessage, setSaveCharacterEditsErrorMessage] =
    useState<string | null>(null);

  useEffect(() => {
    if (isOpen === true) {
      setEditedCharacterName(character.name);
      setSelectedReplacementPngFile(null);
      setSaveCharacterEditsErrorMessage(null);
      if (replacementPngFileInputRef.current !== null) {
        replacementPngFileInputRef.current.value = "";
      }
    }
  }, [isOpen, character.name]);

  const trimmedEditedCharacterName = editedCharacterName.trim();
  const isCharacterNameUnchanged =
    trimmedEditedCharacterName === character.name;
  const isSaveCharacterEditsDisabled =
    isSavingCharacterEdits === true ||
    trimmedEditedCharacterName.length === 0 ||
    (isCharacterNameUnchanged === true && selectedReplacementPngFile === null);

  const handleReplacementPngFileInputChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const selectedFile = event.target.files?.[0] ?? null;
    setSelectedReplacementPngFile(selectedFile);
    setSaveCharacterEditsErrorMessage(null);
  };

  const handleSaveCharacterEditsFormSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    if (isSaveCharacterEditsDisabled === true) {
      return;
    }

    setIsSavingCharacterEdits(true);
    setSaveCharacterEditsErrorMessage(null);

    const updateCharacterFormData = new FormData();
    updateCharacterFormData.append("name", trimmedEditedCharacterName);
    if (selectedReplacementPngFile !== null) {
      updateCharacterFormData.append("file", selectedReplacementPngFile);
    }

    try {
      const updateCharacterResponse = await fetch(
        `/api/characters/${character.id}`,
        {
          method: "PATCH",
          body: updateCharacterFormData,
        },
      );

      if (updateCharacterResponse.ok === false) {
        const errorMessage = await parseJsonApiErrorMessage(
          updateCharacterResponse,
          "Failed to update character.",
        );
        setSaveCharacterEditsErrorMessage(errorMessage);
        setIsSavingCharacterEdits(false);
        return;
      }

      setIsSavingCharacterEdits(false);
      onOpenChange(false);
      router.refresh();
    } catch {
      setSaveCharacterEditsErrorMessage("Failed to update character.");
      setIsSavingCharacterEdits(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: "min(28rem, 100vw - 2rem)" }}>
        <Dialog.Title>Edit character</Dialog.Title>

        <form onSubmit={handleSaveCharacterEditsFormSubmit}>
          <Flex direction="column" gap="3" mt="3">
            <Flex direction="column" gap="1">
              <Text
                as="label"
                size="2"
                weight="medium"
                htmlFor={`edit-character-name-${character.id}`}
              >
                Name
              </Text>
              <TextField.Root
                id={`edit-character-name-${character.id}`}
                value={editedCharacterName}
                placeholder="Character name"
                disabled={isSavingCharacterEdits === true}
                onChange={(textFieldChangeEvent) => {
                  setEditedCharacterName(textFieldChangeEvent.target.value);
                  setSaveCharacterEditsErrorMessage(null);
                }}
              />
            </Flex>

            <Flex direction="column" gap="1">
              <Text
                as="label"
                size="2"
                weight="medium"
                htmlFor={`edit-character-png-file-${character.id}`}
              >
                Replace PNG file (optional)
              </Text>
              <input
                ref={replacementPngFileInputRef}
                id={`edit-character-png-file-${character.id}`}
                type="file"
                accept="image/png,.png"
                disabled={isSavingCharacterEdits === true}
                onChange={handleReplacementPngFileInputChange}
              />
              {selectedReplacementPngFile !== null && (
                <Text size="2" color="gray">
                  Selected: {selectedReplacementPngFile.name}
                </Text>
              )}
            </Flex>

            {saveCharacterEditsErrorMessage !== null && (
              <Text size="2" color="red">
                {saveCharacterEditsErrorMessage}
              </Text>
            )}

            <Flex gap="3" justify="end" mt="2">
              <Dialog.Close>
                <Button
                  type="button"
                  variant="soft"
                  color="gray"
                  disabled={isSavingCharacterEdits === true}
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                disabled={isSaveCharacterEditsDisabled === true}
              >
                {isSavingCharacterEdits === true ? "Saving…" : "Save"}
              </Button>
            </Flex>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
