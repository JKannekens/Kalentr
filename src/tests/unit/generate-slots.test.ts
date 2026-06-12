import { describe, it, expect } from "vitest";
import { generateSlots } from "@/lib/generate-slots";

// Fixed future date (2030-06-10 is a Monday) so day-of-week assertions are reliable
const DATE = "2030-06-10";
// Set "now" to midnight the day before so every slot on DATE is in the future
const PAST_NOW = new Date("2030-06-09T23:59:00");

describe("generateSlots", () => {
  it("returns empty array when there is no availability", () => {
    const slots = generateSlots({
      date: DATE,
      availability: [],
      existingAppointments: [],
      serviceDuration: 30,
      slotDuration: 30,
      bufferMinutes: 0,
      now: PAST_NOW,
    });
    expect(slots).toEqual([]);
  });

  it("generates correct number of slots for a 9-to-5 window", () => {
    const slots = generateSlots({
      date: DATE,
      availability: [{ startTime: "09:00", endTime: "17:00" }],
      existingAppointments: [],
      serviceDuration: 30,
      slotDuration: 30,
      bufferMinutes: 0,
      now: PAST_NOW,
    });
    // 8h × 2 slots/h = 16 slots
    expect(slots).toHaveLength(16);
    expect(slots[0]).toBe("9:00 AM");
    expect(slots[slots.length - 1]).toBe("4:30 PM");
  });

  it("skips a slot blocked by an existing appointment", () => {
    const aptStart = new Date(`${DATE}T10:00:00`);
    const aptEnd = new Date(`${DATE}T10:30:00`);

    const slots = generateSlots({
      date: DATE,
      availability: [{ startTime: "09:00", endTime: "12:00" }],
      existingAppointments: [{ startTime: aptStart, endTime: aptEnd }],
      serviceDuration: 30,
      slotDuration: 30,
      bufferMinutes: 0,
      now: PAST_NOW,
    });

    expect(slots).toContain("9:00 AM");
    expect(slots).not.toContain("10:00 AM");
    expect(slots).toContain("10:30 AM");
  });

  it("enforces buffer time — slots adjacent to appointment are blocked", () => {
    // Appointment 10:00–10:30 with a 15-min buffer means:
    //   - 9:30 slot ends at 10:00, but buffer makes apt start effectively 9:45 → conflict
    //   - 10:30 slot starts at 10:30, but buffer extends apt end to 10:45 → conflict
    const aptStart = new Date(`${DATE}T10:00:00`);
    const aptEnd = new Date(`${DATE}T10:30:00`);

    const slots = generateSlots({
      date: DATE,
      availability: [{ startTime: "09:00", endTime: "12:00" }],
      existingAppointments: [{ startTime: aptStart, endTime: aptEnd }],
      serviceDuration: 30,
      slotDuration: 30,
      bufferMinutes: 15,
      now: PAST_NOW,
    });

    expect(slots).not.toContain("9:30 AM");
    expect(slots).not.toContain("10:00 AM");
    expect(slots).not.toContain("10:30 AM");
    expect(slots).toContain("9:00 AM");
    expect(slots).toContain("11:00 AM"); // 11:00 start is outside buffer
  });

  it("skips slots in the past", () => {
    const now = new Date(`${DATE}T11:00:00`);

    const slots = generateSlots({
      date: DATE,
      availability: [{ startTime: "09:00", endTime: "17:00" }],
      existingAppointments: [],
      serviceDuration: 30,
      slotDuration: 30,
      bufferMinutes: 0,
      now,
    });

    expect(slots).not.toContain("9:00 AM");
    expect(slots).not.toContain("10:30 AM");
    expect(slots[0]).toBe("11:30 AM");
  });

  it("service duration longer than remaining window produces no slot", () => {
    // Window: 09:00–09:45, service: 60 min → no slot fits
    const slots = generateSlots({
      date: DATE,
      availability: [{ startTime: "09:00", endTime: "09:45" }],
      existingAppointments: [],
      serviceDuration: 60,
      slotDuration: 30,
      bufferMinutes: 0,
      now: PAST_NOW,
    });

    expect(slots).toHaveLength(0);
  });

  it("last slot fits exactly at the window boundary", () => {
    // Window: 09:00–10:00, service: 60 min → exactly one slot
    const slots = generateSlots({
      date: DATE,
      availability: [{ startTime: "09:00", endTime: "10:00" }],
      existingAppointments: [],
      serviceDuration: 60,
      slotDuration: 30,
      bufferMinutes: 0,
      now: PAST_NOW,
    });

    expect(slots).toHaveLength(1);
    expect(slots[0]).toBe("9:00 AM");
  });

  it("combines slots from multiple availability windows", () => {
    const slots = generateSlots({
      date: DATE,
      availability: [
        { startTime: "09:00", endTime: "12:00" },
        { startTime: "14:00", endTime: "17:00" },
      ],
      existingAppointments: [],
      serviceDuration: 30,
      slotDuration: 30,
      bufferMinutes: 0,
      now: PAST_NOW,
    });

    // 6 morning + 6 afternoon = 12
    expect(slots).toHaveLength(12);
    expect(slots).toContain("9:00 AM");
    expect(slots).toContain("2:00 PM");
    expect(slots).not.toContain("12:00 PM");
    expect(slots).not.toContain("1:30 PM");
  });

  it("handles multiple overlapping appointments correctly", () => {
    const appointments = [
      { startTime: new Date(`${DATE}T09:00:00`), endTime: new Date(`${DATE}T09:30:00`) },
      { startTime: new Date(`${DATE}T10:30:00`), endTime: new Date(`${DATE}T11:00:00`) },
    ];

    const slots = generateSlots({
      date: DATE,
      availability: [{ startTime: "09:00", endTime: "12:00" }],
      existingAppointments: appointments,
      serviceDuration: 30,
      slotDuration: 30,
      bufferMinutes: 0,
      now: PAST_NOW,
    });

    expect(slots).not.toContain("9:00 AM");
    expect(slots).toContain("9:30 AM");
    expect(slots).not.toContain("10:30 AM");
    expect(slots).toContain("10:00 AM");
    expect(slots).toContain("11:00 AM");
  });
});
