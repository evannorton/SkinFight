import { Avatar, Box, Flex, Heading, Link, Text } from "@radix-ui/themes";
import NextLink from "next/link";
import type { ReactElement } from "react";

import { buildCharactersPagePath } from "~/lib/characters-grid-filters";
import type { EventBountyUserForDisplay } from "~/server/event-bounty";

type CurrentEventBountySectionProps = {
  eventId: string;
  bountyUsers: EventBountyUserForDisplay[];
};

function buildBountyUserDisplayName(
  userName: string | null,
  userEmail: string | null,
): string {
  if (userName !== null && userName !== "") {
    return userName;
  }
  if (userEmail !== null) {
    return userEmail;
  }
  return "Unknown User";
}

export function CurrentEventBountySection(
  props: CurrentEventBountySectionProps,
): ReactElement {
  const { eventId, bountyUsers } = props;

  return (
    <Box mt="6">
      <Heading as="h2" size="5" weight="bold" mb="3">
        Bounty
      </Heading>

      {bountyUsers.length === 0 && (
        <Text as="p" size="3" color="gray">
          No bounty targets yet.
        </Text>
      )}

      {bountyUsers.length > 0 && (
        <Flex direction="column" gap="3">
          {bountyUsers.map((bountyUser) => {
            const displayName = buildBountyUserDisplayName(
              bountyUser.userName,
              bountyUser.userEmail,
            );
            const charactersPagePath = buildCharactersPagePath({
              teamId: null,
              eventId: eventId,
              userId: bountyUser.userId,
            });
            return (
              <Link
                key={bountyUser.userId}
                asChild
                underline="none"
                style={{ color: "inherit" }}
              >
                <NextLink href={charactersPagePath}>
                  <Flex align="center" gap="3" style={{ cursor: "pointer" }}>
                    <Avatar
                      size="3"
                      src={bountyUser.userImage ?? undefined}
                      fallback={displayName.charAt(0).toUpperCase()}
                      radius="full"
                    />
                    <Text size="3">{displayName}</Text>
                  </Flex>
                </NextLink>
              </Link>
            );
          })}
        </Flex>
      )}
    </Box>
  );
}
