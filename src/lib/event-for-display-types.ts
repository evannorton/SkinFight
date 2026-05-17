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

export type CurrentEventTeamForParticipation = {
  teamId: string;
  teamName: string;
};

export type CurrentOngoingEventWithTeams = EventForHighlightDisplay & {
  eventId: string;
  teams: CurrentEventTeamForParticipation[];
};
