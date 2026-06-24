import { describe, it, expect } from "vitest";
import {
  bookingConfirmationEmail,
  newBookingNotificationEmail,
  appointmentStatusChangeEmail,
  appointmentReminderEmail,
} from "@/lib/email-templates";

const BUSINESS = "Test Studio";
const COLOR = "#10b981";

describe("bookingConfirmationEmail", () => {
  const base = {
    businessName: BUSINESS,
    primaryColor: COLOR,
    clientName: "Jane Doe",
    serviceName: "Consultation",
    date: "Monday, January 15, 2030",
    time: "9:00 AM",
    duration: 60,
  };

  it("includes the business name", () => {
    expect(bookingConfirmationEmail(base)).toContain(BUSINESS);
  });

  it("includes the client name in the greeting", () => {
    expect(bookingConfirmationEmail(base)).toContain("Jane Doe");
  });

  it("includes the service name", () => {
    expect(bookingConfirmationEmail(base)).toContain("Consultation");
  });

  it("includes the formatted date and time", () => {
    const html = bookingConfirmationEmail(base);
    expect(html).toContain("Monday, January 15, 2030");
    expect(html).toContain("9:00 AM");
  });

  it("uses the primary color for branding", () => {
    expect(bookingConfirmationEmail(base)).toContain(COLOR);
  });

  it("includes notes when provided", () => {
    const html = bookingConfirmationEmail({ ...base, notes: "Please bring ID" });
    expect(html).toContain("Please bring ID");
  });

  it("omits the notes row when no notes provided", () => {
    const html = bookingConfirmationEmail(base);
    expect(html).not.toContain("Please bring ID");
  });

  it("includes the cancellation URL when provided", () => {
    const html = bookingConfirmationEmail({
      ...base,
      cancellationUrl: "https://example.com/cancel",
    });
    expect(html).toContain("https://example.com/cancel");
  });

  it("returns a valid HTML string", () => {
    const html = bookingConfirmationEmail(base);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("</html>");
  });

  it("shows confirmed wording and a calendar button by default", () => {
    const html = bookingConfirmationEmail({
      ...base,
      calendarUrl: "https://calendar.google.com/x",
    });
    expect(html).toContain("Booking Confirmed!");
    expect(html).toContain("Add to Google Calendar");
  });

  it("shows pending wording and no calendar button when pending", () => {
    const html = bookingConfirmationEmail({ ...base, pending: true });
    expect(html).toContain("Booking Request Received");
    expect(html).not.toContain("Add to Google Calendar");
  });
});

describe("newBookingNotificationEmail", () => {
  const base = {
    businessName: BUSINESS,
    primaryColor: COLOR,
    clientName: "Jane Doe",
    clientEmail: "jane@example.com",
    serviceName: "Consultation",
    date: "Monday, January 15, 2030",
    time: "9:00 AM",
    duration: 60,
    dashboardUrl: "https://kalentr.com/dashboard/appointments",
  };

  it("includes the client email", () => {
    expect(newBookingNotificationEmail(base)).toContain("jane@example.com");
  });

  it("includes the dashboard URL", () => {
    expect(newBookingNotificationEmail(base)).toContain(
      "https://kalentr.com/dashboard/appointments"
    );
  });

  it("includes optional client phone when provided", () => {
    const html = newBookingNotificationEmail({
      ...base,
      clientPhone: "+1 555 000 1234",
    });
    expect(html).toContain("+1 555 000 1234");
  });

  it("omits phone section when not provided", () => {
    const html = newBookingNotificationEmail(base);
    expect(html).not.toContain("+1 555");
  });
});

describe("appointmentStatusChangeEmail", () => {
  const base = {
    businessName: BUSINESS,
    primaryColor: COLOR,
    clientName: "Jane Doe",
    serviceName: "Consultation",
    date: "Monday, January 15, 2030",
    time: "9:00 AM",
  };

  it("uses 'Confirmed' heading for CONFIRMED status", () => {
    const html = appointmentStatusChangeEmail({ ...base, status: "CONFIRMED" });
    expect(html).toContain("Appointment Confirmed");
  });

  it("uses 'Cancelled' heading for CANCELLED status", () => {
    const html = appointmentStatusChangeEmail({ ...base, status: "CANCELLED" });
    expect(html).toContain("Appointment Cancelled");
  });

  it("includes the service name in both statuses", () => {
    expect(
      appointmentStatusChangeEmail({ ...base, status: "CONFIRMED" })
    ).toContain("Consultation");
    expect(
      appointmentStatusChangeEmail({ ...base, status: "CANCELLED" })
    ).toContain("Consultation");
  });

  it("mentions the business name in cancellation message", () => {
    const html = appointmentStatusChangeEmail({ ...base, status: "CANCELLED" });
    expect(html).toContain(BUSINESS);
  });
});

describe("appointmentReminderEmail", () => {
  const base = {
    businessName: BUSINESS,
    primaryColor: COLOR,
    clientName: "Jane Doe",
    serviceName: "Consultation",
    date: "Monday, January 15, 2030",
    time: "9:00 AM",
    duration: 60,
    hoursUntil: 24,
  };

  it("says 'tomorrow' when hoursUntil is 24", () => {
    const html = appointmentReminderEmail(base);
    expect(html).toContain("tomorrow");
  });

  it("says 'in N hours' for other values", () => {
    const html = appointmentReminderEmail({ ...base, hoursUntil: 2 });
    expect(html).toContain("in 2 hours");
  });
});
