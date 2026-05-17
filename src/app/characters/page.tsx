import { Box, Link, Text } from "@radix-ui/themes";
import type { Metadata } from "next";
import NextLink from "next/link";
import type { ReactElement } from "react";

import { CharactersGridFilters } from "~/app/characters/characters-grid-filters";
import { parseCharactersGridFilterValues } from "~/lib/characters-grid-filters";
import {
  buildCharactersGridCharacterWhereInput,
  buildEventDisplayNameForCharactersGridFilter,
  buildUserDisplayNameForCharactersGridFilter,
} from "~/server/characters-grid-query";
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
  const searchParams = await props.searchParams;
  const filterValues = parseCharactersGridFilterValues(searchParams);
  const characterWhereInput =
    buildCharactersGridCharacterWhereInput(filterValues);

  const [characterRows, teamFilterOptionRows, eventFilterOptionRows, userFilterOptionRows] =
    await Promise.all([
      db.character.findMany({
        where: characterWhereInput,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          file: true,
        },
      }),
      db.team.findMany({
        where: { characters: { some: {} } },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
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
      db.user.findMany({
        where: { characters: { some: {} } },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
        },
      }),
    ]);

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

  const userFilterOptions = userFilterOptionRows.map((userRow) => {
    return {
      id: userRow.id,
      displayName: buildUserDisplayNameForCharactersGridFilter({
        userName: userRow.name,
        userEmail: userRow.email,
      }),
    };
  });

  return (
    <Box px="6" py="6">
      <CharactersGridFilters
        filterValues={filterValues}
        teamFilterOptions={teamFilterOptionRows}
        eventFilterOptions={eventFilterOptions}
        userFilterOptions={userFilterOptions}
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
