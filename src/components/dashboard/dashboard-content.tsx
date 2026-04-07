"use client";

import { useState, useMemo } from "react";
import { MonthCalendar } from "@/components/calendar/month-calendar";
import { AppointmentsForDate } from "@/components/dashboard/appointments-for-date";
import { ServicesSidebar } from "@/components/dashboard/services-sidebar";
import { SettingsShortcuts } from "@/components/dashboard/settings-shortcuts";
import type { Appointment, Service, TimeOff } from "@prisma/client";

type AppointmentWithService = Appointment & { service: Service };

interface DashboardContentProps {
  appointments: AppointmentWithService[];
  services: Service[];
  timezone?: string;
  timeOff: TimeOff[];
}

export function DashboardContent({
  appointments,
  services,
  timeOff,
}: DashboardContentProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Sort appointments by startTime for calendar display
  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      ),
    [appointments],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Left column: Calendar + Appointments */}
      <div className="lg:col-span-3 space-y-6">
        <MonthCalendar
          appointments={sortedAppointments}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          timeOff={timeOff}
        />
        <AppointmentsForDate
          appointments={sortedAppointments}
          selectedDate={selectedDate}
        />
      </div>

      {/* Right column: Services + Settings */}
      <div className="space-y-6">
        <ServicesSidebar services={services} />
        <SettingsShortcuts />
      </div>
    </div>
  );
}
