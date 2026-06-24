import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { appointmentReminderEmail } from "@/lib/email-templates";
import { formatTime } from "@/lib/format-time";

// This endpoint should be called by a cron job (e.g., Vercel Cron, Railway Cron)
// Run every hour: 0 * * * *

export async function GET(request: NextRequest) {
  // Fail closed: without a configured secret, nobody may run this job.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("CRON_SECRET is not set; refusing to run the reminders job.");
    return NextResponse.json({ error: "Cron is not configured" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Opportunistic cleanup of expired rate-limit rows (best effort).
  await prisma.rateLimit
    .deleteMany({ where: { expiresAt: { lt: now } } })
    .catch(() => {});


  // Find appointments in the next 24 hours that haven't been reminded
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000);

  // Get appointments starting 24h from now (within the hour window)
  const upcomingAppointments = await prisma.appointment.findMany({
    where: {
      startTime: {
        gte: in23Hours,
        lt: in24Hours,
      },
      status: "CONFIRMED",
      reminderSent: false,
    },
    include: {
      service: true,
      tenant: true,
    },
  });

  const results = {
    processed: 0,
    sent: 0,
    failed: 0,
  };

  for (const appointment of upcomingAppointments) {
    results.processed++;
    
    try {
      const formattedDate = appointment.startTime.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: appointment.tenant.timezone,
      });
      const formattedTime = formatTime(
        appointment.startTime,
        appointment.tenant.use24Hour,
        appointment.tenant.timezone
      );

      const emailResult = await sendEmail({
        to: appointment.clientEmail,
        subject: `Reminder: ${appointment.service.name} tomorrow at ${formattedTime}`,
        html: appointmentReminderEmail({
          businessName: appointment.tenant.businessName,
          primaryColor: appointment.tenant.primaryColor,
          clientName: appointment.clientName,
          serviceName: appointment.service.name,
          date: formattedDate,
          time: formattedTime,
          duration: appointment.service.duration,
          location: appointment.tenant.location,
          hoursUntil: 24,
        }),
      });

      if (emailResult.success) {
        // Mark reminder as sent
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { reminderSent: true },
        });
        results.sent++;
      } else {
        results.failed++;
        console.error(`Reminder failed for ${appointment.id}:`, emailResult.error);
      }
    } catch (error) {
      results.failed++;
      console.error(`Reminder error for ${appointment.id}:`, error);
    }
  }

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    results,
  });
}
