"use client";

import type { Appointment, Service } from "@prisma/client";

type AppointmentWithService = Appointment & { service: Service };

interface AppointmentsForDateProps {
  appointments: AppointmentWithService[];
  selectedDate: Date;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  CONFIRMED:
    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  NO_SHOW: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400",
};

export function AppointmentsForDate({
  appointments,
  selectedDate,
}: AppointmentsForDateProps) {
  const toLocalKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const selectedDateKey = toLocalKey(selectedDate);
  const dayAppointments = appointments.filter(
    (app) => toLocalKey(new Date(app.startTime)) === selectedDateKey,
  );

  const dateString = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(selectedDate);

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  if (dayAppointments.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-6 text-center dark:bg-gray-800 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          No appointments on {dateString}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          {dateString}
        </h3>
        {isToday && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            Today
          </span>
        )}
      </div>

      {dayAppointments.map((appointment) => {
        const startTime = new Date(appointment.startTime);
        const endTime = new Date(appointment.endTime);
        const timeStr = `${startTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })} - ${endTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })}`;

        return (
          <div
            key={appointment.id}
            className="rounded-lg border bg-white p-4 dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {appointment.service.name}
                  </h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_COLORS[appointment.status] ||
                      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {timeStr}
                </p>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium">{appointment.clientName}</p>
                  <p>{appointment.clientEmail}</p>
                  {appointment.clientPhone && <p>{appointment.clientPhone}</p>}
                </div>

                {appointment.notes && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Note:</span>{" "}
                    {appointment.notes}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
