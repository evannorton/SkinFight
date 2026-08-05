export type CharactersGridFilterValues = {
  teamId: string | null;
  eventId: string | null;
  userId: string | null;
};

export type CharactersGridTeamFilterOption = {
  id: string;
  name: string;
};

export type CharactersGridEventFilterOption = {
  id: string;
  eventName: string;
  startsAtIso: string;
  endsAtIso: string;
};

export const CHARACTERS_GRID_ALL_FILTER_VALUE = "__all__";

export function resolveCharactersGridFilterValues(
  searchParams: Record<string, string | string[] | undefined>,
  currentOngoingEventId: string | null,
): CharactersGridFilterValues {
  const teamId = parseCharactersGridSearchParamString(searchParams.teamId);
  const userId = parseCharactersGridSearchParamString(searchParams.userId);
  const rawEventIdSearchParam = parseCharactersGridSearchParamString(
    searchParams.eventId,
  );

  if (rawEventIdSearchParam === CHARACTERS_GRID_ALL_FILTER_VALUE) {
    return {
      teamId,
      eventId: null,
      userId,
    };
  }

  if (rawEventIdSearchParam !== null) {
    return {
      teamId,
      eventId: rawEventIdSearchParam,
      userId,
    };
  }

  if (currentOngoingEventId !== null) {
    return {
      teamId,
      eventId: currentOngoingEventId,
      userId,
    };
  }

  return {
    teamId,
    eventId: null,
    userId,
  };
}

function parseCharactersGridSearchParamString(
  searchParamValue: string | string[] | undefined,
): string | null {
  if (typeof searchParamValue === "string" && searchParamValue.length > 0) {
    return searchParamValue;
  }
  if (
    Array.isArray(searchParamValue) &&
    searchParamValue[0] !== undefined &&
    searchParamValue[0].length > 0
  ) {
    return searchParamValue[0];
  }
  return null;
}

export function buildCharactersPagePath(
  filterValues: CharactersGridFilterValues,
): string {
  const urlSearchParams = new URLSearchParams();
  if (filterValues.teamId !== null) {
    urlSearchParams.set("teamId", filterValues.teamId);
  }
  if (filterValues.eventId !== null) {
    urlSearchParams.set("eventId", filterValues.eventId);
  } else {
    urlSearchParams.set("eventId", CHARACTERS_GRID_ALL_FILTER_VALUE);
  }
  if (filterValues.userId !== null) {
    urlSearchParams.set("userId", filterValues.userId);
  }
  return `/characters?${urlSearchParams.toString()}`;
}
