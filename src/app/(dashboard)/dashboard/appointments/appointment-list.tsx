"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateAppointmentStatus } from "./actions";
import type { Appointment, Service, AppointmentStatus } from "@prisma/client";

type AppointmentWithService = Appointment & { service: Service };

interface AppointmentListProps {
  appointments: AppointmentWithService[];
  type: "upcoming" | "past";
}

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
  NO_SHOW: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400",
};

export function AppointmentList({ appointments, type }: AppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center dark:bg-gray-800 dark:border-gray-700">
        <p className="text-gray-500">
          {type === "upcoming"
            ? "No upcoming appointments"
            : "No past appointments"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          showActions={type === "upcoming"}
        />
      ))}
    </div>
  );
}

function AppointmentCard({
  appointment,
  showActions,
}: {
  appointment: AppointmentWithService;
  showActions: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(status: AppointmentStatus) {
    setLoading(true);
    setError(null);

    try {
      const result = await updateAppointmentStatus(appointment.id, status);
      if (!result.success) {
        setError(result.error || "Failed to update");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const startTime = new Date(appointment.startTime);
  const endTime = new Date(appointment.endTime);

  return (
    <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold">{appointment.service.name}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                STATUS_COLORS[appointment.status]
              }`}
            >
              {appointment.status}
            </span>
          </div>

          <div className="space-y-1 text-sm">
            <p>
              <span className="text-gray-500">Date: </span>
              {startTime.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p>
              <span className="text-gray-500">Time: </span>
              {startTime.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {endTime.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t dark:border-gray-700">
            <p className="font-medium">{appointment.clientName}</p>
            <p className="text-sm text-gray-500">{appointment.clientEmail}</p>
            {appointment.clientPhone && (
              <p className="text-sm text-gray-500">{appointment.clientPhone}</p>
            )}
            {appointment.notes && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Note: {appointment.notes}
              </p>
            )}
          </div>
        </div>

        {showActions && appointment.status !== "CANCELLED" && (
          <div className="flex flex-col gap-2">
            {appointment.status === "PENDING" && (
              <Button
                size="sm"
                onClick={() => handleStatusChange("CONFIRMED")}
                disabled={loading}
              >
                Confirm
              </Button>
            )}
            {appointment.status === "CONFIRMED" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange("COMPLETED")}
                  disabled={loading}
                >
                  Complete
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleStatusChange("NO_SHOW")}
                  disabled={loading}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  No show
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleStatusChange("CANCELLED")}
              disabled={loading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
