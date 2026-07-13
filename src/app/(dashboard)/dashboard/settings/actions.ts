"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantByOwner } from "@/lib/tenant";
import { revalidatePath } from "next/cache";

const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_LOGO_BYTES = 512 * 1024; // 512KB — stored as a data URI in the DB

export async function updateBranding(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const tenant = await getTenantByOwner(session.user.id);
  if (!tenant) return { success: false, error: "No business found" };

  const businessName = (formData.get("businessName") as string)?.trim();
  if (!businessName) return { success: false, error: "Business name is required" };

  const description = (formData.get("description") as string)?.trim() || null;
  const location = (formData.get("location") as string)?.trim() || null;
  const primaryColor = (formData.get("primaryColor") as string)?.trim() || "#3b82f6";

  // Logo: keep existing unless a new file is uploaded or removal is requested
  let logo = tenant.logo;
  if (formData.get("removeLogo") === "true") {
    logo = null;
  }
  const logoFile = formData.get("logo");
  if (logoFile instanceof File && logoFile.size > 0) {
    if (!ALLOWED_LOGO_TYPES.includes(logoFile.type)) {
      return { success: false, error: "Logo must be a PNG, JPG, or WebP image" };
    }
    if (logoFile.size > MAX_LOGO_BYTES) {
      return { success: false, error: "Logo must be smaller than 512KB" };
    }
    const buffer = Buffer.from(await logoFile.arrayBuffer());
    logo = `data:${logoFile.type};base64,${buffer.toString("base64")}`;
  }

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { businessName, description, logo, location, primaryColor },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateBookingConfig(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const tenant = await getTenantByOwner(session.user.id);
  if (!tenant) return { success: false, error: "No business found" };

  const minAdvanceHours = Number(formData.get("minAdvanceHours")) || 1;
  const maxAdvanceDays = Number(formData.get("maxAdvanceDays")) || 30;
  const bufferMinutes = Number(formData.get("bufferMinutes")) || 0;
  const requireApproval = formData.get("requireApproval") === "on";
  const cancellationNoticeHours = Math.max(0, Number(formData.get("cancellationNoticeHours")) || 0);

  await prisma.bookingConfig.upsert({
    where: { tenantId: tenant.id },
    create: { tenantId: tenant.id, minAdvanceHours, maxAdvanceDays, bufferMinutes, requireApproval, cancellationNoticeHours },
    update: { minAdvanceHours, maxAdvanceDays, bufferMinutes, requireApproval, cancellationNoticeHours },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateAccount(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const tenant = await getTenantByOwner(session.user.id);
  if (!tenant) return { success: false, error: "No business found" };

  const timezone = (formData.get("timezone") as string)?.trim() || "UTC";
  const use24Hour = formData.get("timeFormat") === "24";

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { timezone, use24Hour },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateCustomDomain(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const tenant = await getTenantByOwner(session.user.id);
  if (!tenant) return { success: false, error: "No business found" };

  const raw = (formData.get("customDomain") as string)?.trim().toLowerCase() || "";
  const customDomain = raw || null;

  if (customDomain) {
    // Basic domain format validation (no protocol, no path, no port)
    const domainRegex = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
    if (!domainRegex.test(customDomain)) {
      return { success: false, error: "Enter a valid domain, e.g. bookings.yourdomain.com" };
    }

    // Check not already taken by another tenant
    const existing = await prisma.tenant.findFirst({
      where: { customDomain, NOT: { id: tenant.id } },
    });
    if (existing) {
      return { success: false, error: "This domain is already in use" };
    }
  }

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { customDomain },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}
