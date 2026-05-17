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
