"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantByOwner } from "@/lib/tenant";
import { revalidatePath } from "next/cache";
import { AppointmentStatus } from "@prisma/client";

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const tenant = await getTenantByOwner(session.user.id);
  if (!tenant) {
    return { success: false, error: "No business found" };
  }

  // Verify ownership
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, tenantId: tenant.id },
  });

  if (!appointment) {
    return { success: false, error: "Appointment not found" };
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status,
      ...(status === "CANCELLED" ? { cancelledAt: new Date() } : {}),
    },
  });

  // TODO: Send email notification on status change

  revalidatePath("/dashboard/appointments");
  return { success: true };
}
