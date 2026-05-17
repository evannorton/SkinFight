import { Flex, Heading, Link, Separator } from "@radix-ui/themes";
import NextLink from "next/link";
import type { ReactElement } from "react";

import { UserRole } from "../../../generated/prisma";
import { auth } from "~/server/auth";
import { getCurrentOngoingEventForDisplay } from "~/server/event-for-display";

export async function SiteHeader(): Promise<ReactElement> {
  const session = await auth();
  const currentOngoingEvent = await getCurrentOngoingEventForDisplay();
  const isUserSignedIn = session !== null;
  const isSessionUserAdmin = session?.user.role === UserRole.ADMIN;
  const hasCurrentOngoingEvent = currentOngoingEvent !== null;

  return (
    <header>
      <Flex align="center" justify="between" px="6" py="4" width="100%">
        <Heading as="h1" size="5" weight="bold">
          <Link asChild underline="hover" color="gray" highContrast>
            <NextLink href="/">SkinFight</NextLink>
          </Link>
        </Heading>
        <Flex align="center" gap="4" asChild>
          <nav>
            {hasCurrentOngoingEvent === true && (
              <Link asChild size="2" weight="medium" underline="hover">
                <NextLink href="/current-event">Current event</NextLink>
              </Link>
            )}
            {isUserSignedIn === true && isSessionUserAdmin === true && (
              <Link asChild size="2" weight="medium" underline="hover">
                <NextLink href="/dashboard">Dashboard</NextLink>
              </Link>
            )}
            {isUserSignedIn === false && (
              <Link asChild size="2" weight="medium" underline="hover">
                <NextLink href="/api/auth/signin">Sign in</NextLink>
              </Link>
            )}
            {isUserSignedIn === true && (
              <Link asChild size="2" weight="medium" underline="hover">
                <NextLink href="/api/auth/signout">Sign out</NextLink>
              </Link>
            )}
          </nav>
        </Flex>
      </Flex>
      <Separator size="4" />
    </header>
  );
}
