function padTwoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatDateToDatetimeLocalValue(date: Date): string {
  const year = date.getFullYear();
  const month = padTwoDigits(date.getMonth() + 1);
  const day = padTwoDigits(date.getDate());
  const hours = padTwoDigits(date.getHours());
  const minutes = padTwoDigits(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
