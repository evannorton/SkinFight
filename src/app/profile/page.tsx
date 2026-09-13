import { Box, Heading, Text } from "@radix-ui/themes";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

import { ProfileCopyUserIdButton } from "~/app/profile/profile-copy-user-id-button";
import { auth } from "~/server/auth";

export const metadata: Metadata = {
  title: "Profile · SkinFight",
};

export default async function ProfilePage(): Promise<ReactElement> {
  const session = await auth();
  if (session === null) {
    redirect("/signin");
  }

  const displayName = session.user.name?.trim() ?? "";
  const nameLabel = displayName.length > 0 ? displayName : "No name set";

  return (
    <Box px="6" py="6">
      <Heading as="h2" size="6" weight="bold" mb="4">
        Profile
      </Heading>
      <Text as="p" size="3" mb="4">
        Name: {nameLabel}
      </Text>
      <ProfileCopyUserIdButton userId={session.user.id} />
    </Box>
  );
}
