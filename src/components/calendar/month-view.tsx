"use client";

import type { TimeOff } from "@prisma/client";
import {
  type AppointmentWithService,
  DAY_LABELS,
  getColor,
  getTimeOffForDay,
  isTodayDate,
  toLocalKey,
} from "./calendar-utils";

// ─── DayCell ──────────────────────────────────────────────────────────────────

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
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(); }}
      className={`flex flex-col ${minH} p-2 cursor-pointer transition-colors border-r border-b border-gray-100 dark:border-gray-800 text-left w-full ${
        isSelected
          ? "bg-emerald-50 dark:bg-emerald-950/40"
          : timeOffEntry
            ? "bg-amber-50/60 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium ${
            isToday
              ? "bg-emerald-600 text-white"
              : isSelected
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
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
              onAppointmentClick?.(app, e.currentTarget.getBoundingClientRect());
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
    </div>
  );
}

// ─── MonthView ────────────────────────────────────────────────────────────────

export interface MonthViewProps {
  appointmentsByDate: Map<string, AppointmentWithService[]>;
  currentDate: Date;
  selectedDate: Date;
  onSelectDay: (date: Date) => void;
  onAppointmentClick?: (
    appointment: AppointmentWithService,
    anchorRect: DOMRect,
  ) => void;
  timeOff: TimeOff[];
}

export function MonthView({
  appointmentsByDate,
  currentDate,
  selectedDate,
  onSelectDay,
  onAppointmentClick,
  timeOff,
}: MonthViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rawDay = new Date(year, month, 1).getDay();
  const startingDayOfWeek = rawDay === 0 ? 6 : rawDay - 1;
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

  function isSelected(y: number, m: number, d: number) {
    return (
      d === selectedDate.getDate() &&
      m === selectedDate.getMonth() &&
      y === selectedDate.getFullYear()
    );
  }

  return (
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
              isToday={isTodayDate(year, month, day)}
              isSelected={isSelected(year, month, day)}
              onSelect={() => onSelectDay(date)}
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
  );
}
