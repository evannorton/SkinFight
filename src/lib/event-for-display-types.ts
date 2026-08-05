export type EventForHighlightDisplay = {
  displayName: string;
  startsAtIso: string;
  endsAtIso: string;
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

export type CurrentEventWeekThemeForDisplay = {
  themeId: string;
  themeName: string;
};

export type CurrentEventWeekForDisplay = {
  weekNumber: number;
  themes: CurrentEventWeekThemeForDisplay[];
};
