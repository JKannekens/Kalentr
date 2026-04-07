import type { Appointment, Service, TimeOff } from "@prisma/client";

export type AppointmentWithService = Appointment & { service: Service };
export type CalendarView = "month" | "week" | "day";

export const APPOINTMENT_COLORS = [
  "bg-blue-500/20 text-blue-900 dark:bg-blue-500/30 dark:text-blue-100",
  "bg-orange-400/20 text-orange-900 dark:bg-orange-400/30 dark:text-orange-100",
  "bg-violet-500/20 text-violet-900 dark:bg-violet-500/30 dark:text-violet-100",
  "bg-emerald-500/20 text-emerald-900 dark:bg-emerald-500/30 dark:text-emerald-100",
  "bg-rose-500/20 text-rose-900 dark:bg-rose-500/30 dark:text-rose-100",
];

export function getColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return APPOINTMENT_COLORS[hash % APPOINTMENT_COLORS.length];
}

export const toLocalKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function getTimeOffForDay(
  year: number,
  month: number,
  day: number,
  timeOff: TimeOff[],
): TimeOff | undefined {
  const date = new Date(Date.UTC(year, month, day));
  return timeOff.find((entry) => {
    const start = new Date(entry.startDate);
    const end = new Date(entry.endDate);
    return date >= start && date <= end;
  });
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function formatHour(h: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const display = h % 12 || 12;
  return `${display}:00 ${period}`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function isTodayDate(year: number, month: number, day: number): boolean {
  const t = new Date();
  return (
    day === t.getDate() && month === t.getMonth() && year === t.getFullYear()
  );
}

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const DAY_START = 7;
export const DAY_END = 21;
export const HOUR_HEIGHT = 80; // px per hour — 30 min = 40 px
