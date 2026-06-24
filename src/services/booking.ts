import { prisma } from "@/lib/prisma";
import { generateSlotInstants, type SlotInstant } from "@/lib/generate-slots";

interface GetOpenSlotsInput {
  tenantId: string;
  serviceDuration: number; // minutes
  date: string; // YYYY-MM-DD
  now?: Date; // injectable for testing
}

/**
 * The single source of truth for what slots a client may book on a given day.
 * Used by both the slot picker (read) and `createBooking` (write) so the two
 * can never disagree. Enforces the weekly availability, per-booking buffer,
 * minimum advance notice, and the maximum booking window.
 */
export async function getOpenSlots({
  tenantId,
  serviceDuration,
  date,
  now = new Date(),
}: GetOpenSlotsInput): Promise<SlotInstant[]> {
  const dayOfWeek = new Date(date + "T00:00:00").getDay();

  const [availability, bookingConfig] = await Promise.all([
    prisma.availability.findMany({
      where: { tenantId, dayOfWeek, isActive: true },
    }),
    prisma.bookingConfig.findUnique({ where: { tenantId } }),
  ]);

  if (availability.length === 0) return [];

  const slotDuration = bookingConfig?.slotDurationMinutes || 30;
  const bufferMinutes = bookingConfig?.bufferMinutes || 0;
  const minAdvanceHours = bookingConfig?.minAdvanceHours ?? 0;
  const maxAdvanceDays = bookingConfig?.maxAdvanceDays ?? 365;

  const startOfDay = new Date(date + "T00:00:00");
  const endOfDay = new Date(date + "T23:59:59");

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      tenantId,
      startTime: { gte: startOfDay },
      endTime: { lte: endOfDay },
      status: { notIn: ["CANCELLED"] },
    },
    select: { startTime: true, endTime: true },
  });

  // Minimum advance notice: treat anything sooner than this as already past.
  const earliest = new Date(now.getTime() + minAdvanceHours * 3_600_000);
  // Maximum booking window.
  const latest = new Date(now.getTime() + maxAdvanceDays * 86_400_000);

  return generateSlotInstants({
    date,
    availability,
    existingAppointments,
    serviceDuration,
    slotDuration,
    bufferMinutes,
    now: earliest,
  }).filter((slot) => slot.start <= latest);
}
