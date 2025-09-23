import { toZonedTime } from "date-fns-tz";

export function getCurrentDateTimeInBrazil(): Date {
  const timeZone = "America/Sao_Paulo";
  const now = new Date();
  const zonedTime = toZonedTime(now, timeZone);
  return zonedTime;
}
