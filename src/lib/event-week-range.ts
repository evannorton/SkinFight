export const MILLISECONDS_PER_EVENT_WEEK = 7 * 24 * 60 * 60 * 1000;

export function getCurrentEventWeekIndex(params: {
  eventStartDate: Date;
  now: Date;
}): number {
  const elapsedMilliseconds =
    params.now.getTime() - params.eventStartDate.getTime();
  if (elapsedMilliseconds < 0) {
    return -1;
  }
  return Math.floor(elapsedMilliseconds / MILLISECONDS_PER_EVENT_WEEK);
}

export function isDateWithinEventWeekRange(params: {
  eventStartDate: Date;
  weekIndex: number;
  date: Date;
}): boolean {
  const weekStartMilliseconds =
    params.eventStartDate.getTime() +
    params.weekIndex * MILLISECONDS_PER_EVENT_WEEK;
  const weekEndMilliseconds =
    weekStartMilliseconds + MILLISECONDS_PER_EVENT_WEEK;
  const dateMilliseconds = params.date.getTime();
  if (dateMilliseconds < weekStartMilliseconds) {
    return false;
  }
  if (dateMilliseconds >= weekEndMilliseconds) {
    return false;
  }
  return true;
}
