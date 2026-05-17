import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";

import { CharacterSkinViewer } from "~/app/_components/character-skin-viewer";
import { db } from "~/server/db";
import type { CharacterDetailForDisplay } from "~/lib/character-detail-for-display";

const CHARACTER_SKIN_VIEWER_WIDTH_PX = 320;
const CHARACTER_SKIN_VIEWER_HEIGHT_PX = 400;

type CharacterDetailPageProps = {
  params: Promise<{ characterId: string }>;
};

async function getCharacterDetailForDisplay(
  characterId: string,
): Promise<CharacterDetailForDisplay | null> {
  const characterRow = await db.character.findUnique({
    where: { id: characterId },
    select: {
      id: true,
      name: true,
      file: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      team: {
        select: {
          name: true,
        },
      },
      event: {
        select: {
          name: true,
        },
      },
    },
  });

  if (characterRow === null) {
    return null;
  }

  const trimmedUserName = characterRow.user.name?.trim() ?? "";
  const userDisplayName =
    trimmedUserName.length > 0
      ? trimmedUserName
      : (characterRow.user.email ?? "Unknown user");

  const trimmedEventName = characterRow.event.name.trim();
  const eventDisplayName =
    trimmedEventName.length > 0 ? trimmedEventName : "Unnamed event";

  return {
    id: characterRow.id,
    name: characterRow.name,
    fileUrl: characterRow.file,
    userDisplayName,
    teamName: characterRow.team.name,
    eventName: eventDisplayName,
  };
}

export async function generateMetadata(
  props: CharacterDetailPageProps,
): Promise<Metadata> {
  const { characterId } = await props.params;
  const characterDetail = await getCharacterDetailForDisplay(characterId);
  if (characterDetail === null) {
    return { title: "Character not found · SkinFight" };
  }
  return { title: `${characterDetail.name} · SkinFight` };
}

export default async function CharacterDetailPage(
  props: CharacterDetailPageProps,
): Promise<ReactElement> {
  const { characterId } = await props.params;
  const characterDetail = await getCharacterDetailForDisplay(characterId);
  if (characterDetail === null) {
    notFound();
  }

  return (
    <Box px="6" py="6" style={{ maxWidth: "48rem" }}>
      <Heading as="h1" size="6" weight="bold" mb="6">
        {characterDetail.name}
      </Heading>

      <Flex direction="column" gap="6">
        <Box
          style={{
            width: "12rem",
            aspectRatio: "1 / 1",
            overflow: "hidden",
            borderRadius: "var(--radius-3)",
            backgroundColor: "var(--gray-a3)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="skinfight-skin-png-image"
            src={characterDetail.fileUrl}
            alt={characterDetail.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        </Box>

        <Box>
          <CharacterSkinViewer
            skinFileUrl={characterDetail.fileUrl}
            characterName={characterDetail.name}
            widthPx={CHARACTER_SKIN_VIEWER_WIDTH_PX}
            heightPx={CHARACTER_SKIN_VIEWER_HEIGHT_PX}
          />
        </Box>

        <Flex direction="column" gap="2">
          <Text as="p" size="3">
            <Text weight="medium">User: </Text>
            {characterDetail.userDisplayName}
          </Text>
          <Text as="p" size="3">
            <Text weight="medium">Team: </Text>
            {characterDetail.teamName}
          </Text>
          <Text as="p" size="3">
            <Text weight="medium">Event: </Text>
            {characterDetail.eventName}
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}
