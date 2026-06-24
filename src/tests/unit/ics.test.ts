import { describe, it, expect } from "vitest";
import { buildEventIcs, googleCalendarUrl, type CalendarEvent } from "@/lib/ics";

const baseEvent: CalendarEvent = {
  uid: "appt123@kalentr.com",
  title: "Design Consultation — Alex Morgan Design",
  description: "Your booking. Cancel: https://x.com/cancel/abc",
  location: "Amsterdam, NL",
  start: new Date("2030-01-15T14:00:00Z"),
  end: new Date("2030-01-15T14:30:00Z"),
  organizerName: "Alex Morgan Design",
  organizerEmail: "alex@example.com",
};

describe("buildEventIcs", () => {
  const ics = buildEventIcs(baseEvent);

  it("wraps the event in a VCALENDAR/VEVENT and uses CRLF", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("BEGIN:VEVENT\r\n");
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
  });

  it("emits UTC start/end stamps matching the instants", () => {
    expect(ics).toContain("DTSTART:20300115T140000Z");
    expect(ics).toContain("DTEND:20300115T143000Z");
  });

  it("includes uid, summary, location and organizer", () => {
    expect(ics).toContain("UID:appt123@kalentr.com");
    expect(ics).toContain("SUMMARY:Design Consultation");
    expect(ics).toContain("LOCATION:Amsterdam");
    expect(ics).toContain('ORGANIZER;CN="Alex Morgan Design":mailto:alex@example.com');
  });

  it("escapes commas in text values", () => {
    expect(ics).toContain("LOCATION:Amsterdam\\, NL");
  });

  it("omits optional fields when not provided", () => {
    const minimal = buildEventIcs({
      uid: "u@kalentr.com",
      title: "Slot",
      start: new Date("2030-06-10T09:00:00Z"),
      end: new Date("2030-06-10T09:30:00Z"),
    });
    expect(minimal).not.toContain("LOCATION:");
    expect(minimal).not.toContain("ORGANIZER");
    expect(minimal).toContain("SUMMARY:Slot");
  });
});

describe("googleCalendarUrl", () => {
  it("builds a render URL with UTC date range", () => {
    const url = new URL(googleCalendarUrl(baseEvent));
    expect(url.hostname).toBe("calendar.google.com");
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
    expect(url.searchParams.get("dates")).toBe(
      "20300115T140000Z/20300115T143000Z"
    );
    expect(url.searchParams.get("text")).toContain("Design Consultation");
    expect(url.searchParams.get("location")).toBe("Amsterdam, NL");
  });
});
