"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import {
  bookingConfirmationEmail,
  newBookingNotificationEmail,
} from "@/lib/email-templates";
import { z } from "zod";

const BookingSchema = z.object({
  serviceId: z.string(),
  date: z.string(),
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
    where: { id: serviceId, tenantId },
  });

  if (!service) {
    return { slots: [] };
  }

  const dateObj = new Date(date + "T00:00:00");
  const dayOfWeek = dateObj.getDay();

  // Get availability for this day
  const availability = await prisma.availability.findMany({
    where: {
      tenantId,
      dayOfWeek,
      isActive: true,
    },
  });

  if (availability.length === 0) {
    return { slots: [] };
  }

  // Get booking config
  const bookingConfig = await prisma.bookingConfig.findUnique({
    where: { tenantId },
  });

  const slotDuration = bookingConfig?.slotDurationMinutes || 30;
  const buffer = bookingConfig?.bufferMinutes || 0;

  // Get existing appointments for this date
  const startOfDay = new Date(date + "T00:00:00");
  const endOfDay = new Date(date + "T23:59:59");

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      tenantId,
      startTime: { gte: startOfDay },
      endTime: { lte: endOfDay },
      status: { notIn: ["CANCELLED"] },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  // Generate slots
  const slots: string[] = [];
  const now = new Date();

  for (const avail of availability) {
    const [startHour, startMin] = avail.startTime.split(":").map(Number);
    const [endHour, endMin] = avail.endTime.split(":").map(Number);

    let current = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;

    while (current + service.duration <= end) {
      const slotStart = new Date(date);
      slotStart.setHours(Math.floor(current / 60), current % 60, 0, 0);

      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + service.duration);

      // Check if slot is in the past
      if (slotStart <= now) {
        current += slotDuration;
        continue;
      }

      // Check for conflicts with existing appointments
      const hasConflict = existingAppointments.some((apt) => {
        const aptStart = new Date(apt.startTime);
        const aptEnd = new Date(apt.endTime);
        // Add buffer time
        aptStart.setMinutes(aptStart.getMinutes() - buffer);
        aptEnd.setMinutes(aptEnd.getMinutes() + buffer);

        return slotStart < aptEnd && slotEnd > aptStart;
      });

      if (!hasConflict) {
        slots.push(
          slotStart.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        );
      }

      current += slotDuration;
    }
  }

  return { slots };
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

  // Get service and tenant
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { tenant: true },
  });

  if (!service) {
    return { success: false, error: "Service not found" };
  }

  // Parse time string (e.g., "9:00 AM" -> Date)
  const [timePart, period] = time.split(" ");
  const [hours, minutes] = timePart.split(":").map(Number);
  let hour24 = hours;
  if (period === "PM" && hours !== 12) hour24 += 12;
  if (period === "AM" && hours === 12) hour24 = 0;

  const startTime = new Date(date);
  startTime.setHours(hour24, minutes, 0, 0);

  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + service.duration);

  // Check for double booking
  const conflict = await prisma.appointment.findFirst({
    where: {
      tenantId: service.tenantId,
      status: { notIn: ["CANCELLED"] },
      OR: [
        {
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gt: startTime } },
          ],
        },
        {
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gte: endTime } },
          ],
        },
        {
          AND: [
            { startTime: { gte: startTime } },
            { endTime: { lte: endTime } },
          ],
        },
      ],
    },
  });

  if (conflict) {
    return { success: false, error: "This time slot is no longer available" };
  }

  // Create appointment
  const appointment = await prisma.appointment.create({
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
    },
  });

  // Send confirmation emails
  const formattedDate = startTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = startTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Get tenant owner for notification
  const tenant = await prisma.tenant.findUnique({
    where: { id: service.tenantId },
    include: { owner: true },
  });

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
      notes,
    }),
  }).catch(console.error);

  // Send notification to business owner (non-blocking)
  if (tenant?.owner?.email) {
    sendEmail({
      to: tenant.owner.email,
      subject: `New Booking: ${clientName} - ${service.name}`,
      html: newBookingNotificationEmail({
        businessName: tenant.businessName,
        primaryColor: tenant.primaryColor,
        clientName,
        clientEmail: clientEmail.toLowerCase(),
        clientPhone,
        serviceName: service.name,
        date: formattedDate,
        time: formattedTime,
        duration: service.duration,
        notes,
        dashboardUrl: `${process.env.AUTH_URL || "http://localhost:3000"}/dashboard/appointments`,
      }),
      replyTo: clientEmail.toLowerCase(),
    }).catch(console.error);
  }

  return { success: true, appointmentId: appointment.id };
}
