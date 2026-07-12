import { describe, it, expect, vi, beforeEach } from "vitest";

const headersMock = vi.hoisted(() => vi.fn());
const queryRawMock = vi.hoisted(() => vi.fn());
vi.mock("next/headers", () => ({ headers: headersMock }));
vi.mock("@/lib/prisma", () => ({ prisma: { $queryRaw: queryRawMock } }));

import { getClientIp, rateLimit } from "@/lib/rate-limit";

function mockHeaders(map: Record<string, string>) {
  headersMock.mockResolvedValue({
    get: (k: string) => map[k.toLowerCase()] ?? null,
  });
}

describe("getClientIp", () => {
  // Braces matter: a bare `() => mock.mockReset()` returns the mock, which
  // vitest would then run as a cleanup callback after each test.
  beforeEach(() => {
    headersMock.mockReset();
  });

  it("uses the first entry of x-forwarded-for", async () => {
    mockHeaders({ "x-forwarded-for": "203.0.113.7, 70.41.3.18, 150.172.238.178" });
    expect(await getClientIp()).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip", async () => {
    mockHeaders({ "x-real-ip": "198.51.100.4" });
    expect(await getClientIp()).toBe("198.51.100.4");
  });

  it("returns 'unknown' when no IP headers are present", async () => {
    mockHeaders({});
    expect(await getClientIp()).toBe("unknown");
  });
});

describe("rateLimit", () => {
  beforeEach(() => {
    queryRawMock.mockReset();
  });

  it("allows requests while the counter is at or under the limit", async () => {
    queryRawMock.mockResolvedValue([
      { count: 5, expiresAt: new Date(Date.now() + 60_000) },
    ]);
    const result = await rateLimit("k", 5, 60);
    expect(result).toEqual({ success: true, retryAfterSeconds: 0 });
  });

  it("blocks requests over the limit and reports when to retry", async () => {
    queryRawMock.mockResolvedValue([
      { count: 6, expiresAt: new Date(Date.now() + 45_000) },
    ]);
    const result = await rateLimit("k", 5, 60);
    expect(result.success).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThanOrEqual(1);
    expect(result.retryAfterSeconds).toBeLessThanOrEqual(45);
  });

  it("fails open when the database is unavailable", async () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    queryRawMock.mockImplementation(() => {
      throw new Error("connection refused");
    });
    const result = await rateLimit("k", 5, 60);
    expect(result).toEqual({ success: true, retryAfterSeconds: 0 });
    quiet.mockRestore();
  });
});
