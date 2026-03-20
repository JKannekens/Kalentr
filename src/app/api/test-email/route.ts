import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { bookingConfirmationEmail } from "@/lib/email-templates";

// Test endpoint - remove in production
export async function GET() {
  const result = await sendEmail({
    to: "justinkannekens@gmail.com",
    subject: "Kalentr Test Email",
    html: bookingConfirmationEmail({
      businessName: "Test Business",
      primaryColor: "#3b82f6",
      clientName: "Justin",
      serviceName: "Consultation",
      date: "Friday, March 20, 2026",
      time: "2:00 PM",
      duration: 30,
      notes: "This is a test booking confirmation!",
    }),
  });

  return NextResponse.json(result);
}
