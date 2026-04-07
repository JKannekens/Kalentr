"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantByOwner } from "@/lib/tenant";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ServiceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  category: z.string().optional(),
  duration: z.coerce.number().min(5, "Duration must be at least 5 minutes"),
  price: z.coerce.number().optional(),
  isActive: z.coerce.boolean().default(true),
});

export async function createService(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const tenant = await getTenantByOwner(session.user.id);
  if (!tenant) {
    return { success: false, error: "No business found" };
  }

  const rawData = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    category: (formData.get("category") as string) || undefined,
    duration: formData.get("duration") as string,
    price: (formData.get("price") as string) || undefined,
    isActive: formData.get("isActive") === "true",
  };

  const parsed = ServiceSchema.safeParse(rawData);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors).flat()[0];
    return { success: false, error: firstError || "Invalid input" };
  }

  await prisma.service.create({
    data: {
      tenantId: tenant.id,
      name: parsed.data.name,
      description: parsed.data.description,
      category: parsed.data.category || null,
      duration: parsed.data.duration,
      price: parsed.data.price ? Math.round(parsed.data.price * 100) : null,
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/dashboard/services");
  return { success: true };
}

export async function updateService(serviceId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const tenant = await getTenantByOwner(session.user.id);
  if (!tenant) {
    return { success: false, error: "No business found" };
  }

  // Verify ownership
  const service = await prisma.service.findFirst({
    where: { id: serviceId, tenantId: tenant.id },
  });

  if (!service) {
    return { success: false, error: "Service not found" };
  }

  const rawData = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    category: (formData.get("category") as string) || undefined,
    duration: formData.get("duration") as string,
    price: (formData.get("price") as string) || undefined,
    isActive: formData.get("isActive") === "true",
  };

  const parsed = ServiceSchema.safeParse(rawData);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors).flat()[0];
    return { success: false, error: firstError || "Invalid input" };
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      category: parsed.data.category || null,
      duration: parsed.data.duration,
      price: parsed.data.price ? Math.round(parsed.data.price * 100) : null,
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/dashboard/services");
  return { success: true };
}

export async function deleteService(serviceId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const tenant = await getTenantByOwner(session.user.id);
  if (!tenant) {
    return { success: false, error: "No business found" };
  }

  // Verify ownership
  const service = await prisma.service.findFirst({
    where: { id: serviceId, tenantId: tenant.id },
  });

  if (!service) {
    return { success: false, error: "Service not found" };
  }

  await prisma.service.delete({
    where: { id: serviceId },
  });

  revalidatePath("/dashboard/services");
  return { success: true };
}
