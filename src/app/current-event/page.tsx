import { Box } from "@radix-ui/themes";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

import { HomeNextEventSection } from "~/app/_components/home-next-event-section";
import { CurrentEventBountySection } from "~/app/current-event/current-event-bounty-section";
import { CurrentEventCharactersSection } from "~/app/current-event/current-event-characters-section";
import { CurrentEventParticipationSection } from "~/app/current-event/current-event-participation-section";
import { CurrentEventTeamsSection } from "~/app/current-event/current-event-teams-section";
import { CurrentEventWeekSection } from "~/app/current-event/current-event-week-section";
import type { CurrentEventCharacterForDisplay } from "~/lib/character-for-display";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { getCurrentOngoingEventWithTeams } from "~/server/event-for-display";
import { getEventBountyUsersForDisplay } from "~/server/event-bounty";
import { getCurrentEventWeekForDisplay } from "~/server/event-current-week-themes";
import {
  getEventTeamTotalPointValuesByTeamId,
  getEventUserTeamTotalPointValue,
} from "~/server/team-point-values";

export default async function CurrentEventPage(): Promise<ReactElement> {
  const session = await auth();
  const currentOngoingEventWithTeams = await getCurrentOngoingEventWithTeams();
  if (currentOngoingEventWithTeams === null) {
    redirect("/");
  }

  const eventTeamTotalPointValuesByTeamId =
    await getEventTeamTotalPointValuesByTeamId(
      currentOngoingEventWithTeams.eventId,
    );
  const currentEventWeekForDisplay = await getCurrentEventWeekForDisplay({
    eventId: currentOngoingEventWithTeams.eventId,
  });
  const eventBountyUsers = await getEventBountyUsersForDisplay(
    currentOngoingEventWithTeams.eventId,
  );

  const isUserSignedIn = session !== null;

  let userParticipationTeamId: string | null = null;
  let userContributedPointValue: number | null = null;
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
      const [characterRows, fetchedUserContributedPointValue] =
        await Promise.all([
          db.character.findMany({
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
          }),
          getEventUserTeamTotalPointValue({
            eventId: currentOngoingEventWithTeams.eventId,
            userId: session.user.id,
            teamId: userParticipationTeamId,
          }),
        ]);
      userContributedPointValue = fetchedUserContributedPointValue;
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
        shouldShowLinkToCurrentEventPage={false}
      />
      <CurrentEventWeekSection
        currentEventWeekForDisplay={currentEventWeekForDisplay}
      />
      <CurrentEventTeamsSection
        teams={currentOngoingEventWithTeams.teams}
        teamTotalPointValuesByTeamId={eventTeamTotalPointValuesByTeamId}
      />
      <CurrentEventBountySection
        eventId={currentOngoingEventWithTeams.eventId}
        bountyUsers={eventBountyUsers}
      />
      <CurrentEventParticipationSection
        isUserSignedIn={isUserSignedIn}
        eventId={currentOngoingEventWithTeams.eventId}
        teams={currentOngoingEventWithTeams.teams}
        userParticipationTeamId={userParticipationTeamId}
        userContributedPointValue={userContributedPointValue}
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
