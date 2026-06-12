"use client";

import { Box, Text } from "@radix-ui/themes";
import type { ReactElement } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type CharacterSkinViewerProps = {
  skinFileUrl: string;
  widthPx: number;
  heightPx: number;
  characterName?: string;
};

export function CharacterSkinViewer(
  props: CharacterSkinViewerProps,
): ReactElement {
  const { skinFileUrl, widthPx, heightPx, characterName } = props;
  const skinViewerDisposeRef = useRef<(() => void) | null>(null);
  const [isSkinViewerLoading, setIsSkinViewerLoading] = useState<boolean>(true);
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

      if (skinViewerCanvasElement === null) {
        return;
      }

      setIsSkinViewerLoading(true);
      setSkinViewerErrorMessage(null);

      const initializeSkinViewer = async (): Promise<void> => {
        const skinview3dModule = await import("skinview3d");

        const skinViewer = new skinview3dModule.SkinViewer({
          canvas: skinViewerCanvasElement,
          width: widthPx,
          height: heightPx,
          animation: new skinview3dModule.IdleAnimation(),
        });
        skinViewer.autoRotate = true;
        skinViewer.background = 0x1c1c1f;
        skinViewer.zoom = 0.9;

        skinViewerDisposeRef.current = () => {
          skinViewer.dispose();
        };

        try {
          await skinViewer.loadSkin(skinFileUrl);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [characterName, disposeSkinViewer, heightPx, skinFileUrl, widthPx],
  );

  useEffect(() => {
    return () => {
      disposeSkinViewer();
    };
  }, [disposeSkinViewer]);

  return (
    <Box>
      <Box
        style={{
          width: `${widthPx}px`,
          height: `${heightPx}px`,
          maxWidth: "100%",
          borderRadius: "var(--radius-3)",
          overflow: "hidden",
          backgroundColor: "var(--gray-a3)",
        }}
      >
        <canvas
          ref={handleSkinViewerCanvasRef}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
          }}
        />
      </Box>
      {isSkinViewerLoading === true && (
        <Text size="2" color="gray" mt="2">
          Loading skin…
        </Text>
      )}
      {skinViewerErrorMessage !== null && (
        <Text size="2" color="red" mt="2">
          {skinViewerErrorMessage}
        </Text>
      )}
    </Box>
  );
}
