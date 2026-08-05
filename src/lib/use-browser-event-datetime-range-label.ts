"use client";

import { useEffect, useState } from "react";

import { formatEventDateTimeRangeLabel } from "~/lib/format-event-datetime-range-label";

export function useBrowserEventDateTimeRangeLabel(
  startsAt: Date | string,
  endsAt: Date | string,
): string {
  const startsAtMs = new Date(startsAt).getTime();
  const endsAtMs = new Date(endsAt).getTime();
  const [dateTimeRangeLabel, setDateTimeRangeLabel] = useState("");

  useEffect(() => {
    setDateTimeRangeLabel(
      formatEventDateTimeRangeLabel(new Date(startsAtMs), new Date(endsAtMs)),
    );
  }, [startsAtMs, endsAtMs]);

  return dateTimeRangeLabel;
}
