import { describe, it, expect, vi } from "vitest";

// Prisma client isn't generated in the test environment — mock it before importing tenant
vi.mock("@/lib/prisma", () => ({
  prisma: {
    tenant: { findUnique: vi.fn() },
  },
}));

import { isValidSubdomain } from "@/lib/tenant";

describe("isValidSubdomain", () => {
  it("accepts typical valid subdomains", () => {
    expect(isValidSubdomain("acme")).toBe(true);
    expect(isValidSubdomain("my-business")).toBe(true);
    expect(isValidSubdomain("john123")).toBe(true);
    expect(isValidSubdomain("abc")).toBe(true);
    expect(isValidSubdomain("studio-one")).toBe(true);
  });

  it("rejects a subdomain that starts with a hyphen", () => {
    expect(isValidSubdomain("-acme")).toBe(false);
  });

  it("rejects a subdomain that ends with a hyphen", () => {
    expect(isValidSubdomain("acme-")).toBe(false);
  });

  it("rejects subdomains shorter than 3 characters", () => {
    expect(isValidSubdomain("ab")).toBe(false);
    expect(isValidSubdomain("a")).toBe(false);
  });

  it("rejects subdomains longer than 63 characters", () => {
    expect(isValidSubdomain("a".repeat(64))).toBe(false);
  });

  it("rejects uppercase letters (caller must lowercase before validation)", () => {
    expect(isValidSubdomain("Acme")).toBe(false);
    expect(isValidSubdomain("ACME")).toBe(false);
  });

  it("rejects subdomains with underscores", () => {
    expect(isValidSubdomain("my_business")).toBe(false);
  });

  it("rejects subdomains with dots", () => {
    expect(isValidSubdomain("my.business")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidSubdomain("")).toBe(false);
  });
});
