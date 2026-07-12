import { describe, it, expect, vi, beforeEach } from "vitest";

const prismaMock = vi.hoisted(() => ({
  appointment: { findUnique: vi.fn(), update: vi.fn() },
}));
const sendEmailMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/email", () => ({
  sendEmail: sendEmailMock,
  FROM_EMAIL: "noreply@kalentr.com",
}));

import { cancelByToken } from "@/app/cancel/[token]/actions";

function makeAppointment({
  status = "CONFIRMED",
  hoursFromNow = 48,
  cancellationNoticeHours = 1 as number | null,
} = {}) {
  const startTime = new Date(Date.now() + hoursFromNow * 3_600_000);
  const endTime = new Date(startTime.getTime() + 30 * 60_000);
  return {
    id: "a1",
    status,
    startTime,
    endTime,
    clientName: "Jane Doe",
    clientEmail: "jane@example.com",
    service: { name: "Consultation" },
    tenant: {
      businessName: "Test Studio",
      primaryColor: "#10b981",
      timezone: "UTC",
      use24Hour: false,
      bookingConfig:
        cancellationNoticeHours === null ? null : { cancellationNoticeHours },
    },
  };
}

describe("cancelByToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.appointment.update.mockResolvedValue({});
    sendEmailMock.mockResolvedValue({ success: true });
  });

  it("rejects an unknown token", async () => {
    prismaMock.appointment.findUnique.mockResolvedValue(null);
    const result = await cancelByToken("nope");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not found/i);
  });

  it("rejects an already-cancelled appointment", async () => {
    prismaMock.appointment.findUnique.mockResolvedValue(makeAppointment({ status: "CANCELLED" }));
    const result = await cancelByToken("tok");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/already cancelled/i);
  });

  it("rejects a completed appointment", async () => {
    prismaMock.appointment.findUnique.mockResolvedValue(makeAppointment({ status: "COMPLETED" }));
    const result = await cancelByToken("tok");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/completed/i);
  });

  it("blocks cancellation inside the configured notice window", async () => {
    prismaMock.appointment.findUnique.mockResolvedValue(
      makeAppointment({ hoursFromNow: 2, cancellationNoticeHours: 24 }),
    );
    const result = await cancelByToken("tok");
    expect(result.success).toBe(false);
    expect(result.error).toContain("24 hours");
    expect(prismaMock.appointment.update).not.toHaveBeenCalled();
  });

  it("uses a singular message and a 1-hour default when config is missing", async () => {
    prismaMock.appointment.findUnique.mockResolvedValue(
      makeAppointment({ hoursFromNow: 0.5, cancellationNoticeHours: null }),
    );
    const result = await cancelByToken("tok");
    expect(result.success).toBe(false);
    expect(result.error).toContain("1 hour");
    expect(result.error).not.toContain("1 hours");
  });

  it("allows cancellation anytime when the notice is 0", async () => {
    prismaMock.appointment.findUnique.mockResolvedValue(
      makeAppointment({ hoursFromNow: 0.25, cancellationNoticeHours: 0 }),
    );
    const result = await cancelByToken("tok");
    expect(result.success).toBe(true);
  });

  it("cancels, clears the token, and emails the client outside the window", async () => {
    prismaMock.appointment.findUnique.mockResolvedValue(makeAppointment());
    const result = await cancelByToken("tok");
    expect(result.success).toBe(true);

    const update = prismaMock.appointment.update.mock.calls[0][0];
    expect(update.where).toEqual({ id: "a1" });
    expect(update.data.status).toBe("CANCELLED");
    expect(update.data.cancelToken).toBeNull();

    expect(sendEmailMock).toHaveBeenCalledOnce();
    expect(sendEmailMock.mock.calls[0][0].to).toBe("jane@example.com");
    expect(sendEmailMock.mock.calls[0][0].subject).toMatch(/cancelled/i);
  });
});
