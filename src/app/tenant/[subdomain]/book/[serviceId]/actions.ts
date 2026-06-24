"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import {
  bookingConfirmationEmail,
  newBookingNotificationEmail,
} from "@/lib/email-templates";
import { getOpenSlots } from "@/services/booking";
import { formatTime } from "@/lib/format-time";
import { z } from "zod";

/** Sentinel used to abort the booking transaction when the slot is taken. */
class SlotTakenError extends Error {}

const BookingSchema = z.object({
  serviceId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  time: z.string(),
  clientName: z.string().min(2),
  clientEmail: z.email(),
  clientPhone: z.string().optional(),
  notes: z.string().optional(),
});

export async function getAvailableSlots(
  tenantId: string,
  serviceId: string,
  date: string
): Promise<{ slots: string[] }> {
  const service = await prisma.service.findFirst({
    where: { id: serviceId, tenantId, isActive: true },
    select: { duration: true },
  });

  if (!service) {
    return { slots: [] };
  }

  const slots = await getOpenSlots({
    tenantId,
    serviceDuration: service.duration,
    date,
  });

  return { slots: slots.map((s) => s.label) };
}

export async function createBooking(formData: FormData): Promise<{
  success: boolean;
  error?: string;
  appointmentId?: string;
}> {
  const rawData = {
    serviceId: formData.get("serviceId") as string,
    date: formData.get("date") as string,
    time: formData.get("time") as string,
    clientName: formData.get("clientName") as string,
    clientEmail: formData.get("clientEmail") as string,
    clientPhone: (formData.get("clientPhone") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = BookingSchema.safeParse(rawData);

  if (!parsed.success) {
    return { success: false, error: "Invalid booking data" };
  }

  const { serviceId, date, time, clientName, clientEmail, clientPhone, notes } =
    parsed.data;

  // Only active services are bookable.
  const service = await prisma.service.findFirst({
    where: { id: serviceId, isActive: true },
    include: { tenant: { include: { owner: true } } },
  });

  if (!service) {
    return { success: false, error: "Service not found" };
  }

  // Re-derive the valid slots on the server and require the requested time to
  // be one of them. This enforces availability, buffer, advance-notice and the
  // booking window — never trust the date/time the client submits.
  const openSlots = await getOpenSlots({
    tenantId: service.tenantId,
    serviceDuration: service.duration,
    date,
  });
  const slot = openSlots.find((s) => s.label === time);

  if (!slot) {
    return { success: false, error: "This time slot is no longer available" };
  }

  const startTime = slot.start;
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + service.duration);

  // Create inside a serializable transaction with a final conflict re-check so
  // two concurrent requests for the same slot can't both succeed.
  const cancelToken = crypto.randomUUID();
  let appointmentId: string;
  try {
    const appointment = await prisma.$transaction(
      async (tx) => {
        const conflict = await tx.appointment.findFirst({
          where: {
            tenantId: service.tenantId,
            status: { notIn: ["CANCELLED"] },
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
          select: { id: true },
        });

        if (conflict) {
          throw new SlotTakenError();
        }

        return tx.appointment.create({
          data: {
            tenantId: service.tenantId,
            serviceId,
            clientName,
            clientEmail: clientEmail.toLowerCase(),
            clientPhone,
            startTime,
            endTime,
            notes,
            status: "CONFIRMED",
            cancelToken,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
    appointmentId = appointment.id;
  } catch (err) {
    // Our explicit conflict, or a serialization failure (P2034) when a
    // concurrent transaction won the slot — both mean "taken".
    if (
      err instanceof SlotTakenError ||
      (err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2034")
    ) {
      return { success: false, error: "This time slot is no longer available" };
    }
    console.error("createBooking failed:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  // Send confirmation emails
  const formattedDate = startTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = formatTime(startTime, service.tenant.use24Hour);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const cancellationUrl = `${appUrl}/cancel/${cancelToken}`;

  // Send confirmation to client (non-blocking)
  sendEmail({
    to: clientEmail.toLowerCase(),
    subject: `Booking Confirmed - ${service.name} at ${service.tenant.businessName}`,
    html: bookingConfirmationEmail({
      businessName: service.tenant.businessName,
      primaryColor: service.tenant.primaryColor,
      clientName,
      serviceName: service.name,
      date: formattedDate,
      time: formattedTime,
      duration: service.duration,
      location: service.tenant.location,
      notes,
      cancellationUrl,
    }),
  }).catch(console.error);

  // Send notification to business owner (non-blocking)
  if (service.tenant.owner?.email) {
    sendEmail({
      to: service.tenant.owner.email,
      subject: `New Booking: ${clientName} - ${service.name}`,
      html: newBookingNotificationEmail({
        businessName: service.tenant.businessName,
        primaryColor: service.tenant.primaryColor,
        clientName,
        clientEmail: clientEmail.toLowerCase(),
        clientPhone,
        serviceName: service.name,
        date: formattedDate,
        time: formattedTime,
        duration: service.duration,
        notes,
        dashboardUrl: `${process.env.AUTH_URL || appUrl}/dashboard/appointments`,
      }),
      replyTo: clientEmail.toLowerCase(),
    }).catch(console.error);
  }

  return { success: true, appointmentId };
}
