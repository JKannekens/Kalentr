"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantByOwner } from "@/lib/tenant";
import { revalidatePath } from "next/cache";

export async function updateAvailability(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const tenant = await getTenantByOwner(session.user.id);
  if (!tenant) {
    return { success: false, error: "No business found" };
  }

  // Parse form data for each day (always write all days so saved state is deterministic)
  const updates: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[] = [];

  for (let i = 0; i < 7; i++) {
    const isActive = formData.get(`day-${i}-active`) === "on";
    const startTime = (formData.get(`day-${i}-start`) as string) || "09:00";
    const endTime = (formData.get(`day-${i}-end`) as string) || "17:00";

    updates.push({
      dayOfWeek: i,
      startTime,
      endTime,
      isActive,
    });
  }

  // Delete existing availability
  await prisma.availability.deleteMany({
    where: { tenantId: tenant.id },
  });

  // Create new availability
  if (updates.length > 0) {
    await prisma.availability.createMany({
      data: updates.map((u) => ({
        tenantId: tenant.id,
        ...u,
      })),
    });
  }

  revalidatePath("/dashboard/availability");
  return { success: true };
}

export async function addTimeOff(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const tenant = await getTenantByOwner(session.user.id);
  if (!tenant) {
    return { success: false, error: "No business found" };
  }

  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const label = (formData.get("label") as string) || null;

  if (!startDate || !endDate) {
    return { success: false, error: "Start and end date are required" };
  }

  const start = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T00:00:00Z");

  if (end < start) {
    return { success: false, error: "End date must be on or after start date" };
  }

  await prisma.timeOff.create({
    data: {
      tenantId: tenant.id,
      startDate: start,
      endDate: end,
      label: label?.trim() || null,
    },
  });

  revalidatePath("/dashboard/availability");
  return { success: true };
}

export async function deleteTimeOff(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const tenant = await getTenantByOwner(session.user.id);
  if (!tenant) {
    return { success: false, error: "No business found" };
  }

  await prisma.timeOff.deleteMany({
    where: { id, tenantId: tenant.id },
  });

  revalidatePath("/dashboard/availability");
  return { success: true };
}

export async function getAvailability() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const tenant = await getTenantByOwner(session.user.id);
  if (!tenant) {
    return [];
  }

  return prisma.availability.findMany({
    where: { tenantId: tenant.id },
    orderBy: { dayOfWeek: "asc" },
  });
}
