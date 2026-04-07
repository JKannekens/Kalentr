"use client";

import type { TimeOff } from "@prisma/client";
import {
  type AppointmentWithService,
  DAY_END,
  DAY_LABELS,
  DAY_START,
  HOUR_HEIGHT,
  addDays,
  getColor,
  getTimeOffForDay,
  getWeekStart,
  isTodayDate,
  toLocalKey,
  formatTime,
} from "./calendar-utils";

export interface WeekViewProps {
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

export function WeekView({
  appointmentsByDate,
  currentDate,
  selectedDate,
  onSelectDay,
  onAppointmentClick,
  timeOff,
}: WeekViewProps) {
  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from(
    { length: DAY_END - DAY_START },
    (_, i) => DAY_START + i,
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
      {/* Day headers */}
      <div className="flex border-b border-gray-100 dark:border-gray-800">
        <div className="w-16 shrink-0" />
        {weekDays.map((date) => {
          const y = date.getFullYear();
          const m = date.getMonth();
          const d = date.getDate();
          const todayCell = isTodayDate(y, m, d);
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
                onClick={() => onSelectDay(date)}
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

      {/* Time grid */}
      <div className="overflow-y-auto max-h-130">
        <div className="flex">
          {/* Hour labels */}
          <div className="w-16 shrink-0">
            {hours.map((hour) => (
              <div
                key={hour}
                className="px-2 pt-2.5 text-xs text-gray-400 dark:text-gray-500 leading-tight border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                style={{ height: HOUR_HEIGHT }}
              >
                <span>{hour % 12 || 12}:00</span>
                <br />
                <span>{hour >= 12 ? "PM" : "AM"}</span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((date) => {
            const key = toLocalKey(date);
            const colAppts = appointmentsByDate.get(key) ?? [];
            return (
              <div
                key={key}
                className="flex-1 border-l border-gray-100 dark:border-gray-800 relative"
                style={{ height: (DAY_END - DAY_START) * HOUR_HEIGHT }}
              >
                {/* Hour lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full border-b border-gray-100 dark:border-gray-800 pointer-events-none"
                    style={{
                      top: (hour - DAY_START) * HOUR_HEIGHT,
                      height: HOUR_HEIGHT,
                    }}
                  />
                ))}

                {/* Appointments */}
                {colAppts.map((app) => {
                  const start = new Date(app.startTime);
                  const end = new Date(app.endTime);
                  const startMins = start.getHours() * 60 + start.getMinutes();
                  const endMins = end.getHours() * 60 + end.getMinutes();
                  const top = ((startMins - DAY_START * 60) / 60) * HOUR_HEIGHT;
                  const height = Math.max(
                    ((endMins - startMins) / 60) * HOUR_HEIGHT,
                    20,
                  );
                  if (top < 0 || top >= (DAY_END - DAY_START) * HOUR_HEIGHT)
                    return null;
                  return (
                    <button
                      key={app.id}
                      type="button"
                      onClick={(e) =>
                        onAppointmentClick?.(
                          app,
                          e.currentTarget.getBoundingClientRect(),
                        )
                      }
                      className={`absolute left-0.5 right-0.5 rounded px-1.5 py-0.5 text-xs text-left overflow-hidden ${getColor(app.serviceId)} ${onAppointmentClick ? "hover:brightness-95 cursor-pointer" : ""}`}
                      style={{ top, height }}
                    >
                      <p className="font-semibold truncate">{app.service.name}</p>
                      {height >= 36 && (
                        <p className="opacity-75 truncate">{formatTime(start)}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
