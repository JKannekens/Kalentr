import { describe, it, expect } from "vitest";
import { generateSlotInstants, generateSlots } from "@/lib/generate-slots";

const DATE = "2030-06-10"; // a Monday
const PAST_NOW = new Date("2030-06-09T23:59:00");

describe("generateSlotInstants", () => {
  it("returns a canonical label and an exact start for each slot", () => {
    const slots = generateSlotInstants({
      date: DATE,
      availability: [{ startTime: "09:00", endTime: "10:00" }],
      existingAppointments: [],
      serviceDuration: 30,
      slotDuration: 30,
      bufferMinutes: 0,
      now: PAST_NOW,
    });

    expect(slots.map((s) => s.label)).toEqual(["9:00 AM", "9:30 AM"]);

    const first = slots[0].start;
    expect(first.getHours()).toBe(9);
    expect(first.getMinutes()).toBe(0);
  });

  it("generateSlots returns exactly the labels of generateSlotInstants", () => {
    const input = {
      date: DATE,
      availability: [{ startTime: "09:00", endTime: "12:00" }],
      existingAppointments: [],
      serviceDuration: 30,
      slotDuration: 30,
      bufferMinutes: 0,
      now: PAST_NOW,
    };
    expect(generateSlots(input)).toEqual(
      generateSlotInstants(input).map((s) => s.label)
    );
  });

  it("does not emit a start whose label was filtered out by a conflict", () => {
    const slots = generateSlotInstants({
      date: DATE,
      availability: [{ startTime: "09:00", endTime: "11:00" }],
      existingAppointments: [
        {
          startTime: new Date(`${DATE}T10:00:00`),
          endTime: new Date(`${DATE}T10:30:00`),
        },
      ],
      serviceDuration: 30,
      slotDuration: 30,
      bufferMinutes: 0,
      now: PAST_NOW,
    });

    expect(slots.map((s) => s.label)).not.toContain("10:00 AM");
  });
});
