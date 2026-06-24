// Timezone helpers. Appointments are stored as UTC instants; availability and
// slots are expressed as wall-clock times in each tenant's IANA timezone.
// These convert between the two and read the wall-clock parts of an instant.

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let f = formatterCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatterCache.set(timeZone, f);
  }
  return f;
}

function rawParts(instant: Date, timeZone: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const p of partsFormatter(timeZone).formatToParts(instant)) {
    if (p.type !== "literal") map[p.type] = p.value;
  }
  return map;
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export interface ZonedParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-23
  minute: number;
  weekday: number; // 0 = Sunday
}

/** The wall-clock parts of an instant, as seen in the given timezone. */
export function getZonedParts(instant: Date, timeZone: string): ZonedParts {
  const m = rawParts(instant, timeZone);
  return {
    year: Number(m.year),
    month: Number(m.month),
    day: Number(m.day),
    hour: Number(m.hour),
    minute: Number(m.minute),
    weekday: WEEKDAY_INDEX[m.weekday],
  };
}

/** Offset (ms) between the timezone's wall clock and UTC at a given instant. */
function offsetMs(instant: Date, timeZone: string): number {
  const m = rawParts(instant, timeZone);
  const asUTC = Date.UTC(
    Number(m.year),
    Number(m.month) - 1,
    Number(m.day),
    Number(m.hour),
    Number(m.minute),
    Number(m.second)
  );
  return asUTC - instant.getTime();
}

/**
 * Convert a wall-clock time (a "YYYY-MM-DD" date plus hour/minute) in the given
 * timezone to the matching UTC instant. Refines once so DST transitions resolve
 * to the correct offset.
 */
export function zonedTimeToUtc(
  date: string,
  hours: number,
  minutes: number,
  timeZone: string
): Date {
  const [y, mo, d] = date.split("-").map(Number);
  const wallAsUTC = Date.UTC(y, mo - 1, d, hours, minutes, 0);
  let utc = wallAsUTC - offsetMs(new Date(wallAsUTC), timeZone);
  utc = wallAsUTC - offsetMs(new Date(utc), timeZone);
  return new Date(utc);
}

/** "YYYY-MM-DD" calendar-day key of an instant in the given timezone. */
export function zonedDateKey(instant: Date, timeZone: string): string {
  const m = rawParts(instant, timeZone);
  return `${m.year}-${m.month}-${m.day}`;
}

/** Minutes since midnight of an instant in the given timezone. */
export function zonedMinutes(instant: Date, timeZone: string): number {
  const m = rawParts(instant, timeZone);
  return Number(m.hour) * 60 + Number(m.minute);
}

/** Today's calendar parts in the given timezone. */
export function todayInTimeZone(timeZone: string): ZonedParts {
  return getZonedParts(new Date(), timeZone);
}

/** Local "YYYY-MM-DD" key of a date — for the client's date selection. */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}
