"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Calendar } from "@/components/calendar/calendar";
import { ServicesSidebar } from "@/components/dashboard/services-sidebar";
import { SettingsShortcuts } from "@/components/dashboard/settings-shortcuts";
import { X } from "lucide-react";
import type { Appointment, Service, TimeOff } from "@prisma/client";

type AppointmentWithService = Appointment & { service: Service };

interface DashboardContentProps {
  appointments: AppointmentWithService[];
  services: Service[];
  timezone?: string;
  timeOff: TimeOff[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  CONFIRMED:
    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
  NO_SHOW: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400",
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function DashboardContent({
  appointments,
  services,
  timeOff,
}: DashboardContentProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [popover, setPopover] = useState<{
    appointment: AppointmentWithService;
    rect: DOMRect;
  } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      ),
    [appointments],
  );

  useEffect(() => {
    if (!popover) return;
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setPopover(null);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPopover(null);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [popover]);

  function openPopover(
    appointment: AppointmentWithService,
    anchorRect: DOMRect,
  ) {
    setPopover({ appointment, rect: anchorRect });
  }

  // Position the popover: prefer below the anchor, flip above if near bottom edge
  const popoverStyle = (() => {
    if (!popover) return {};
    const { rect } = popover;
    const popoverWidth = 280;
    const gap = 6;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    left = Math.max(8, Math.min(left, viewportW - popoverWidth - 8));

    const spaceBelow = viewportH - rect.bottom;
    const top =
      spaceBelow > 200
        ? rect.bottom + gap + window.scrollY
        : rect.top - gap + window.scrollY;
    const transformOrigin = spaceBelow > 200 ? "top center" : "bottom center";
    const translateY = spaceBelow > 200 ? "0" : "-100%";

    return {
      top,
      left,
      width: popoverWidth,
      transformOrigin,
      transform: `translateY(${translateY})`,
    };
  })();

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Calendar
            appointments={sortedAppointments}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onAppointmentClick={openPopover}
            timeOff={timeOff}
          />
        </div>

        <div className="space-y-6">
          <ServicesSidebar services={services} />
          <SettingsShortcuts />
        </div>
      </div>

      {popover && (
        <div
          ref={popoverRef}
          style={popoverStyle}
          className="fixed z-50 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 shadow-lg shadow-black/10 p-4 text-sm"
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {popover.appointment.service.name}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  STATUS_COLORS[popover.appointment.status] ??
                  "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                }`}
              >
                {popover.appointment.status}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPopover(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0 -mt-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-gray-500 dark:text-gray-400 mb-3">
            {formatTime(new Date(popover.appointment.startTime))} –{" "}
            {formatTime(new Date(popover.appointment.endTime))},{" "}
            {new Intl.DateTimeFormat("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(new Date(popover.appointment.startTime))}
          </p>

          <div className="border-t pt-3 dark:border-gray-800">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {popover.appointment.clientName}
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              {popover.appointment.clientEmail}
            </p>
            {popover.appointment.clientPhone && (
              <p className="text-gray-500 dark:text-gray-400">
                {popover.appointment.clientPhone}
              </p>
            )}
          </div>

          {popover.appointment.notes && (
            <div className="border-t pt-3 mt-3 dark:border-gray-800">
              <p className="font-medium text-gray-900 dark:text-gray-100 mb-0.5">
                Note
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                {popover.appointment.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
