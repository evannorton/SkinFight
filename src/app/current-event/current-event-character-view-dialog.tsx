"use client";

import { Box, Button, Dialog, Flex, Text } from "@radix-ui/themes";
import type { ReactElement } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { CurrentEventCharacterForDisplay } from "~/server/character-for-display";

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
  const skinViewerDisposeRef = useRef<(() => void) | null>(null);
  const [isSkinViewerLoading, setIsSkinViewerLoading] = useState<boolean>(false);
  const [skinViewerErrorMessage, setSkinViewerErrorMessage] = useState<
    string | null
  >(null);

  const disposeSkinViewer = useCallback((): void => {
    if (skinViewerDisposeRef.current !== null) {
      skinViewerDisposeRef.current();
      skinViewerDisposeRef.current = null;
    }
  }, []);

  const handleSkinViewerCanvasRef = useCallback(
    (skinViewerCanvasElement: HTMLCanvasElement | null): void => {
      disposeSkinViewer();

      if (skinViewerCanvasElement === null || isOpen === false) {
        return;
      }

      setIsSkinViewerLoading(true);
      setSkinViewerErrorMessage(null);

      const initializeSkinViewer = async (): Promise<void> => {
        const skinview3dModule = await import("skinview3d");

        const skinViewer = new skinview3dModule.SkinViewer({
          canvas: skinViewerCanvasElement,
          width: SKIN_VIEWER_WIDTH_PX,
          height: SKIN_VIEWER_HEIGHT_PX,
          animation: new skinview3dModule.IdleAnimation(),
        });
        skinViewer.autoRotate = true;
        skinViewer.background = 0x1c1c1f;
        skinViewer.zoom = 0.9;

        skinViewerDisposeRef.current = () => {
          skinViewer.dispose();
        };

        try {
          await skinViewer.loadSkin(character.fileUrl);
          setIsSkinViewerLoading(false);
        } catch {
          setSkinViewerErrorMessage(
            "Failed to load skin. Ensure the image URL allows cross-origin access.",
          );
          setIsSkinViewerLoading(false);
        }
      };

      void initializeSkinViewer();
    },
    [character.fileUrl, character.name, disposeSkinViewer, isOpen],
  );

  useEffect(() => {
    return () => {
      disposeSkinViewer();
    };
  }, [disposeSkinViewer]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: "min(24rem, 100vw - 2rem)" }}>
        <Dialog.Title>{character.name}</Dialog.Title>

        <Flex direction="column" align="center" gap="3">
          <Box
            style={{
              width: `${SKIN_VIEWER_WIDTH_PX}px`,
              height: `${SKIN_VIEWER_HEIGHT_PX}px`,
              maxWidth: "100%",
              borderRadius: "var(--radius-3)",
              overflow: "hidden",
              backgroundColor: "var(--gray-a3)",
            }}
          >
            {isOpen === true && (
              <canvas
                ref={handleSkinViewerCanvasRef}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                }}
              />
            )}
          </Box>

          {isSkinViewerLoading === true && (
            <Text size="2" color="gray">
              Loading skin…
            </Text>
          )}

          {skinViewerErrorMessage !== null && (
            <Text size="2" color="red" align="center">
              {skinViewerErrorMessage}
            </Text>
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
