"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantByOwner } from "@/lib/tenant";
import { revalidatePath } from "next/cache";

export async function updateBranding(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const tenant = await getTenantByOwner(session.user.id);
  if (!tenant) return { success: false, error: "No business found" };

  const businessName = (formData.get("businessName") as string)?.trim();
  if (!businessName) return { success: false, error: "Business name is required" };

  const description = (formData.get("description") as string)?.trim() || null;
  const logo = (formData.get("logo") as string)?.trim() || null;
  const primaryColor = (formData.get("primaryColor") as string)?.trim() || "#3b82f6";

  // Validate logo URL if provided
  if (logo) {
    try {
      new URL(logo);
    } catch {
      return { success: false, error: "Logo must be a valid URL" };
    }
  }

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { businessName, description, logo, primaryColor },
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

  await prisma.bookingConfig.upsert({
    where: { tenantId: tenant.id },
    create: { tenantId: tenant.id, minAdvanceHours, maxAdvanceDays, bufferMinutes },
    update: { minAdvanceHours, maxAdvanceDays, bufferMinutes },
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

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { timezone },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}
