import type {
  CurrentEventTeamForParticipation,
  CurrentOngoingEventWithTeams,
  EventForHighlightDisplay,
  FeaturedEventForHomePage,
} from "~/lib/event-for-display-types";
import { formatEventDateTimeRangeLabel } from "~/lib/format-event-datetime-range-label";
import { db } from "~/server/db";

export type {
  CurrentEventTeamForParticipation,
  CurrentOngoingEventWithTeams,
  EventForHighlightDisplay,
  FeaturedEventForHomePage,
  HomeEventHighlightMode,
} from "~/lib/event-for-display-types";

const eventSelectFields = {
  name: true,
  date: true,
  endDate: true,
} as const;

type EventRowForDisplay = {
  name: string;
  date: Date;
  endDate: Date;
};

function buildEventForHighlightDisplay(
  eventRow: EventRowForDisplay,
): EventForHighlightDisplay {
  let displayName = "Untitled";
  if (eventRow.name.trim().length > 0) {
    displayName = eventRow.name.trim();
  }
  return {
    displayName,
    startsAtIso: eventRow.date.toISOString(),
    endsAtIso: eventRow.endDate.toISOString(),
    dateTimeRangeLabel: formatEventDateTimeRangeLabel(
      eventRow.date,
      eventRow.endDate,
    ),
  };
}

export async function getCurrentOngoingEventForDisplay(): Promise<EventForHighlightDisplay | null> {
  const now = new Date();
  const currentOngoingEvent = await db.event.findFirst({
    where: {
      date: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { date: "asc" },
    select: eventSelectFields,
  });
  if (currentOngoingEvent === null) {
    return null;
  }
  return buildEventForHighlightDisplay(currentOngoingEvent);
}

export async function getCurrentOngoingEventWithTeams(): Promise<CurrentOngoingEventWithTeams | null> {
  const now = new Date();
  const currentOngoingEvent = await db.event.findFirst({
    where: {
      date: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { date: "asc" },
    select: {
      ...eventSelectFields,
      id: true,
      eventTeams: {
        orderBy: { sortOrder: "asc" as const },
        select: {
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
  if (currentOngoingEvent === null) {
    return null;
  }
  const teams: CurrentEventTeamForParticipation[] =
    currentOngoingEvent.eventTeams.map((eventTeamRow) => ({
      teamId: eventTeamRow.team.id,
      teamName: eventTeamRow.team.name,
    }));
  return {
    ...buildEventForHighlightDisplay(currentOngoingEvent),
    eventId: currentOngoingEvent.id,
    teams,
  };
}

export async function getFeaturedEventForHomePage(): Promise<FeaturedEventForHomePage | null> {
  const currentOngoingEvent = await getCurrentOngoingEventForDisplay();
  if (currentOngoingEvent !== null) {
    return {
      ...currentOngoingEvent,
      eventHighlightMode: "current",
    };
  }
  const now = new Date();
  const nextUpcomingEvent = await db.event.findFirst({
    where: { date: { gt: now } },
    orderBy: { date: "asc" },
    select: eventSelectFields,
  });
  if (nextUpcomingEvent === null) {
    return null;
  }
  return {
    ...buildEventForHighlightDisplay(nextUpcomingEvent),
    eventHighlightMode: "next",
  };
}
