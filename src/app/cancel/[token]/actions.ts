"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { appointmentStatusChangeEmail } from "@/lib/email-templates";
import { formatTime } from "@/lib/format-time";

export async function cancelByToken(token: string): Promise<{ success: boolean; error?: string }> {
  const appointment = await prisma.appointment.findUnique({
    where: { cancelToken: token },
    include: { service: true, tenant: { include: { bookingConfig: true } } },
  });

  if (!appointment) {
    return { success: false, error: "Cancellation link not found or already used." };
  }

  if (appointment.status === "CANCELLED") {
    return { success: false, error: "This appointment is already cancelled." };
  }

  if (appointment.status === "COMPLETED") {
    return { success: false, error: "Completed appointments cannot be cancelled." };
  }

  // Block cancellation within the configured notice window.
  const noticeHours = appointment.tenant.bookingConfig?.cancellationNoticeHours ?? 1;
  const hoursUntil = (appointment.startTime.getTime() - Date.now()) / 3_600_000;
  if (noticeHours > 0 && hoursUntil < noticeHours) {
    return {
      success: false,
      error: `Appointments cannot be cancelled less than ${noticeHours} hour${noticeHours === 1 ? "" : "s"} before the start time.`,
    };
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancelReason: "Cancelled by client",
      cancelToken: null,
    },
  });

  const tz = appointment.tenant.timezone;
  const formattedDate = appointment.startTime.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: tz,
  });
  const formattedTime = formatTime(appointment.startTime, appointment.tenant.use24Hour, tz);

  sendEmail({
    to: appointment.clientEmail,
    subject: `Booking Cancelled - ${appointment.service.name} at ${appointment.tenant.businessName}`,
    html: appointmentStatusChangeEmail({
      businessName: appointment.tenant.businessName,
      primaryColor: appointment.tenant.primaryColor,
      clientName: appointment.clientName,
      serviceName: appointment.service.name,
      date: formattedDate,
      time: formattedTime,
      status: "CANCELLED",
    }),
  }).catch(console.error);

  return { success: true };
}
