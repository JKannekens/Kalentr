"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TimeOff } from "@prisma/client";
import {
  type AppointmentWithService,
  type CalendarView,
  addDays,
  getWeekStart,
  toLocalKey,
} from "./calendar-utils";
import { MonthView } from "./month-view";
import { WeekView } from "./week-view";
import { DayView } from "./day-view";

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

export function Calendar({
  appointments,
  selectedDate,
  onDateSelect,
  onAppointmentClick,
  timeOff,
}: MonthCalendarProps) {
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(() => new Date());

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

  const dayKey = toLocalKey(currentDate);
  const dayAppts = appointmentsByDate.get(dayKey) ?? [];

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

      {view === "month" && (
        <MonthView
          appointmentsByDate={appointmentsByDate}
          currentDate={currentDate}
          selectedDate={selectedDate}
          onSelectDay={selectDay}
          onAppointmentClick={onAppointmentClick}
          timeOff={timeOff}
        />
      )}

      {view === "week" && (
        <WeekView
          appointmentsByDate={appointmentsByDate}
          currentDate={currentDate}
          selectedDate={selectedDate}
          onSelectDay={selectDay}
          onAppointmentClick={onAppointmentClick}
          timeOff={timeOff}
        />
      )}

      {view === "day" && (
        <DayView
          appointments={dayAppts}
          currentDate={currentDate}
          onAppointmentClick={onAppointmentClick}
          timeOff={timeOff}
        />
      )}
    </div>
  );
}
