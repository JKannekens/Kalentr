import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { appointmentReminderEmail } from "@/lib/email-templates";

// This endpoint should be called by a cron job (e.g., Vercel Cron, Railway Cron)
// Run every hour: 0 * * * *

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  
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
    errors: [] as string[],
  };

  for (const appointment of upcomingAppointments) {
    results.processed++;
    
    try {
      const formattedDate = appointment.startTime.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const formattedTime = appointment.startTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

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
        results.errors.push(`Failed for ${appointment.id}: ${JSON.stringify(emailResult.error)}`);
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`Error for ${appointment.id}: ${error}`);
    }
  }

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    results,
  });
}
