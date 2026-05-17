import { formatEventDateTimeRangeLabel } from "~/lib/format-event-datetime-range-label";
import { db } from "~/server/db";

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

export type EventForHighlightDisplay = {
  displayName: string;
  startsAtIso: string;
  endsAtIso: string;
  dateTimeRangeLabel: string;
};

export type HomeEventHighlightMode = "current" | "next";

export type FeaturedEventForHomePage = EventForHighlightDisplay & {
  eventHighlightMode: HomeEventHighlightMode;
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

export type CurrentEventTeamForParticipation = {
  teamId: string;
  teamName: string;
};

export type CurrentOngoingEventWithTeams = EventForHighlightDisplay & {
  eventId: string;
  teams: CurrentEventTeamForParticipation[];
};

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
