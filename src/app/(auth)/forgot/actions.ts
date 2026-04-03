"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { passwordResetEmail } from "@/lib/email-templates";
import { z } from "zod";
import crypto from "crypto";

const ForgotSchema = z.object({
  email: z.email("Invalid email address"),
});

export async function forgotPassword(formData: FormData) {
  const raw = { email: formData.get("email") as string };
  const parsed = ForgotSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: "Invalid email" };
  }

  const email = parsed.data.email.toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to avoid account enumeration
  if (!user) {
    return { success: true };
  }

  // Generate token and store hash
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetTokenHash: tokenHash, resetTokenExpiry: expiry },
  });

  const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";
  const resetUrl = `${APP_URL}/reset/${token}`;

  const html = passwordResetEmail({
    userName: user.name || user.email,
    resetUrl,
  });

  try {
    await sendEmail({ to: user.email, subject: "Reset your password", html });
  } catch (err) {
    // swallow email errors for user-facing flow
    console.error("Forgot password email error:", err);
  }

  return { success: true };
}
