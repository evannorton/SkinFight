import { Box, Flex, Heading, Link, Text } from "@radix-ui/themes";
import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";

import { UserRole } from "../../../../generated/prisma";
import { CharacterSkinViewer } from "~/app/_components/character-skin-viewer";
import { CharacterPageAttackDefendSection } from "~/app/characters/[characterId]/character-page-attack-defend-section";
import { CharacterPageAdminSection } from "~/app/characters/[characterId]/character-page-admin-section";
import { buildCharactersPagePath } from "~/lib/characters-grid-filters";
import { auth } from "~/server/auth";
import { getCharacterPageForDisplay } from "~/server/character-page-data";

const CHARACTER_SKIN_VIEWER_WIDTH_PX = 320;
const CHARACTER_SKIN_VIEWER_HEIGHT_PX = 400;

type CharacterDetailPageProps = {
  params: Promise<{ characterId: string }>;
};

export async function generateMetadata(
  props: CharacterDetailPageProps,
): Promise<Metadata> {
  const { characterId } = await props.params;
  const session = await auth();
  const viewerIsAdmin = session?.user.role === UserRole.ADMIN;
  const characterPageForDisplay = await getCharacterPageForDisplay({
    characterId,
    viewerUserId: session?.user.id ?? null,
    viewerIsAdmin,
  });
  if (characterPageForDisplay === null) {
    return { title: "Character not found · SkinFight" };
  }
  return { title: `${characterPageForDisplay.characterDetail.name} · SkinFight` };
}

export default async function CharacterDetailPage(
  props: CharacterDetailPageProps,
): Promise<ReactElement> {
  const { characterId } = await props.params;
  const session = await auth();
  const viewerIsAdmin = session?.user.role === UserRole.ADMIN;
  const characterPageForDisplay = await getCharacterPageForDisplay({
    characterId,
    viewerUserId: session?.user.id ?? null,
    viewerIsAdmin,
  });
  if (characterPageForDisplay === null) {
    notFound();
  }

  const { characterDetail, viewerActionAvailability, attacks, defends } =
    characterPageForDisplay;

   
  const characterUserId: string = characterDetail.userId;
   
  const characterTeamId: string = characterDetail.teamId;
   
  const characterEventId: string = characterDetail.eventId;

  const userCharactersPath = buildCharactersPagePath({
    teamId: characterTeamId,
    eventId: null,
    userId: characterUserId,
  });
  const teamCharactersPath = buildCharactersPagePath({
    teamId: characterTeamId,
    eventId: null,
    userId: null,
  });
  const eventCharactersPath = buildCharactersPagePath({
    teamId: null,
    eventId: characterEventId,
    userId: null,
  });

  return (
    <Box px="6" py="6" style={{ maxWidth: "48rem" }}>
      <Heading as="h1" size="6" weight="bold" mb="6">
        {characterDetail.name}
      </Heading>

      {viewerIsAdmin === true && (
        <CharacterPageAdminSection
          characterId={characterId}
          characterName={characterDetail.name}
          isCharacterHidden={characterDetail.isHidden}
        />
      )}

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
            <Link asChild underline="hover">
              <NextLink href={userCharactersPath}>
                {characterDetail.userDisplayName}
              </NextLink>
            </Link>
          </Text>
          <Text as="p" size="3">
            <Text weight="medium">Team: </Text>
            <Link asChild underline="hover">
              <NextLink href={teamCharactersPath}>
                {characterDetail.teamName}
              </NextLink>
            </Link>
          </Text>
          <Text as="p" size="3">
            <Text weight="medium">Event: </Text>
            <Link asChild underline="hover">
              <NextLink href={eventCharactersPath}>
                {characterDetail.eventName}
              </NextLink>
            </Link>
          </Text>
        </Flex>
      </Flex>

      <CharacterPageAttackDefendSection
        characterId={characterId}
        characterName={characterDetail.name}
        viewerActionAvailability={viewerActionAvailability}
        viewerIsAdmin={viewerIsAdmin}
        attacks={attacks}
        defends={defends}
      />
    </Box>
  );
}
