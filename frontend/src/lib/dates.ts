import { differenceInCalendarDays, format, parse } from "date-fns";

/** Dates travel as "YYYY-MM-DD" strings and are always handled in LOCAL time,
 *  so a booking for the 5th never slips to the 4th because of UTC. */
const ISO = "yyyy-MM-dd";

export const toISO = (d: Date) => format(d, ISO);
export const fromISO = (s: string) => parse(s, ISO, new Date());
export const todayISO = () => toISO(new Date());

export function nightsBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  return Math.max(0, differenceInCalendarDays(fromISO(end), fromISO(start)));
}

export const prettyDate = (s: string) => (s ? format(fromISO(s), "MMM d, yyyy") : "");
export const shortDate = (s: string) => (s ? format(fromISO(s), "MMM d") : "");

export interface DateRange {
  start_date: string;
  end_date: string;
}

/** Half-open ranges [start, end): back-to-back stays do not conflict.
 *  Same rule as the server, so the UI never offers dates the API will refuse. */
export const rangesOverlap = (aStart: string, aEnd: string, b: DateRange) =>
  aStart < b.end_date && aEnd > b.start_date;
