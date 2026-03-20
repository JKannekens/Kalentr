import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { cache } from "react";

export type TenantInfo = {
  id: string;
  subdomain: string;
  customDomain: string | null;
  businessName: string;
  description: string | null;
  logo: string | null;
  primaryColor: string;
  timezone: string;
};

/**
 * Get tenant from request headers (set by middleware)
 */
export const getTenantFromHeaders = cache(async (): Promise<TenantInfo | null> => {
  const headersList = await headers();
  const subdomain = headersList.get("x-tenant-subdomain");
  const isCustomDomain = headersList.get("x-is-custom-domain") === "true";
  
  if (!subdomain) {
    return null;
  }
  
  return getTenant(subdomain, isCustomDomain);
});

/**
 * Get tenant by subdomain or custom domain
 */
export const getTenant = cache(async (
  identifier: string,
  isCustomDomain: boolean = false
): Promise<TenantInfo | null> => {
  const tenant = await prisma.tenant.findFirst({
    where: isCustomDomain
      ? { customDomain: identifier }
      : { subdomain: identifier },
    select: {
      id: true,
      subdomain: true,
      customDomain: true,
      businessName: true,
      description: true,
      logo: true,
      primaryColor: true,
      timezone: true,
    },
  });
  
  return tenant;
});

/**
 * Get tenant by owner user ID
 */
export const getTenantByOwner = cache(async (
  ownerId: string
): Promise<TenantInfo | null> => {
  const tenant = await prisma.tenant.findUnique({
    where: { ownerId },
    select: {
      id: true,
      subdomain: true,
      customDomain: true,
      businessName: true,
      description: true,
      logo: true,
      primaryColor: true,
      timezone: true,
    },
  });
  
  return tenant;
});

/**
 * Check if subdomain is available
 */
export async function isSubdomainAvailable(subdomain: string): Promise<boolean> {
  // Reserved subdomains
  const reserved = [
    "www",
    "app",
    "api",
    "admin",
    "dashboard",
    "login",
    "register",
    "signup",
    "auth",
    "help",
    "support",
    "docs",
    "blog",
    "mail",
    "email",
  ];
  
  if (reserved.includes(subdomain.toLowerCase())) {
    return false;
  }
  
  const existing = await prisma.tenant.findUnique({
    where: { subdomain: subdomain.toLowerCase() },
    select: { id: true },
  });
  
  return !existing;
}

/**
 * Validate subdomain format
 */
export function isValidSubdomain(subdomain: string): boolean {
  // 3-63 characters, alphanumeric and hyphens, can't start/end with hyphen
  const regex = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;
  return regex.test(subdomain.toLowerCase());
}
