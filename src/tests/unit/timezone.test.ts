import { describe, it, expect } from "vitest";
import {
  zonedTimeToUtc,
  getZonedParts,
  zonedMinutes,
  zonedDateKey,
} from "@/lib/timezone";
import { generateSlotInstants } from "@/lib/generate-slots";

describe("zonedTimeToUtc", () => {
  it("converts a UTC wall time to the same instant", () => {
    expect(zonedTimeToUtc("2030-06-10", 9, 0, "UTC").toISOString()).toBe(
      "2030-06-10T09:00:00.000Z"
    );
  });

  it("converts New York winter (EST, UTC-5) wall time to UTC", () => {
    expect(
      zonedTimeToUtc("2030-01-15", 9, 0, "America/New_York").toISOString()
    ).toBe("2030-01-15T14:00:00.000Z");
  });

  it("converts New York summer (EDT, UTC-4) wall time to UTC", () => {
    expect(
      zonedTimeToUtc("2030-07-15", 9, 0, "America/New_York").toISOString()
    ).toBe("2030-07-15T13:00:00.000Z");
  });
});

describe("getZonedParts / zonedMinutes / zonedDateKey", () => {
  const instant = new Date("2030-01-15T14:30:00Z");

  it("reads the wall-clock parts in the target zone", () => {
    const p = getZonedParts(instant, "America/New_York");
    expect({ year: p.year, month: p.month, day: p.day, hour: p.hour, minute: p.minute }).toEqual({
      year: 2030,
      month: 1,
      day: 15,
      hour: 9,
      minute: 30,
    });
  });

  it("returns minutes since midnight in the zone", () => {
    expect(zonedMinutes(instant, "America/New_York")).toBe(9 * 60 + 30);
  });

  it("buckets by the zone's calendar day, not UTC's", () => {
    // 00:30 UTC on the 16th is still the 15th in New York.
    const lateNight = new Date("2030-01-16T00:30:00Z");
    expect(zonedDateKey(lateNight, "America/New_York")).toBe("2030-01-15");
  });
});

describe("generateSlotInstants with a timeZone", () => {
  it("labels are wall-clock and starts are the matching UTC instants", () => {
    const slots = generateSlotInstants({
      date: "2030-01-15",
      availability: [{ startTime: "09:00", endTime: "10:00" }],
      existingAppointments: [],
      serviceDuration: 30,
      slotDuration: 30,
      bufferMinutes: 0,
      now: new Date("2030-01-14T00:00:00Z"),
      timeZone: "America/New_York",
    });

    expect(slots.map((s) => s.label)).toEqual(["9:00 AM", "9:30 AM"]);
    expect(slots[0].start.toISOString()).toBe("2030-01-15T14:00:00.000Z");
  });
});
