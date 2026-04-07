"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Appointment, Service, TimeOff } from "@prisma/client";

type AppointmentWithService = Appointment & { service: Service };
type CalendarView = "month" | "week" | "day";

interface MonthCalendarProps {
  appointments: AppointmentWithService[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onAppointmentClick?: (
    appointment: AppointmentWithService,
    anchorRect: DOMRect,
  ) => void;
  timeOff: TimeOff[];
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

const APPOINTMENT_COLORS = [
  "bg-blue-500/20 text-blue-900 dark:bg-blue-500/30 dark:text-blue-100",
  "bg-orange-400/20 text-orange-900 dark:bg-orange-400/30 dark:text-orange-100",
  "bg-violet-500/20 text-violet-900 dark:bg-violet-500/30 dark:text-violet-100",
  "bg-emerald-500/20 text-emerald-900 dark:bg-emerald-500/30 dark:text-emerald-100",
  "bg-rose-500/20 text-rose-900 dark:bg-rose-500/30 dark:text-rose-100",
];

function getColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return APPOINTMENT_COLORS[hash % APPOINTMENT_COLORS.length];
}

const toLocalKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function getTimeOffForDay(
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

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday = 1; Sunday wraps back 6
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatHour(h: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const display = h % 12 || 12;
  return `${display}:00 ${period}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_START = 7;
const DAY_END = 21;

// ─── Shared day cell component ───────────────────────────────────────────────

interface DayCellProps {
  date: Date;
  dimmed?: boolean;
  compact?: boolean;
  appointments: AppointmentWithService[];
  timeOffEntry: TimeOff | undefined;
  isToday: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onAppointmentClick?: (
    appointment: AppointmentWithService,
    anchorRect: DOMRect,
  ) => void;
}

function DayCell({
  date,
  dimmed = false,
  compact = false,
  appointments,
  timeOffEntry,
  isToday,
  isSelected,
  onSelect,
  onAppointmentClick,
}: DayCellProps) {
  const d = date.getDate();
  const minH = compact ? "min-h-20" : "min-h-27.5";

  if (dimmed) {
    return (
      <div
        className={`${minH} p-2 border-r border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50`}
      >
        <span className="text-sm text-gray-300 dark:text-gray-700">{d}</span>
      </div>
    );
  }

  const visible = appointments.slice(0, compact ? 1 : 2);
  const overflow = appointments.length - visible.length;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col ${minH} p-2 cursor-pointer transition-colors border-r border-b border-gray-100 dark:border-gray-800 text-left w-full ${
        isSelected
          ? "bg-blue-50 dark:bg-blue-950/40"
          : timeOffEntry
            ? "bg-amber-50/60 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium ${
            isToday
              ? "bg-blue-600 text-white"
              : isSelected
                ? "text-blue-600 dark:text-blue-400 font-semibold"
                : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {d}
        </span>
        {overflow > 0 && (
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            +{overflow}
          </span>
        )}
      </div>

      {timeOffEntry && (
        <div className="rounded px-1.5 py-0.5 text-xs leading-tight bg-amber-200/60 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 mb-0.5">
          <p className="font-semibold truncate">
            {timeOffEntry.label ?? "Time off"}
          </p>
        </div>
      )}

      <div className="space-y-0.5">
        {visible.map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAppointmentClick?.(
                app,
                e.currentTarget.getBoundingClientRect(),
              );
            }}
            className={`w-full rounded px-1.5 py-0.5 text-xs leading-tight text-left ${getColor(app.serviceId)} ${onAppointmentClick ? "hover:brightness-95 cursor-pointer" : ""}`}
          >
            <p className="font-semibold truncate">{app.service.name}</p>
            {!compact && (
              <p className="truncate opacity-75">{app.clientName}</p>
            )}
          </button>
        ))}
      </div>
    </button>
  );
}

// ─── Main calendar component ─────────────────────────────────────────────────

export function MonthCalendar({
  appointments,
  selectedDate,
  onDateSelect,
  onAppointmentClick,
  timeOff,
}: MonthCalendarProps) {
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Build date → appointments lookup
  const appointmentsByDate = new Map<string, AppointmentWithService[]>();
  appointments.forEach((app) => {
    const key = toLocalKey(new Date(app.startTime));
    if (!appointmentsByDate.has(key)) appointmentsByDate.set(key, []);
    appointmentsByDate.get(key)!.push(app);
  });

  function goToday() {
    const today = new Date();
    setCurrentDate(today);
    onDateSelect(today);
  }

  function navigate(dir: -1 | 1) {
    if (view === "month") {
      setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + dir, 1));
    } else if (view === "week") {
      setCurrentDate((d) => addDays(d, dir * 7));
    } else {
      const next = addDays(currentDate, dir);
      setCurrentDate(next);
      onDateSelect(next);
    }
  }

  function selectDay(date: Date) {
    setCurrentDate(date);
    onDateSelect(date);
  }

  function isToday(year: number, month: number, day: number) {
    const t = new Date();
    return (
      day === t.getDate() && month === t.getMonth() && year === t.getFullYear()
    );
  }

  function isSelected(year: number, month: number, day: number) {
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  }

  // ─── Header title ──────────────────────────────────────────────
  let title = "";
  if (view === "month") {
    title = new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(currentDate);
  } else if (view === "week") {
    const ws = getWeekStart(currentDate);
    const we = addDays(ws, 6);
    const startStr = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(ws);
    const endStr =
      ws.getMonth() === we.getMonth()
        ? String(we.getDate())
        : new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
          }).format(we);
    title = `${startStr} – ${endStr}, ${we.getFullYear()}`;
  } else {
    title = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(currentDate);
  }

  const todayLabel =
    view === "day" ? "Today" : view === "week" ? "This week" : "This month";

  // ─── Month view data ───────────────────────────────────────────
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rawDay = new Date(year, month, 1).getDay(); // 0=Sun
  const startingDayOfWeek = rawDay === 0 ? 6 : rawDay - 1; // Mon=0 … Sun=6
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const prevMonthDays = Array.from(
    { length: startingDayOfWeek },
    (_, i) => prevMonthLastDay - startingDayOfWeek + i + 1,
  );
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalCells = prevMonthDays.length + currentMonthDays.length;
  const nextMonthDays = Array.from(
    { length: totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7) },
    (_, i) => i + 1,
  );

  // ─── Week view data ────────────────────────────────────────────
  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // ─── Day view data ─────────────────────────────────────────────
  const dayKey = toLocalKey(currentDate);
  const dayAppts = appointmentsByDate.get(dayKey) ?? [];
  const dayTimeOff = getTimeOffForDay(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    timeOff,
  );
  const hours = Array.from(
    { length: DAY_END - DAY_START },
    (_, i) => DAY_START + i,
  );

  return (
    <div className="rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b dark:border-gray-800 gap-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-base font-semibold tracking-tight px-2 min-w-48 text-center">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(1)}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday}>
            {todayLabel}
          </Button>
          <div className="flex rounded-lg border overflow-hidden dark:border-gray-700">
            {(["month", "week", "day"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm font-medium capitalize transition-colors border-r last:border-r-0 dark:border-gray-700 ${
                  view === v
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Month view ── */}
      {view === "month" && (
        <>
          <div className="grid grid-cols-7 border-b border-l border-gray-100 dark:border-gray-800">
            {DAY_LABELS.map((label) => (
              <div
                key={label}
                className="py-2 text-center text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide border-r border-gray-100 dark:border-gray-800"
              >
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 border-l border-t border-gray-100 dark:border-gray-800">
            {prevMonthDays.map((day) => (
              <DayCell
                key={`prev-${day}`}
                date={new Date(year, month - 1, day)}
                dimmed
                appointments={[]}
                timeOffEntry={undefined}
                isToday={false}
                isSelected={false}
                onSelect={() => {}}
              />
            ))}
            {currentMonthDays.map((day) => {
              const date = new Date(year, month, day);
              const key = toLocalKey(date);
              return (
                <DayCell
                  key={`cur-${day}`}
                  date={date}
                  appointments={appointmentsByDate.get(key) ?? []}
                  timeOffEntry={getTimeOffForDay(year, month, day, timeOff)}
                  isToday={isToday(year, month, day)}
                  isSelected={isSelected(year, month, day)}
                  onSelect={() => selectDay(date)}
                  onAppointmentClick={onAppointmentClick}
                />
              );
            })}
            {nextMonthDays.map((day) => (
              <DayCell
                key={`next-${day}`}
                date={new Date(year, month + 1, day)}
                dimmed
                appointments={[]}
                timeOffEntry={undefined}
                isToday={false}
                isSelected={false}
                onSelect={() => {}}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Week view ── */}
      {view === "week" && (
        <>
          {/* Day headers */}
          <div className="flex border-b border-gray-100 dark:border-gray-800">
            <div className="w-16 shrink-0" />
            {weekDays.map((date) => {
              const y = date.getFullYear();
              const m = date.getMonth();
              const d = date.getDate();
              const todayCell = isToday(y, m, d);
              const timeOffEntry = getTimeOffForDay(y, m, d, timeOff);
              return (
                <div
                  key={toLocalKey(date)}
                  className="flex-1 py-2 text-center border-l border-gray-100 dark:border-gray-800"
                >
                  <div className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                    {DAY_LABELS[(date.getDay() + 6) % 7]}
                  </div>
                  <button
                    type="button"
                    onClick={() => selectDay(date)}
                    className={`mx-auto mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold cursor-pointer ${
                      todayCell
                        ? "bg-blue-600 text-white"
                        : isSelected(y, m, d)
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {d}
                  </button>
                  {timeOffEntry && (
                    <div className="mx-1 mt-1 rounded px-1 py-0.5 text-xs bg-amber-200/60 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 truncate">
                      {timeOffEntry.label ?? "Time off"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Hourly grid */}
          <div className="overflow-y-auto max-h-130">
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex min-h-14 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
              >
                <div className="w-16 shrink-0 px-2 pt-2.5 text-xs text-gray-400 dark:text-gray-500 leading-tight">
                  <span>{hour % 12 || 12}:00</span>
                  <br />
                  <span>{hour >= 12 ? "PM" : "AM"}</span>
                </div>
                {weekDays.map((date) => {
                  const key = toLocalKey(date);
                  const slotAppts = (appointmentsByDate.get(key) ?? []).filter(
                    (app) => new Date(app.startTime).getHours() === hour,
                  );
                  return (
                    <div
                      key={key}
                      className="flex-1 border-l border-gray-100 dark:border-gray-800 px-1 py-1 space-y-0.5"
                    >
                      {slotAppts.map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={(e) =>
                            onAppointmentClick?.(
                              app,
                              e.currentTarget.getBoundingClientRect(),
                            )
                          }
                          className={`w-full rounded px-1.5 py-0.5 text-xs text-left ${getColor(app.serviceId)} ${onAppointmentClick ? "hover:brightness-95 cursor-pointer" : ""}`}
                        >
                          <p className="font-semibold truncate">
                            {app.service.name}
                          </p>
                          <p className="opacity-75 truncate">
                            {formatTime(new Date(app.startTime))}
                          </p>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Day view ── */}
      {view === "day" && (
        <div>
          {dayTimeOff && (
            <div className="mx-4 mt-3 rounded-md bg-amber-100 dark:bg-amber-900/30 px-3 py-2 text-sm font-medium text-amber-800 dark:text-amber-300">
              Time off{dayTimeOff.label ? `: ${dayTimeOff.label}` : ""}
            </div>
          )}
          <div className="overflow-y-auto max-h-130">
            {hours.map((hour) => {
              const slotAppts = dayAppts.filter(
                (app) => new Date(app.startTime).getHours() === hour,
              );
              return (
                <div
                  key={hour}
                  className="flex min-h-14 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                >
                  <div className="w-20 shrink-0 px-3 pt-2.5 text-xs text-gray-400 dark:text-gray-500">
                    {formatHour(hour)}
                  </div>
                  <div className="flex-1 space-y-1 border-l border-gray-100 dark:border-gray-800 px-2 py-1">
                    {slotAppts.map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={(e) =>
                          onAppointmentClick?.(
                            app,
                            e.currentTarget.getBoundingClientRect(),
                          )
                        }
                        className={`w-full rounded px-2 py-1 text-xs text-left ${getColor(app.serviceId)} ${onAppointmentClick ? "hover:brightness-95 cursor-pointer" : ""}`}
                      >
                        <p className="font-semibold">{app.service.name}</p>
                        <p className="opacity-75">
                          {formatTime(new Date(app.startTime))} –{" "}
                          {formatTime(new Date(app.endTime))} · {app.clientName}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
