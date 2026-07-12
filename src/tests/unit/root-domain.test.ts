import { describe, it, expect, afterEach, vi } from "vitest";
import { getRootDomain, tenantUrl } from "@/lib/root-domain";

describe("getRootDomain / tenantUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers NEXT_PUBLIC_ROOT_DOMAIN", () => {
    vi.stubEnv("NEXT_PUBLIC_ROOT_DOMAIN", "kalentr.com");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://other.example.com");
    expect(getRootDomain()).toBe("kalentr.com");
    expect(tenantUrl("alexmorgan")).toBe("https://alexmorgan.kalentr.com");
  });

  it("falls back to the host of NEXT_PUBLIC_APP_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_ROOT_DOMAIN", "");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://kalentr.com");
    expect(getRootDomain()).toBe("kalentr.com");
  });

  it("ignores a malformed NEXT_PUBLIC_APP_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_ROOT_DOMAIN", "");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "not a url");
    expect(getRootDomain()).toBe("localhost:3000");
  });

  it("defaults to localhost with http protocol", () => {
    vi.stubEnv("NEXT_PUBLIC_ROOT_DOMAIN", "");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    expect(tenantUrl("demo")).toBe("http://demo.localhost:3000");
  });
});
