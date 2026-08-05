const dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
  dateStyle: "long",
  timeStyle: "short",
};

export function formatEventDateTimeRangeLabel(
  startDate: Date,
  endDate: Date,
): string {
  const startLabel = startDate.toLocaleString(undefined, dateTimeFormatOptions);
  const endLabel = endDate.toLocaleString(undefined, dateTimeFormatOptions);
  return `${startLabel} – ${endLabel}`;
}

export function formatEventDisplayNameWithDateTimeRange(params: {
  eventName: string;
  startDate: Date;
  endDate: Date;
  emptyNameFallback: string;
}): string {
  const trimmedEventName = params.eventName.trim();
  const eventTitle =
    trimmedEventName.length > 0 ? trimmedEventName : params.emptyNameFallback;
  const eventDateTimeRangeLabel = formatEventDateTimeRangeLabel(
    params.startDate,
    params.endDate,
  );
  return `${eventTitle} (${eventDateTimeRangeLabel})`;
}
