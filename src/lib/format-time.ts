// Shared time formatting — respects each tenant's 12h/24h preference.

const pad = (n: number) => String(n).padStart(2, "0");

/** Format an hour/minute pair as "14:30" (24h) or "2:30 PM" (12h). */
export function formatClock(
  hours: number,
  minutes: number,
  use24Hour: boolean,
): string {
  if (use24Hour) return `${pad(hours)}:${pad(minutes)}`;
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${pad(minutes)} ${period}`;
}

/**
 * Format a time for display. Accepts a Date, a 24h "HH:MM" string, or a
 * 12h "H:MM AM/PM" string (the canonical slot value) and renders it in the
 * tenant's preferred notation.
 */
export function formatTime(
  value: Date | string,
  use24Hour: boolean = false,
  timeZone?: string,
): string {
  if (value instanceof Date) {
    if (timeZone) {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hourCycle: "h23",
        hour: "2-digit",
        minute: "2-digit",
      }).formatToParts(value);
      const map: Record<string, string> = {};
      for (const p of parts) if (p.type !== "literal") map[p.type] = p.value;
      return formatClock(Number(map.hour), Number(map.minute), use24Hour);
    }
    return formatClock(value.getHours(), value.getMinutes(), use24Hour);
  }

  const period = value.match(/(AM|PM)/i)?.[1]?.toUpperCase();
  const [rawHours, rawMinutes] = value
    .replace(/\s*(AM|PM)/i, "")
    .split(":")
    .map(Number);

  let hours = rawHours;
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return formatClock(hours, rawMinutes || 0, use24Hour);
}
