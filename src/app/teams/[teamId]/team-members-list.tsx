"use client";

import { Avatar, Box, Flex, Link, Text, TextField } from "@radix-ui/themes";
import NextLink from "next/link";
import { useState, type ReactElement } from "react";

import { buildCharactersPagePath } from "~/lib/characters-grid-filters";

type TeamMember = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

type TeamMembersListProps = {
  teamMembers: TeamMember[];
  teamId: string;
};

function buildUserDisplayName(
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

export function TeamMembersList(props: TeamMembersListProps): ReactElement {
  const { teamMembers, teamId } = props;
  const [searchQuery, setSearchQuery] = useState<string>("");

  const normalizedSearchQuery = searchQuery.toLowerCase().trim();
  const filteredMembers = teamMembers.filter((member) => {
    const displayName = buildUserDisplayName(member.name, member.email);
    return displayName.toLowerCase().includes(normalizedSearchQuery);
  });

  return (
    <Box>
      <Box mb="4" style={{ maxWidth: "24rem" }}>
        <TextField.Root
          placeholder="Search members..."
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
          }}
        />
      </Box>

      {filteredMembers.length === 0 && searchQuery === "" && (
        <Text as="p" size="3" color="gray">
          No members found for this team.
        </Text>
      )}

      {filteredMembers.length === 0 && searchQuery !== "" && (
        <Text as="p" size="3" color="gray">
          No members match your search.
        </Text>
      )}

      {filteredMembers.length > 0 && (
        <Flex direction="column" gap="3">
          {filteredMembers.map((member) => {
            const displayName = buildUserDisplayName(member.name, member.email);
            const charactersPagePath = buildCharactersPagePath({
              teamId: teamId,
              eventId: null,
              userId: member.id,
            });
            return (
              <Link
                key={member.id}
                asChild
                underline="none"
                style={{ color: "inherit" }}
              >
                <NextLink href={charactersPagePath}>
                  <Flex align="center" gap="3" style={{ cursor: "pointer" }}>
                    <Avatar
                      size="3"
                      src={member.image ?? undefined}
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
