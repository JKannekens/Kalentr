import { describe, it, expect, afterEach, vi } from "vitest";
import { getEnabledSsoProviders } from "@/lib/sso";

describe("getEnabledSsoProviders", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function stubEnv(vars: Record<string, string>) {
    // Clear all SSO vars first, then apply the given ones.
    for (const key of [
      "AUTH_GOOGLE_ID",
      "AUTH_GOOGLE_SECRET",
      "AUTH_MICROSOFT_ENTRA_ID_ID",
      "AUTH_MICROSOFT_ENTRA_ID_SECRET",
    ]) {
      vi.stubEnv(key, vars[key] ?? "");
    }
  }

  it("returns nothing when no provider is configured", () => {
    stubEnv({});
    expect(getEnabledSsoProviders()).toEqual([]);
  });

  it("returns google when both Google vars are set", () => {
    stubEnv({ AUTH_GOOGLE_ID: "id", AUTH_GOOGLE_SECRET: "secret" });
    expect(getEnabledSsoProviders()).toEqual(["google"]);
  });

  it("returns microsoft when both Microsoft vars are set", () => {
    stubEnv({
      AUTH_MICROSOFT_ENTRA_ID_ID: "id",
      AUTH_MICROSOFT_ENTRA_ID_SECRET: "secret",
    });
    expect(getEnabledSsoProviders()).toEqual(["microsoft-entra-id"]);
  });

  it("returns both when fully configured", () => {
    stubEnv({
      AUTH_GOOGLE_ID: "id",
      AUTH_GOOGLE_SECRET: "secret",
      AUTH_MICROSOFT_ENTRA_ID_ID: "id",
      AUTH_MICROSOFT_ENTRA_ID_SECRET: "secret",
    });
    expect(getEnabledSsoProviders()).toEqual(["google", "microsoft-entra-id"]);
  });

  it("requires the secret, not just the client id", () => {
    stubEnv({ AUTH_GOOGLE_ID: "id" });
    expect(getEnabledSsoProviders()).toEqual([]);
  });
});
