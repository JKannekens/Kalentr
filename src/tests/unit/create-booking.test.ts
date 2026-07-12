import { describe, it, expect, vi, beforeEach } from "vitest";

const prismaMock = vi.hoisted(() => ({
  service: { findFirst: vi.fn() },
  bookingConfig: { findUnique: vi.fn() },
  $transaction: vi.fn(),
}));
const txMock = vi.hoisted(() => ({
  appointment: { findFirst: vi.fn(), create: vi.fn() },
}));
const rateLimitMock = vi.hoisted(() => vi.fn());
const sendEmailMock = vi.hoisted(() => vi.fn());
const getOpenSlotsMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: rateLimitMock,
  getClientIp: vi.fn(async () => "203.0.113.7"),
}));
vi.mock("@/lib/email", () => ({
  sendEmail: sendEmailMock,
  FROM_EMAIL: "noreply@kalentr.com",
}));
vi.mock("@/services/booking", () => ({ getOpenSlots: getOpenSlotsMock }));

import { createBooking } from "@/app/tenant/[subdomain]/book/[serviceId]/actions";

const SERVICE = {
  id: "s1",
  tenantId: "t1",
  name: "Consultation",
  duration: 30,
  isActive: true,
  tenant: {
    id: "t1",
    businessName: "Test Studio",
    primaryColor: "#10b981",
    timezone: "UTC",
    use24Hour: false,
    location: null,
    owner: { email: "owner@example.com" },
  },
};

const SLOT = { label: "10:00 AM", start: new Date("2030-06-10T10:00:00.000Z") };

function makeFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  const base: Record<string, string> = {
    serviceId: "s1",
    date: "2030-06-10",
    time: "10:00 AM",
    clientName: "Jane Doe",
    clientEmail: "Jane@Example.com",
    ...overrides,
  };
  for (const [k, v] of Object.entries(base)) fd.set(k, v);
  return fd;
}

function clientEmailCall() {
  return sendEmailMock.mock.calls.find(([args]) => args.to === "jane@example.com")?.[0];
}
function ownerEmailCall() {
  return sendEmailMock.mock.calls.find(([args]) => args.to === "owner@example.com")?.[0];
}

describe("createBooking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rateLimitMock.mockResolvedValue({ success: true, retryAfterSeconds: 0 });
    prismaMock.service.findFirst.mockResolvedValue(SERVICE);
    prismaMock.bookingConfig.findUnique.mockResolvedValue({ requireApproval: false });
    getOpenSlotsMock.mockResolvedValue([SLOT]);
    prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof txMock) => unknown) => fn(txMock));
    txMock.appointment.findFirst.mockResolvedValue(null);
    txMock.appointment.create.mockImplementation(async (args: { data: object }) => ({
      id: "a1",
      ...args.data,
    }));
    sendEmailMock.mockResolvedValue({ success: true });
  });

  it("rejects when rate limited", async () => {
    rateLimitMock.mockResolvedValue({ success: false, retryAfterSeconds: 60 });
    const result = await createBooking(makeFormData());
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/too many/i);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rejects malformed input (bad date, bad email)", async () => {
    expect((await createBooking(makeFormData({ date: "10-06-2030" }))).error).toBe("Invalid booking data");
    expect((await createBooking(makeFormData({ clientEmail: "not-an-email" }))).error).toBe("Invalid booking data");
  });

  it("rejects when the service is missing or inactive", async () => {
    prismaMock.service.findFirst.mockResolvedValue(null);
    const result = await createBooking(makeFormData());
    expect(result).toMatchObject({ success: false, error: "Service not found" });
  });

  it("rejects a time that is not among the server-derived open slots", async () => {
    const result = await createBooking(makeFormData({ time: "3:00 AM" }));
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/no longer available/i);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("books CONFIRMED with the slot's exact instant and sends the invite", async () => {
    const result = await createBooking(makeFormData());
    expect(result).toMatchObject({ success: true, appointmentId: "a1", pending: false });

    const created = txMock.appointment.create.mock.calls[0][0].data;
    expect(created.status).toBe("CONFIRMED");
    // Persisted time comes from the matched slot, not re-parsed client input
    expect(created.startTime.toISOString()).toBe("2030-06-10T10:00:00.000Z");
    expect(created.endTime.toISOString()).toBe("2030-06-10T10:30:00.000Z");
    expect(created.clientEmail).toBe("jane@example.com");

    const clientEmail = clientEmailCall();
    expect(clientEmail.subject).toMatch(/booking confirmed/i);
    expect(clientEmail.attachments).toHaveLength(1);
    expect(clientEmail.attachments[0].filename).toBe("invite.ics");
    expect(ownerEmailCall().subject).toMatch(/^New Booking:/);
  });

  it("books PENDING without an invite when approval is required", async () => {
    prismaMock.bookingConfig.findUnique.mockResolvedValue({ requireApproval: true });
    const result = await createBooking(makeFormData());
    expect(result).toMatchObject({ success: true, pending: true });

    expect(txMock.appointment.create.mock.calls[0][0].data.status).toBe("PENDING");

    const clientEmail = clientEmailCall();
    expect(clientEmail.subject).toMatch(/request received/i);
    expect(clientEmail.attachments).toBeUndefined();
    expect(ownerEmailCall().subject).toMatch(/booking request/i);
  });

  it("reports the slot as taken when the transaction finds a conflict", async () => {
    txMock.appointment.findFirst.mockResolvedValue({ id: "existing" });
    const result = await createBooking(makeFormData());
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/no longer available/i);
    expect(txMock.appointment.create).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });
});
