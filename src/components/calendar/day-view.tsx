"use client";

import type { TimeOff } from "@prisma/client";
import {
  type AppointmentWithService,
  DAY_END,
  DAY_START,
  formatHour,
  formatTime,
  getColor,
  getTimeOffForDay,
} from "./calendar-utils";

export interface DayViewProps {
  appointments: AppointmentWithService[];
  currentDate: Date;
  onAppointmentClick?: (
    appointment: AppointmentWithService,
    anchorRect: DOMRect,
  ) => void;
  timeOff: TimeOff[];
}

export function DayView({
  appointments,
  currentDate,
  onAppointmentClick,
  timeOff,
}: DayViewProps) {
  const hours = Array.from(
    { length: DAY_END - DAY_START },
    (_, i) => DAY_START + i,
  );

  const dayTimeOff = getTimeOffForDay(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    timeOff,
  );

  return (
    <div>
      {dayTimeOff && (
        <div className="mx-4 mt-3 rounded-md bg-amber-100 dark:bg-amber-900/30 px-3 py-2 text-sm font-medium text-amber-800 dark:text-amber-300">
          Time off{dayTimeOff.label ? `: ${dayTimeOff.label}` : ""}
        </div>
      )}
      <div className="overflow-y-auto max-h-130">
        {hours.map((hour) => {
          const slotAppts = appointments.filter(
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
  );
}
