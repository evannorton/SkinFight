import { Box, Flex, Heading, Link, Separator, Text } from "@radix-ui/themes";
import NextLink from "next/link";
import type { ReactElement } from "react";

import { buildUserDisplayNameForCharactersGridFilter } from "~/server/characters-grid-query";
import { db } from "~/server/db";

export async function AdminHiddenAttacksSection(): Promise<ReactElement> {
  const hiddenAttackRows = await db.attack.findMany({
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
        Hidden attacks
      </Heading>

      {hiddenAttackRows.length === 0 && (
        <Text size="2" color="gray">
          No hidden attacks.
        </Text>
      )}

      {hiddenAttackRows.length > 0 && (
        <Flex direction="column" gap="2">
          {hiddenAttackRows.map((hiddenAttackRow) => {
            const userDisplayName = buildUserDisplayNameForCharactersGridFilter(
              {
                userName: hiddenAttackRow.user.name,
                userEmail: hiddenAttackRow.user.email,
              },
            );
            return (
              <Text key={hiddenAttackRow.id} as="p" size="2">
                <Link asChild underline="hover">
                  <NextLink
                    href={`/characters/${hiddenAttackRow.characterId}?attackID=${hiddenAttackRow.id}`}
                  >
                    {hiddenAttackRow.character.name}
                  </NextLink>
                </Link>
                <Text color="gray" as="span">
                  {" "}
                  — {userDisplayName}, {hiddenAttackRow.team.name}
                </Text>
              </Text>
            );
          })}
        </Flex>
      )}
    </Box>
  );
}
