"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";
import { emailVerificationEmail } from "@/lib/email-templates";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export type RegisterResult = {
  success: boolean;
  error?: string;
};

export async function register(formData: FormData): Promise<RegisterResult> {
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = RegisterSchema.safeParse(rawData);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors).flat()[0];
    return { success: false, error: firstError || "Invalid input" };
  }

  const { name, email, password } = parsed.data;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return {
      success: false,
      error: "An account with this email already exists",
    };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Generate verification token
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  // Create user (unverified)
  await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      verificationTokenHash: tokenHash,
      verificationTokenExpiry: expiry,
      isVerified: false,
    },
  });

  // Send verification email
  const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";
  const verificationUrl = `${APP_URL}/verify/${token}`;
  const html = emailVerificationEmail({
    userName: name,
    verificationUrl,
  });
  try {
    await sendEmail({ to: email, subject: "Verify your email", html });
  } catch (err) {
    // swallow email errors for user-facing flow
    console.error("Verification email error:", err);
  }

  return { success: true };
}
