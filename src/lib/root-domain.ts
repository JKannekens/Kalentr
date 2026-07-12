/**
 * The root domain tenant subdomains hang off (e.g. "kalentr.com").
 * Prefers NEXT_PUBLIC_ROOT_DOMAIN, falls back to the host of
 * NEXT_PUBLIC_APP_URL so a missing var doesn't silently produce
 * localhost links in production.
 */
export function getRootDomain(): string {
  if (process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
    return process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      return new URL(appUrl).host;
    } catch {
      // fall through to the dev default
    }
  }
  return "localhost:3000";
}

/** Absolute URL of a tenant's booking site (http for localhost, else https). */
export function tenantUrl(subdomain: string): string {
  const rootDomain = getRootDomain();
  const protocol = rootDomain.includes("localhost") ? "http" : "https";
  return `${protocol}://${subdomain}.${rootDomain}`;
}
