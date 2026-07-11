export type SsoProviderId = "google" | "microsoft-entra-id";

/**
 * Which SSO providers are configured via env. Server-only — pages pass the
 * result to the auth forms so buttons only render for working providers.
 */
export function getEnabledSsoProviders(): SsoProviderId[] {
  const enabled: SsoProviderId[] = [];
  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    enabled.push("google");
  }
  if (
    process.env.AUTH_MICROSOFT_ENTRA_ID_ID &&
    process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET
  ) {
    enabled.push("microsoft-entra-id");
  }
  return enabled;
}
