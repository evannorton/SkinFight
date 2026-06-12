import { Box, Flex, Heading, Link, Separator, Text } from "@radix-ui/themes";
import NextLink from "next/link";
import type { ReactElement } from "react";

import { buildUserDisplayNameForCharactersGridFilter } from "~/server/characters-grid-query";
import { db } from "~/server/db";

export async function AdminHiddenDefendsSection(): Promise<ReactElement> {
  const hiddenDefendRows = await db.defend.findMany({
    where: { isHidden: true },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      characterId: true,
      character: {
        select: {
          name: true,
        },
      },
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
    },
  });

  return (
    <Box mt="6">
      <Separator size="4" mb="6" />
      <Heading as="h3" size="5" weight="bold" mb="3">
        Hidden defends
      </Heading>

      {hiddenDefendRows.length === 0 && (
        <Text size="2" color="gray">
          No hidden defends.
        </Text>
      )}

      {hiddenDefendRows.length > 0 && (
        <Flex direction="column" gap="2">
          {hiddenDefendRows.map((hiddenDefendRow) => {
            const userDisplayName = buildUserDisplayNameForCharactersGridFilter({
              userName: hiddenDefendRow.user.name,
              userEmail: hiddenDefendRow.user.email,
            });
            return (
              <Text key={hiddenDefendRow.id} as="p" size="2">
                <Link asChild underline="hover">
                  <NextLink
                    href={`/characters/${hiddenDefendRow.characterId}?defendID=${hiddenDefendRow.id}`}
                  >
                    {hiddenDefendRow.character.name}
                  </NextLink>
                </Link>
                <Text color="gray" as="span">
                  {" "}
                  — {userDisplayName}, {hiddenDefendRow.team.name}
                </Text>
              </Text>
            );
          })}
        </Flex>
      )}
    </Box>
  );
}
