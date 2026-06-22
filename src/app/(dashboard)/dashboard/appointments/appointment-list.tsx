"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateAppointmentStatus } from "./actions";
import { CalendarDays, Mail, Phone, MessageSquare } from "lucide-react";
import { formatTime } from "@/lib/format-time";
import type { Appointment, Service, AppointmentStatus } from "@prisma/client";

type AppointmentWithService = Appointment & { service: Service };

const STATUS_STYLES: Record<AppointmentStatus, { label: string; className: string }> = {
  PENDING:   { label: "Pending",   className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  CONFIRMED: { label: "Confirmed", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  COMPLETED: { label: "Completed", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
  NO_SHOW:   { label: "No show",   className: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400" },
};

export function AppointmentList({ appointments, type, use24Hour }: { appointments: AppointmentWithService[]; type: "upcoming" | "past"; use24Hour: boolean }) {
  if (appointments.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground text-sm">
          {type === "upcoming" ? "No upcoming appointments" : "No past appointments"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((a) => (
        <AppointmentCard key={a.id} appointment={a} showActions={type === "upcoming"} use24Hour={use24Hour} />
      ))}
    </div>
  );
}

function AppointmentCard({ appointment, showActions, use24Hour }: { appointment: AppointmentWithService; showActions: boolean; use24Hour: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(status: AppointmentStatus) {
    setLoading(true);
    setError(null);
    try {
      const result = await updateAppointmentStatus(appointment.id, status);
      if (!result.success) setError(result.error || "Failed to update");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const start = new Date(appointment.startTime);
  const end = new Date(appointment.endTime);
  const status = STATUS_STYLES[appointment.status];

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {error && (
        <div className="px-5 py-3 bg-red-50 text-sm text-red-700 border-b dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30">
          {error}
        </div>
      )}

      <div className="flex gap-0">
        {/* Date column */}
        <div className="hidden sm:flex flex-col items-center justify-center w-20 shrink-0 bg-muted/50 border-r py-5 px-2 text-center">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {start.toLocaleDateString("en-US", { month: "short" })}
          </span>
          <span className="text-3xl font-bold leading-tight text-foreground">
            {start.getDate()}
          </span>
          <span className="text-xs text-muted-foreground">
            {start.toLocaleDateString("en-US", { weekday: "short" })}
          </span>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground">{appointment.service.name}</h3>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
                  {status.label}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                <span className="sm:hidden">{start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · </span>
                {formatTime(start, use24Hour)}
                {" — "}
                {formatTime(end, use24Hour)}
              </p>
            </div>

            {/* Actions */}
            {showActions && appointment.status !== "CANCELLED" && (
              <div className="flex flex-col gap-1.5 shrink-0">
                {appointment.status === "PENDING" && (
                  <Button size="sm" onClick={() => handleStatusChange("CONFIRMED")} disabled={loading}>
                    Confirm
                  </Button>
                )}
                {appointment.status === "CONFIRMED" && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleStatusChange("COMPLETED")} disabled={loading}>
                      Complete
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleStatusChange("NO_SHOW")} disabled={loading}
                      className="text-muted-foreground hover:text-foreground">
                      No show
                    </Button>
                  </>
                )}
                <Button size="sm" variant="ghost" onClick={() => handleStatusChange("CANCELLED")} disabled={loading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Client info */}
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-x-5 gap-y-1">
            <span className="font-medium text-sm text-foreground">{appointment.clientName}</span>
            <a href={`mailto:${appointment.clientEmail}`}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="h-3.5 w-3.5" />
              {appointment.clientEmail}
            </a>
            {appointment.clientPhone && (
              <a href={`tel:${appointment.clientPhone}`}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="h-3.5 w-3.5" />
                {appointment.clientPhone}
              </a>
            )}
            {appointment.notes && (
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground italic w-full">
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                {appointment.notes}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
