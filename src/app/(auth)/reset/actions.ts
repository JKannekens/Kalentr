"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";

const ResetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export async function resetPassword(formData: FormData, token: string) {
  const raw = {
    password: formData.get("password") as string,
    confirm: formData.get("confirm") as string,
  };

  const parsed = ResetSchema.safeParse(raw);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors).flat()[0];
    return { success: false, error: firstError || "Invalid input" };
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetTokenHash: tokenHash,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    return { success: false, error: "Invalid or expired token" };
  }

  const hashed = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetTokenHash: null, resetTokenExpiry: null },
  });

  return { success: true };
}
