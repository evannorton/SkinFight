import "server-only";

import type { CurrentEventWeekForDisplay } from "~/lib/event-for-display-types";
import { getCurrentEventWeekIndex } from "~/lib/event-week-range";
import { db } from "~/server/db";

export type ThemeForAttackDefendSubmission = {
  themeId: string;
  themeName: string;
};

export type { CurrentEventWeekForDisplay };

export async function getCurrentEventWeekForDisplay(params: {
  eventId: string;
  now?: Date;
}): Promise<CurrentEventWeekForDisplay | null> {
  const now = params.now ?? new Date();
  const eventRow = await db.event.findUnique({
    where: { id: params.eventId },
    select: {
      date: true,
      endDate: true,
      weeks: {
        orderBy: { sortOrder: "asc" },
        select: {
          themes: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
  if (eventRow === null) {
    return null;
  }
  if (now.getTime() < eventRow.date.getTime()) {
    return null;
  }
  if (now.getTime() > eventRow.endDate.getTime()) {
    return null;
  }

  const currentWeekIndex = getCurrentEventWeekIndex({
    eventStartDate: eventRow.date,
    now,
  });
  if (currentWeekIndex < 0) {
    return null;
  }

  const currentWeekRow = eventRow.weeks[currentWeekIndex];
  if (currentWeekRow === undefined) {
    return null;
  }

  return {
    weekNumber: currentWeekIndex + 1,
    themes: currentWeekRow.themes.map((themeRow) => {
      return {
        themeId: themeRow.id,
        themeName: themeRow.name,
      };
    }),
  };
}

export async function getThemesForCurrentEventWeek(params: {
  eventId: string;
  now?: Date;
}): Promise<ThemeForAttackDefendSubmission[]> {
  const currentEventWeekForDisplay =
    await getCurrentEventWeekForDisplay(params);
  if (currentEventWeekForDisplay === null) {
    return [];
  }
  return currentEventWeekForDisplay.themes;
}

export async function validateOptionalThemeIdForEventSubmission(params: {
  eventId: string;
  themeId: string | null;
  now?: Date;
}): Promise<
  | { isValid: true; themeId: string | null }
  | { isValid: false; errorMessage: string }
> {
  if (params.themeId === null) {
    return { isValid: true, themeId: null };
  }

  const themesForCurrentEventWeek = await getThemesForCurrentEventWeek({
    eventId: params.eventId,
    now: params.now,
  });
  const isThemeAllowedForCurrentWeek = themesForCurrentEventWeek.some(
    (themeRow) => {
      return themeRow.themeId === params.themeId;
    },
  );
  if (isThemeAllowedForCurrentWeek === false) {
    return {
      isValid: false,
      errorMessage: "Theme is not available for the current week.",
    };
  }

  return { isValid: true, themeId: params.themeId };
}
