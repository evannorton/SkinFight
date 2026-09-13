import { Box, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import type { ReactElement } from "react";

import { UserRole } from "../../../generated/prisma";
import { AdminDemoteModeratorButton } from "~/app/dashboard/admin-demote-moderator-button";
import { buildUserDisplayNameForCharactersGridFilter } from "~/server/characters-grid-query";
import { db } from "~/server/db";

type AdminStaffSectionProps = {
  canManageModerators: boolean;
};

function formatUserRoleLabel(role: UserRole): string {
  let roleLabel: string = role;
  if (role === UserRole.ADMIN) {
    roleLabel = "Admin";
  } else if (role === UserRole.MODERATOR) {
    roleLabel = "Moderator";
  }
  return roleLabel;
}

export async function AdminStaffSection(
  props: AdminStaffSectionProps,
): Promise<ReactElement> {
  const staffUserRows = await db.user.findMany({
    where: {
      role: {
        in: [UserRole.ADMIN, UserRole.MODERATOR],
      },
    },
    orderBy: [{ role: "asc" }, { name: "asc" }, { email: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return (
    <Box mt="6">
      <Separator size="4" mb="6" />
      <Heading as="h3" size="5" weight="bold" mb="3">
        Admins & moderators
      </Heading>

      {staffUserRows.length === 0 && (
        <Text size="2" color="gray">
          No admins or moderators.
        </Text>
      )}

      {staffUserRows.length > 0 && (
        <Flex direction="column" gap="2">
          {staffUserRows.map((staffUserRow) => {
            const userDisplayName = buildUserDisplayNameForCharactersGridFilter({
              userName: staffUserRow.name,
              userEmail: staffUserRow.email,
            });
            const showDemoteButton =
              props.canManageModerators === true &&
              staffUserRow.role === UserRole.MODERATOR;
            return (
              <Flex
                key={staffUserRow.id}
                align="center"
                gap="2"
                wrap="wrap"
              >
                <Text size="2">
                  {userDisplayName}
                  <Text color="gray" as="span">
                    {" "}
                    — {formatUserRoleLabel(staffUserRow.role)}
                  </Text>
                </Text>
                {showDemoteButton === true && (
                  <AdminDemoteModeratorButton
                    userId={staffUserRow.id}
                    userDisplayName={userDisplayName}
                  />
                )}
              </Flex>
            );
          })}
        </Flex>
      )}
    </Box>
  );
}
