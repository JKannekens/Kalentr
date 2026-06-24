"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantByOwner } from "@/lib/tenant";
import { revalidatePath } from "next/cache";
import { AppointmentStatus } from "@prisma/client";
import { sendEmail, FROM_EMAIL } from "@/lib/email";
import { appointmentStatusChangeEmail } from "@/lib/email-templates";
import { formatTime } from "@/lib/format-time";
import { buildEventIcs, type CalendarEvent } from "@/lib/ics";

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const tenant = await getTenantByOwner(session.user.id);
  if (!tenant) {
    return { success: false, error: "No business found" };
  }

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, tenantId: tenant.id },
    include: { service: true },
  });

  if (!appointment) {
    return { success: false, error: "Appointment not found" };
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status,
      ...(status === "CANCELLED" ? { cancelledAt: new Date() } : {}),
    },
  });

  if (status === "CONFIRMED" || status === "CANCELLED") {
    const date = appointment.startTime.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: tenant.timezone,
    });
    const time = formatTime(appointment.startTime, tenant.use24Hour, tenant.timezone);

    // On confirmation, send the calendar invite (e.g. for approval-gated bookings
    // whose initial email skipped it).
    const attachments =
      status === "CONFIRMED"
        ? (() => {
            const event: CalendarEvent = {
              uid: `${appointment.id}@kalentr.com`,
              title: `${appointment.service.name} — ${tenant.businessName}`,
              description: `Your booking for ${appointment.service.name} with ${tenant.businessName}.`,
              location: tenant.location ?? undefined,
              start: appointment.startTime,
              end: appointment.endTime,
              organizerName: tenant.businessName,
              organizerEmail: session.user.email ?? FROM_EMAIL,
            };
            return [
              {
                filename: "invite.ics",
                content: Buffer.from(buildEventIcs(event), "utf-8"),
                contentType: "text/calendar",
              },
            ];
          })()
        : undefined;

    sendEmail({
      to: appointment.clientEmail,
      subject:
        status === "CONFIRMED"
          ? `Appointment Confirmed - ${appointment.service.name} at ${tenant.businessName}`
          : `Appointment Cancelled - ${appointment.service.name} at ${tenant.businessName}`,
      html: appointmentStatusChangeEmail({
        businessName: tenant.businessName,
        primaryColor: tenant.primaryColor,
        clientName: appointment.clientName,
        serviceName: appointment.service.name,
        date,
        time,
        status,
      }),
      attachments,
    }).catch(console.error);
  }

  revalidatePath("/dashboard/appointments");
  return { success: true };
}
