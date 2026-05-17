"use client";

import { Button, Dialog, Flex } from "@radix-ui/themes";
import type { ReactElement } from "react";

import { CharacterSkinViewer } from "~/app/_components/character-skin-viewer";
import type { CurrentEventCharacterForDisplay } from "~/lib/character-for-display";

const SKIN_VIEWER_WIDTH_PX = 320;
const SKIN_VIEWER_HEIGHT_PX = 400;

type CurrentEventCharacterViewDialogProps = {
  character: CurrentEventCharacterForDisplay;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function CurrentEventCharacterViewDialog(
  props: CurrentEventCharacterViewDialogProps,
): ReactElement {
  const { character, isOpen, onOpenChange } = props;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: "min(24rem, 100vw - 2rem)" }}>
        <Dialog.Title>{character.name}</Dialog.Title>

        <Flex direction="column" align="center" gap="3">
          {isOpen === true && (
            <CharacterSkinViewer
              skinFileUrl={character.fileUrl}
              characterName={character.name}
              widthPx={SKIN_VIEWER_WIDTH_PX}
              heightPx={SKIN_VIEWER_HEIGHT_PX}
            />
          )}

          <Flex gap="3" justify="end" width="100%">
            <Dialog.Close>
              <Button type="button" variant="soft" color="gray">
                Close
              </Button>
            </Dialog.Close>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
