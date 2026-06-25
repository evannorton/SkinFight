import { Box, Link, Text } from "@radix-ui/themes";
import type { Metadata } from "next";
import NextLink from "next/link";
import type { ReactElement } from "react";

import { UserRole } from "../../../generated/prisma";
import { CharactersGridFilters } from "~/app/characters/characters-grid-filters";
import { parseCharactersGridFilterValues } from "~/lib/characters-grid-filters";
import {
  buildCharactersGridCharacterWhereInput,
  buildEventDisplayNameForCharactersGridFilter,
  buildUserDisplayNameForCharactersGridFilter,
} from "~/server/characters-grid-query";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

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
  const filterValues = parseCharactersGridFilterValues(searchParams);
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
      where: { characters: { some: {} } },
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
      displayName: buildEventDisplayNameForCharactersGridFilter({
        eventName: eventRow.name,
        eventDate: eventRow.date,
        eventEndDate: eventRow.endDate,
      }),
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
      />

      {characterRows.length === 0 && (
        <Text as="p" size="3" color="gray" mb="4">
          No characters match these filters.
        </Text>
      )}

      {characterRows.length > 0 && (
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(6rem, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          {characterRows.map((characterRow) => {
            return (
              <Link
                key={characterRow.id}
                asChild
                underline="none"
                style={{ color: "inherit" }}
              >
                <NextLink href={`/characters/${characterRow.id}`}>
                  <Box>
                    <Box
                      style={{
                        aspectRatio: "1 / 1",
                        overflow: "hidden",
                        borderRadius: "var(--radius-2)",
                        backgroundColor: "var(--gray-a3)",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="skinfight-skin-png-image"
                        src={characterRow.file}
                        alt={characterRow.name}
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
                      {characterRow.name}
                    </Text>
                  </Box>
                </NextLink>
              </Link>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
