import { Box, Flex, Heading, Link, Separator, Text } from "@radix-ui/themes";
import NextLink from "next/link";
import type { ReactElement } from "react";

import { buildUserDisplayNameForCharactersGridFilter } from "~/server/characters-grid-query";
import { db } from "~/server/db";

export async function AdminHiddenCharactersSection(): Promise<ReactElement> {
  const hiddenCharacterRows = await db.character.findMany({
    where: { isHidden: true },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
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
        Hidden characters
      </Heading>

      {hiddenCharacterRows.length === 0 && (
        <Text size="2" color="gray">
          No hidden characters.
        </Text>
      )}

      {hiddenCharacterRows.length > 0 && (
        <Flex direction="column" gap="2">
          {hiddenCharacterRows.map((hiddenCharacterRow) => {
            const userDisplayName = buildUserDisplayNameForCharactersGridFilter(
              {
                userName: hiddenCharacterRow.user.name,
                userEmail: hiddenCharacterRow.user.email,
              },
            );
            return (
              <Text key={hiddenCharacterRow.id} as="p" size="2">
                <Link asChild underline="hover">
                  <NextLink href={`/characters/${hiddenCharacterRow.id}`}>
                    {hiddenCharacterRow.name}
                  </NextLink>
                </Link>
                <Text color="gray" as="span">
                  {" "}
                  — {userDisplayName}, {hiddenCharacterRow.team.name}
                </Text>
              </Text>
            );
          })}
        </Flex>
      )}
    </Box>
  );
}
