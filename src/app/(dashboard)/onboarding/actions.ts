"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSubdomainAvailable, isValidSubdomain } from "@/lib/tenant";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const OnboardingSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  subdomain: z
    .string()
    .min(3, "Subdomain must be at least 3 characters")
    .max(63, "Subdomain must be at most 63 characters")
    .regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  timezone: z.string().default("UTC"),
});

export type OnboardingResult = {
  success: boolean;
  error?: string;
};

export async function createTenant(formData: FormData): Promise<OnboardingResult> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const rawData = {
    businessName: formData.get("businessName") as string,
    subdomain: (formData.get("subdomain") as string)?.toLowerCase(),
    description: formData.get("description") as string || undefined,
    timezone: (formData.get("timezone") as string) || "UTC",
  };

  const parsed = OnboardingSchema.safeParse(rawData);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors).flat()[0];
    return { success: false, error: firstError || "Invalid input" };
  }

  const { businessName, subdomain, description, timezone } = parsed.data;

  // Validate subdomain format
  if (!isValidSubdomain(subdomain)) {
    return { success: false, error: "Invalid subdomain format" };
  }

  // Check availability
  const available = await isSubdomainAvailable(subdomain);
  if (!available) {
    return { success: false, error: "This subdomain is already taken" };
  }

  // Check if user already has a tenant
  const existingTenant = await prisma.tenant.findUnique({
    where: { ownerId: session.user.id },
  });

  if (existingTenant) {
    return { success: false, error: "You already have a business set up" };
  }

  // Create tenant with default booking config
  await prisma.tenant.create({
    data: {
      businessName,
      subdomain,
      description,
      timezone,
      ownerId: session.user.id,
      bookingConfig: {
        create: {
          minAdvanceHours: 1,
          maxAdvanceDays: 30,
          slotDurationMinutes: 30,
          bufferMinutes: 0,
        },
      },
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function checkSubdomainAvailability(subdomain: string): Promise<{
  available: boolean;
  error?: string;
}> {
  if (!subdomain || subdomain.length < 3) {
    return { available: false, error: "Subdomain must be at least 3 characters" };
  }

  if (!isValidSubdomain(subdomain)) {
    return { available: false, error: "Invalid format" };
  }

  const available = await isSubdomainAvailable(subdomain.toLowerCase());
  return { available };
}
