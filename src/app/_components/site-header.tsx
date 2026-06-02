import { Box, Separator } from "@radix-ui/themes";
import type { ReactElement } from "react";

import { SiteHeaderNavigation } from "~/app/_components/site-header-navigation";
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
      <Box px="6" py="4">
        <SiteHeaderNavigation
          hasCurrentOngoingEvent={hasCurrentOngoingEvent}
          isUserSignedIn={isUserSignedIn}
          isSessionUserAdmin={isSessionUserAdmin}
        />
      </Box>
      <Separator size="4" />
    </header>
  );
}
