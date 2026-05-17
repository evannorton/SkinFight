import { Box } from "@radix-ui/themes";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

import { HomeNextEventSection } from "~/app/_components/home-next-event-section";
import { CurrentEventParticipationSection } from "~/app/current-event/current-event-participation-section";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { getCurrentOngoingEventWithTeams } from "~/server/event-for-display";

export default async function CurrentEventPage(): Promise<ReactElement> {
  const session = await auth();
  const currentOngoingEventWithTeams = await getCurrentOngoingEventWithTeams();
  if (currentOngoingEventWithTeams === null) {
    redirect("/");
  }

  const isUserSignedIn = session !== null;

  let userParticipationTeamId: string | null = null;
  if (session !== null) {
    const existingParticipation = await db.eventParticipation.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: currentOngoingEventWithTeams.eventId,
        },
      },
      select: { teamId: true },
    });
    if (existingParticipation !== null) {
      userParticipationTeamId = existingParticipation.teamId;
    }
  }

  return (
    <Box px="6" py="6" style={{ maxWidth: "42rem" }}>
      <HomeNextEventSection
        eventHighlightMode="current"
        eventDisplayName={currentOngoingEventWithTeams.displayName}
        eventStartsAtIso={currentOngoingEventWithTeams.startsAtIso}
        eventEndsAtIso={currentOngoingEventWithTeams.endsAtIso}
        eventDateTimeRangeLabel={currentOngoingEventWithTeams.dateTimeRangeLabel}
        shouldShowLinkToCurrentEventPage={false}
      />
      <CurrentEventParticipationSection
        isUserSignedIn={isUserSignedIn}
        eventId={currentOngoingEventWithTeams.eventId}
        teams={currentOngoingEventWithTeams.teams}
        userParticipationTeamId={userParticipationTeamId}
      />
    </Box>
  );
}
