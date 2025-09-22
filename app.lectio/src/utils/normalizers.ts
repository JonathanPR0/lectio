export function normalizeDate(date?: Date): string {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

export function normalizeLocalDate(date: Date | string): Date {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Date(`${dateObj.toISOString().split("T")[0]}T00:00:00`);
}
