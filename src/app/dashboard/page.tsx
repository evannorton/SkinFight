import { Box, Heading, Text } from "@radix-ui/themes";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

import { UserRole } from "../../../generated/prisma";
import { AdminEventsSection } from "~/app/dashboard/admin-events-section";
import { AdminHiddenAttacksSection } from "~/app/dashboard/admin-hidden-attacks-section";
import { AdminHiddenCharactersSection } from "~/app/dashboard/admin-hidden-characters-section";
import { AdminHiddenDefendsSection } from "~/app/dashboard/admin-hidden-defends-section";
import { AdminTeamsSection } from "~/app/dashboard/admin-teams-section";
import { auth } from "~/server/auth";

export default async function AdminDashboardPage(): Promise<ReactElement> {
  const session = await auth();
  if (session === null) {
    redirect("/api/auth/signin");
  }
  if (session.user.role !== UserRole.ADMIN) {
    redirect("/");
  }

  return (
    <Box px="6" py="6">
      <Heading as="h2" size="6" weight="bold" mb="2">
        Admin dashboard
      </Heading>
      <Text size="3" color="gray">
        Signed in as{" "}
        {session.user.name ?? session.user.email ?? session.user.id} (admin).
      </Text>
      <AdminEventsSection />
      <AdminTeamsSection />
      <AdminHiddenCharactersSection />
      <AdminHiddenAttacksSection />
      <AdminHiddenDefendsSection />
    </Box>
  );
}
