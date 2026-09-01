import { Box, Text } from "@radix-ui/themes";
import type { Metadata } from "next";
import type { ReactElement } from "react";

import { UserRole } from "../../../generated/prisma";
import { CharactersGrid } from "~/app/characters/characters-grid";
import { CharactersGridFilters } from "~/app/characters/characters-grid-filters";
import { resolveCharactersGridFilterValues } from "~/lib/characters-grid-filters";
import {
  buildCharactersGridCharacterWhereInput,
  buildUserDisplayNameForCharactersGridFilter,
} from "~/server/characters-grid-query";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { getCurrentOngoingEventId } from "~/server/event-for-display";

export const metadata: Metadata = {
  title: "Characters · SkinFight",
};

type CharactersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CharactersPage(
  props: CharactersPageProps,
): Promise<ReactElement> {
  const session = await auth();
  const viewerUserId = session?.user.id ?? null;
  const viewerIsAdmin = session?.user.role === UserRole.ADMIN;

  const searchParams = await props.searchParams;
  const currentOngoingEventId = await getCurrentOngoingEventId();
  const filterValues = resolveCharactersGridFilterValues(
    searchParams,
    currentOngoingEventId,
  );
  const characterWhereInput =
    buildCharactersGridCharacterWhereInput(filterValues);

  const hasBaseFilters = Object.keys(characterWhereInput).length > 0;

  let combinedWhereInput;
  if (viewerIsAdmin === true) {
    combinedWhereInput = characterWhereInput;
  } else if (viewerUserId !== null) {
    const hiddenFilter = {
      OR: [
        { isHidden: false },
        { AND: [{ isHidden: true }, { userId: viewerUserId }] },
      ],
    };
    combinedWhereInput =
      hasBaseFilters === true
        ? { AND: [characterWhereInput, hiddenFilter] }
        : hiddenFilter;
  } else {
    combinedWhereInput = {
      ...characterWhereInput,
      isHidden: false,
    };
  }

  const activeUserFilterQuery =
    filterValues.userId !== null
      ? db.user.findUnique({
          where: { id: filterValues.userId },
          select: {
            name: true,
            email: true,
          },
        })
      : Promise.resolve(null);

  const teamFilterOptionQuery =
    filterValues.eventId !== null
      ? db.eventTeam.findMany({
          where: { eventId: filterValues.eventId },
          orderBy: { sortOrder: "asc" },
          select: {
            team: {
              select: { id: true, name: true },
            },
          },
        })
      : Promise.resolve([]);

  const [
    characterRows,
    eventTeamFilterOptionRows,
    eventFilterOptionRows,
    activeUserFilterRow,
  ] = await Promise.all([
    db.character.findMany({
      where: combinedWhereInput,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        file: true,
      },
    }),
    teamFilterOptionQuery,
    db.event.findMany({
      where: {
        OR: [
          { characters: { some: {} } },
          ...(filterValues.eventId !== null
            ? [{ id: filterValues.eventId }]
            : []),
        ],
      },
      orderBy: { date: "desc" },
      select: {
        id: true,
        name: true,
        date: true,
        endDate: true,
      },
    }),
    activeUserFilterQuery,
  ]);

  const teamFilterOptionRows = eventTeamFilterOptionRows.map((eventTeamRow) => {
    return {
      id: eventTeamRow.team.id,
      name: eventTeamRow.team.name,
    };
  });

  const eventFilterOptions = eventFilterOptionRows.map((eventRow) => {
    return {
      id: eventRow.id,
      eventName: eventRow.name,
      startsAtIso: eventRow.date.toISOString(),
      endsAtIso: eventRow.endDate.toISOString(),
    };
  });

  const activeUserFilterDisplayName =
    activeUserFilterRow !== null
      ? buildUserDisplayNameForCharactersGridFilter({
          userName: activeUserFilterRow.name,
          userEmail: activeUserFilterRow.email,
        })
      : null;

  return (
    <Box px="6" py="6">
      <CharactersGridFilters
        filterValues={filterValues}
        teamFilterOptions={teamFilterOptionRows}
        eventFilterOptions={eventFilterOptions}
        activeUserFilterDisplayName={activeUserFilterDisplayName}
        defaultEventId={currentOngoingEventId}
      />

      {characterRows.length === 0 && (
        <Text as="p" size="3" color="gray" mb="4">
          No characters match these filters.
        </Text>
      )}

      {characterRows.length > 0 && (
        <CharactersGrid
          characters={characterRows.map((characterRow) => {
            return {
              id: characterRow.id,
              name: characterRow.name,
              fileUrl: characterRow.file,
            };
          })}
        />
      )}
    </Box>
  );
}
