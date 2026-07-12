import { describe, it, expect, vi, beforeEach } from "vitest";

const prismaMock = vi.hoisted(() => ({
  availability: { findMany: vi.fn() },
  bookingConfig: { findUnique: vi.fn() },
  appointment: { findMany: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { getOpenSlots } from "@/services/booking";

// 2030-06-10 is a Monday (dayOfWeek 1)
const DATE = "2030-06-10";
const EARLY_NOW = new Date("2030-06-09T00:00:00Z");

function setup({
  availability = [{ dayOfWeek: 1, startTime: "09:00", endTime: "12:00" }],
  bookingConfig = null as object | null,
  appointments = [] as { startTime: Date; endTime: Date }[],
} = {}) {
  prismaMock.availability.findMany.mockResolvedValue(availability);
  prismaMock.bookingConfig.findUnique.mockResolvedValue(bookingConfig);
  prismaMock.appointment.findMany.mockResolvedValue(appointments);
}

describe("getOpenSlots", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns no slots when the day has no availability", async () => {
    setup({ availability: [] });
    const slots = await getOpenSlots({
      tenantId: "t1",
      serviceDuration: 30,
      date: DATE,
      timeZone: "UTC",
      now: EARLY_NOW,
    });
    expect(slots).toEqual([]);
  });

  it("returns every slot in the window with default config", async () => {
    setup();
    const slots = await getOpenSlots({
      tenantId: "t1",
      serviceDuration: 30,
      date: DATE,
      timeZone: "UTC",
      now: EARLY_NOW,
    });
    expect(slots.map((s) => s.label)).toEqual([
      "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    ]);
  });

  it("enforces minimum advance notice", async () => {
    setup({
      bookingConfig: {
        minAdvanceHours: 3,
        maxAdvanceDays: 30,
        slotDurationMinutes: 30,
        bufferMinutes: 0,
      },
    });
    // 07:00 + 3h notice → slots at or before 10:00 are gone
    const slots = await getOpenSlots({
      tenantId: "t1",
      serviceDuration: 30,
      date: DATE,
      timeZone: "UTC",
      now: new Date("2030-06-10T07:00:00Z"),
    });
    const labels = slots.map((s) => s.label);
    expect(labels).not.toContain("9:00 AM");
    expect(labels).not.toContain("10:00 AM");
    expect(labels[0]).toBe("10:30 AM");
  });

  it("enforces the maximum booking window", async () => {
    const config = {
      minAdvanceHours: 0,
      maxAdvanceDays: 2,
      slotDurationMinutes: 30,
      bufferMinutes: 0,
    };
    setup({ bookingConfig: config });
    // Date is 3 days past "now" but the window is 2 days → nothing bookable
    const now = new Date("2030-06-07T00:00:00Z");
    const blocked = await getOpenSlots({
      tenantId: "t1",
      serviceDuration: 30,
      date: DATE,
      timeZone: "UTC",
      now,
    });
    expect(blocked).toEqual([]);

    setup({ bookingConfig: { ...config, maxAdvanceDays: 5 } });
    const allowed = await getOpenSlots({
      tenantId: "t1",
      serviceDuration: 30,
      date: DATE,
      timeZone: "UTC",
      now,
    });
    expect(allowed.length).toBeGreaterThan(0);
  });

  it("excludes slots taken by existing appointments", async () => {
    setup({
      appointments: [
        {
          startTime: new Date(`${DATE}T10:00:00Z`),
          endTime: new Date(`${DATE}T10:30:00Z`),
        },
      ],
    });
    const slots = await getOpenSlots({
      tenantId: "t1",
      serviceDuration: 30,
      date: DATE,
      timeZone: "UTC",
      now: EARLY_NOW,
    });
    const labels = slots.map((s) => s.label);
    expect(labels).not.toContain("10:00 AM");
    expect(labels).toContain("9:30 AM");
    expect(labels).toContain("10:30 AM");
  });

  it("interprets availability in the tenant's timezone", async () => {
    // 2030-01-14 is a Monday; 9:00 New York winter = 14:00 UTC
    setup({
      availability: [{ dayOfWeek: 1, startTime: "09:00", endTime: "10:00" }],
    });
    const slots = await getOpenSlots({
      tenantId: "t1",
      serviceDuration: 30,
      date: "2030-01-14",
      timeZone: "America/New_York",
      now: new Date("2030-01-13T00:00:00Z"),
    });
    expect(slots[0].label).toBe("9:00 AM");
    expect(slots[0].start.toISOString()).toBe("2030-01-14T14:00:00.000Z");
  });
});
