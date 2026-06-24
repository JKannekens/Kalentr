import { describe, it, expect, vi, beforeEach } from "vitest";

const headersMock = vi.hoisted(() => vi.fn());
vi.mock("next/headers", () => ({ headers: headersMock }));
// Avoid pulling the real Prisma client into this unit test.
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { getClientIp } from "@/lib/rate-limit";

function mockHeaders(map: Record<string, string>) {
  headersMock.mockResolvedValue({
    get: (k: string) => map[k.toLowerCase()] ?? null,
  });
}

describe("getClientIp", () => {
  beforeEach(() => headersMock.mockReset());

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
