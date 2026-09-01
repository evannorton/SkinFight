"use client";

import { Box, Link, Text } from "@radix-ui/themes";
import NextLink from "next/link";
import type { ReactElement } from "react";
import { useEffect, useRef, useState } from "react";

import { requestCharacterSkinSnapshot } from "~/lib/character-skin-snapshot-renderer";

export type CharactersGridCharacter = {
  id: string;
  name: string;
  fileUrl: string;
};

type CharactersGridProps = {
  characters: CharactersGridCharacter[];
};

type CharactersGridCharacterCardProps = {
  character: CharactersGridCharacter;
};

function CharactersGridCharacterCard(
  props: CharactersGridCharacterCardProps,
): ReactElement {
  const { character } = props;
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const [isPreviewIntersectingViewport, setIsPreviewIntersectingViewport] =
    useState<boolean>(false);
  const [snapshotObjectUrl, setSnapshotObjectUrl] = useState<string | null>(
    null,
  );
  const [hasSnapshotFailed, setHasSnapshotFailed] = useState<boolean>(false);

  useEffect(() => {
    const previewContainerElement = previewContainerRef.current;
    if (previewContainerElement === null) {
      return;
    }

    const intersectionObserver = new IntersectionObserver(
      (observerEntries) => {
        const observerEntry = observerEntries[0];
        if (typeof observerEntry === "undefined") {
          return;
        }
        setIsPreviewIntersectingViewport(observerEntry.isIntersecting);
      },
      { rootMargin: "200px" },
    );
    intersectionObserver.observe(previewContainerElement);

    return () => {
      intersectionObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isPreviewIntersectingViewport === false) {
      return;
    }
    if (snapshotObjectUrl !== null) {
      return;
    }
    if (hasSnapshotFailed === true) {
      return;
    }

    let isSnapshotRequestCancelled = false;
    void requestCharacterSkinSnapshot(character.fileUrl).then(
      (renderedSnapshotObjectUrl) => {
        if (isSnapshotRequestCancelled === false) {
          setSnapshotObjectUrl(renderedSnapshotObjectUrl);
        }
      },
      () => {
        if (isSnapshotRequestCancelled === false) {
          setHasSnapshotFailed(true);
        }
      },
    );

    return () => {
      isSnapshotRequestCancelled = true;
    };
  }, [
    character.fileUrl,
    hasSnapshotFailed,
    isPreviewIntersectingViewport,
    snapshotObjectUrl,
  ]);

  const previewImageUrl = snapshotObjectUrl ?? character.fileUrl;
  const previewImageClassName =
    snapshotObjectUrl !== null ? undefined : "skinfight-skin-png-image";

  return (
    <Link asChild underline="none" style={{ color: "inherit" }}>
      <NextLink href={`/characters/${character.id}`}>
        <Box>
          <Box
            ref={previewContainerRef}
            style={{
              aspectRatio: "1 / 1",
              overflow: "hidden",
              borderRadius: "var(--radius-2)",
              backgroundColor: "var(--gray-a3)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={previewImageClassName}
              src={previewImageUrl}
              alt={character.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </Box>
          <Text
            as="p"
            size="2"
            weight="medium"
            mt="1"
            align="center"
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {character.name}
          </Text>
        </Box>
      </NextLink>
    </Link>
  );
}

export function CharactersGrid(props: CharactersGridProps): ReactElement {
  const { characters } = props;

  return (
    <Box
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(6rem, 1fr))",
        gap: "var(--space-3)",
      }}
    >
      {characters.map((character) => {
        return (
          <CharactersGridCharacterCard
            key={character.id}
            character={character}
          />
        );
      })}
    </Box>
  );
}
