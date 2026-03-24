"use server";

import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function verifyEmail(token: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await prisma.user.findFirst({
    where: {
      verificationTokenHash: tokenHash,
      verificationTokenExpiry: { gt: new Date() },
      isVerified: false,
    },
  });
  if (!user) {
    return { success: false, error: "Invalid or expired verification link." };
  }
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationTokenHash: null,
      verificationTokenExpiry: null,
    },
  });
  return { success: true };
}
