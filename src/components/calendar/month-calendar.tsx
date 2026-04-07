"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Appointment, Service, TimeOff } from "@prisma/client";

type AppointmentWithService = Appointment & { service: Service };

interface MonthCalendarProps {
  appointments: AppointmentWithService[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  timeOff: TimeOff[];
}

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

function getTimeOffForDay(year: number, month: number, day: number, timeOff: TimeOff[]): TimeOff | undefined {
  const date = new Date(Date.UTC(year, month, day));
  return timeOff.find((entry) => {
    const start = new Date(entry.startDate);
    const end = new Date(entry.endDate);
    return date >= start && date <= end;
  });
}

export function MonthCalendar({
  appointments,
  selectedDate,
  onDateSelect,
  timeOff,
}: MonthCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevMonthDays = Array.from(
    { length: startingDayOfWeek },
    (_, i) => prevMonthLastDay - startingDayOfWeek + i + 1,
  );

  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const totalCells = prevMonthDays.length + currentMonthDays.length;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const nextMonthDays = Array.from({ length: remainingCells }, (_, i) => i + 1);

  const appointmentsByDate = new Map<string, AppointmentWithService[]>();
  appointments.forEach((app) => {
    const key = toLocalKey(new Date(app.startTime));
    if (!appointmentsByDate.has(key)) appointmentsByDate.set(key, []);
    appointmentsByDate.get(key)!.push(app);
  });

  const getDayKey = (
    day: number,
    isCurrentMonth: boolean,
    isPrevMonth: boolean,
  ) => {
    if (isPrevMonth) return toLocalKey(new Date(year, month - 1, day));
    if (isCurrentMonth) return toLocalKey(new Date(year, month, day));
    return toLocalKey(new Date(year, month + 1, day));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isSelected = (day: number) =>
    day === selectedDate.getDate() &&
    month === selectedDate.getMonth() &&
    year === selectedDate.getFullYear();

  const monthName = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-base font-semibold tracking-tight">{monthName}</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 border-b border-l dark:border-gray-800 border-gray-100">
        {dayLabels.map((label) => (
          <div
            key={label}
            className="py-2 text-center text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide border-r border-gray-100 dark:border-gray-800"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 border-l border-t border-gray-100 dark:border-gray-800">
        {/* Prev month */}
        {prevMonthDays.map((day) => (
          <div
            key={`prev-${day}`}
            className="min-h-27.5 p-2 border-r border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50"
          >
            <span className="text-sm text-gray-300 dark:text-gray-700">
              {day}
            </span>
          </div>
        ))}

        {/* Current month */}
        {currentMonthDays.map((day) => {
          const key = getDayKey(day, true, false);
          const appts = appointmentsByDate.get(key) ?? [];
          const today = isToday(day);
          const selected = isSelected(day);
          const visible = appts.slice(0, 2);
          const overflow = appts.length - visible.length;
          const timeOffEntry = getTimeOffForDay(year, month, day, timeOff);

          return (
            <button
              type="button"
              key={`current-${day}`}
              onClick={() => onDateSelect(new Date(year, month, day))}
              className={`flex flex-col min-h-27.5 p-2 cursor-pointer transition-colors border-r border-b border-gray-100 dark:border-gray-800 ${
                selected
                  ? "bg-blue-50 dark:bg-blue-950/40"
                  : timeOffEntry
                    ? "bg-amber-50/60 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium ${
                    today
                      ? "bg-blue-600 text-white"
                      : selected
                        ? "text-blue-600 dark:text-blue-400 font-semibold"
                        : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {day}
                </span>
                {overflow > 0 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    +{overflow}
                  </span>
                )}
              </div>

              {/* Time off indicator */}
              {timeOffEntry && (
                <div className="rounded px-1.5 py-0.5 text-xs leading-tight bg-amber-200/60 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 mb-0.5">
                  <p className="font-semibold truncate">{timeOffEntry.label ?? "Time off"}</p>
                </div>
              )}

              {/* Appointment cards */}
              <div className="space-y-0.5">
                {visible.map((app) => (
                  <div
                    key={app.id}
                    className={`rounded px-1.5 py-0.5 text-xs leading-tight ${getColor(app.serviceId)}`}
                  >
                    <p className="font-semibold truncate">{app.service.name}</p>
                    <p className="truncate opacity-75">{app.clientName}</p>
                  </div>
                ))}
              </div>
            </button>
          );
        })}

        {/* Next month */}
        {nextMonthDays.map((day) => (
          <div
            key={`next-${day}`}
            className="min-h-27.5 p-2 border-r border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50"
          >
            <span className="text-sm text-gray-300 dark:text-gray-700">
              {day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
