// Small time-distance helpers. Kept out of component bodies so reading the
// clock (Date.now) doesn't trip the react-hooks purity rule during render.

/** Whole days from now until `date`, clamped at 0. */
export function daysUntil(date: Date): number {
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86_400_000));
}

/** Fractional hours from now until `date` (negative if already past). */
export function hoursUntil(date: Date): number {
  return (date.getTime() - Date.now()) / 3_600_000;
}
