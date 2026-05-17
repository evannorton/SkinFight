import { Box } from "@radix-ui/themes";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

import { HomeNextEventSection } from "~/app/_components/home-next-event-section";
import { CurrentEventCharactersSection } from "~/app/current-event/current-event-characters-section";
import { CurrentEventParticipationSection } from "~/app/current-event/current-event-participation-section";
import type { CurrentEventCharacterForDisplay } from "~/server/character-for-display";
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
  let userCharactersForEvent: CurrentEventCharacterForDisplay[] = [];
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

    if (userParticipationTeamId !== null) {
      const characterRows = await db.character.findMany({
        where: {
          userId: session.user.id,
          eventId: currentOngoingEventWithTeams.eventId,
          teamId: userParticipationTeamId,
        },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          file: true,
        },
      });
      userCharactersForEvent = characterRows.map((characterRow) => {
        return {
          id: characterRow.id,
          name: characterRow.name,
          fileUrl: characterRow.file,
        };
      });
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
      {userParticipationTeamId !== null && (
        <CurrentEventCharactersSection
          eventId={currentOngoingEventWithTeams.eventId}
          characters={userCharactersForEvent}
        />
      )}
    </Box>
  );
}
