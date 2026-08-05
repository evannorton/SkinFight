"use client";

import { useEffect, useState } from "react";

import { formatEventDisplayNameWithDateTimeRange } from "~/lib/format-event-datetime-range-label";

export function useBrowserEventDisplayNameWithDateTimeRange(params: {
  eventName: string;
  startsAt: Date | string;
  endsAt: Date | string;
  emptyNameFallback: string;
}): string {
  const startsAtMs = new Date(params.startsAt).getTime();
  const endsAtMs = new Date(params.endsAt).getTime();
  const [displayName, setDisplayName] = useState(() => {
    const trimmedEventName = params.eventName.trim();
    if (trimmedEventName.length > 0) {
      return trimmedEventName;
    }
    return params.emptyNameFallback;
  });

  useEffect(() => {
    setDisplayName(
      formatEventDisplayNameWithDateTimeRange({
        eventName: params.eventName,
        startDate: new Date(startsAtMs),
        endDate: new Date(endsAtMs),
        emptyNameFallback: params.emptyNameFallback,
      }),
    );
  }, [
    params.eventName,
    params.emptyNameFallback,
    startsAtMs,
    endsAtMs,
  ]);

  return displayName;
}
