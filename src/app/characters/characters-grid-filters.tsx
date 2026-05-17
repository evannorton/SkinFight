"use client";

import { Box, Flex, Link, Select, Text } from "@radix-ui/themes";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";

import {
  buildCharactersPagePath,
  CHARACTERS_GRID_ALL_FILTER_VALUE,
  type CharactersGridEventFilterOption,
  type CharactersGridFilterValues,
  type CharactersGridTeamFilterOption,
  type CharactersGridUserFilterOption,
} from "~/lib/characters-grid-filters";

type CharactersGridFiltersProps = {
  filterValues: CharactersGridFilterValues;
  teamFilterOptions: CharactersGridTeamFilterOption[];
  eventFilterOptions: CharactersGridEventFilterOption[];
  userFilterOptions: CharactersGridUserFilterOption[];
};

export function CharactersGridFilters(
  props: CharactersGridFiltersProps,
): ReactElement {
  const {
    filterValues,
    teamFilterOptions,
    eventFilterOptions,
    userFilterOptions,
  } = props;
  const router = useRouter();

  const hasActiveFilters =
    filterValues.teamId !== null ||
    filterValues.eventId !== null ||
    filterValues.userId !== null;

  const navigateWithFilterValues = (
    updatedFilterValues: CharactersGridFilterValues,
  ): void => {
    const nextPath = buildCharactersPagePath(updatedFilterValues);
    router.push(nextPath);
  };

  const selectedTeamFilterValue =
    filterValues.teamId ?? CHARACTERS_GRID_ALL_FILTER_VALUE;
  const selectedEventFilterValue =
    filterValues.eventId ?? CHARACTERS_GRID_ALL_FILTER_VALUE;
  const selectedUserFilterValue =
    filterValues.userId ?? CHARACTERS_GRID_ALL_FILTER_VALUE;

  return (
    <Box mb="6">
      <Flex
        direction={{ initial: "column", sm: "row" }}
        gap="3"
        align={{ initial: "stretch", sm: "end" }}
        wrap="wrap"
      >
        <Flex direction="column" gap="1" style={{ minWidth: "12rem" }}>
          <Text as="label" size="2" weight="medium" htmlFor="characters-team-filter">
            Team
          </Text>
          <Select.Root
            value={selectedTeamFilterValue}
            onValueChange={(selectedValue) => {
              navigateWithFilterValues({
                ...filterValues,
                teamId:
                  selectedValue === CHARACTERS_GRID_ALL_FILTER_VALUE
                    ? null
                    : selectedValue,
              });
            }}
          >
            <Select.Trigger id="characters-team-filter" />
            <Select.Content>
              <Select.Item value={CHARACTERS_GRID_ALL_FILTER_VALUE}>
                All teams
              </Select.Item>
              {teamFilterOptions.map((teamFilterOption) => {
                return (
                  <Select.Item
                    key={teamFilterOption.id}
                    value={teamFilterOption.id}
                  >
                    {teamFilterOption.name}
                  </Select.Item>
                );
              })}
            </Select.Content>
          </Select.Root>
        </Flex>

        <Flex direction="column" gap="1" style={{ minWidth: "12rem" }}>
          <Text as="label" size="2" weight="medium" htmlFor="characters-event-filter">
            Event
          </Text>
          <Select.Root
            value={selectedEventFilterValue}
            onValueChange={(selectedValue) => {
              navigateWithFilterValues({
                ...filterValues,
                eventId:
                  selectedValue === CHARACTERS_GRID_ALL_FILTER_VALUE
                    ? null
                    : selectedValue,
              });
            }}
          >
            <Select.Trigger id="characters-event-filter" />
            <Select.Content>
              <Select.Item value={CHARACTERS_GRID_ALL_FILTER_VALUE}>
                All events
              </Select.Item>
              {eventFilterOptions.map((eventFilterOption) => {
                return (
                  <Select.Item
                    key={eventFilterOption.id}
                    value={eventFilterOption.id}
                  >
                    {eventFilterOption.displayName}
                  </Select.Item>
                );
              })}
            </Select.Content>
          </Select.Root>
        </Flex>

        <Flex direction="column" gap="1" style={{ minWidth: "12rem" }}>
          <Text as="label" size="2" weight="medium" htmlFor="characters-user-filter">
            User
          </Text>
          <Select.Root
            value={selectedUserFilterValue}
            onValueChange={(selectedValue) => {
              navigateWithFilterValues({
                ...filterValues,
                userId:
                  selectedValue === CHARACTERS_GRID_ALL_FILTER_VALUE
                    ? null
                    : selectedValue,
              });
            }}
          >
            <Select.Trigger id="characters-user-filter" />
            <Select.Content>
              <Select.Item value={CHARACTERS_GRID_ALL_FILTER_VALUE}>
                All users
              </Select.Item>
              {userFilterOptions.map((userFilterOption) => {
                return (
                  <Select.Item
                    key={userFilterOption.id}
                    value={userFilterOption.id}
                  >
                    {userFilterOption.displayName}
                  </Select.Item>
                );
              })}
            </Select.Content>
          </Select.Root>
        </Flex>
      </Flex>

      {hasActiveFilters === true && (
        <Link asChild size="2" mt="3" underline="hover">
          <NextLink href="/characters">Clear filters</NextLink>
        </Link>
      )}
    </Box>
  );
}
