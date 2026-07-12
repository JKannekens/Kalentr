import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const prismaMock = vi.hoisted(() => ({
  rateLimit: { deleteMany: vi.fn() },
  appointment: { findMany: vi.fn(), update: vi.fn() },
}));
const sendEmailMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/email", () => ({
  sendEmail: sendEmailMock,
  FROM_EMAIL: "noreply@kalentr.com",
}));

import { GET } from "@/app/api/cron/reminders/route";

function request(authorization?: string) {
  return new NextRequest("http://localhost/api/cron/reminders", {
    headers: authorization ? { authorization } : {},
  });
}

describe("cron reminders auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.rateLimit.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.appointment.findMany.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fails closed when CRON_SECRET is not configured", async () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("CRON_SECRET", "");
    const res = await GET(request("Bearer anything"));
    expect(res.status).toBe(500);
    expect(prismaMock.appointment.findMany).not.toHaveBeenCalled();
    quiet.mockRestore();
  });

  it("rejects a missing or wrong bearer token", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    expect((await GET(request())).status).toBe(401);
    expect((await GET(request("Bearer wrong"))).status).toBe(401);
    expect(prismaMock.appointment.findMany).not.toHaveBeenCalled();
  });

  it("runs with the correct bearer token", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    const res = await GET(request("Bearer s3cret"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.results).toEqual({ processed: 0, sent: 0, failed: 0 });
  });
});
