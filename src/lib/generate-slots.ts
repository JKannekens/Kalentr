export interface AvailabilityWindow {
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
}

export interface BookedSlot {
  startTime: Date;
  endTime: Date;
}

export interface GenerateSlotsInput {
  date: string; // YYYY-MM-DD
  availability: AvailabilityWindow[];
  existingAppointments: BookedSlot[];
  serviceDuration: number; // minutes
  slotDuration: number;    // minutes — step between slot starts
  bufferMinutes: number;
  now?: Date;              // injectable for testing
}

export interface SlotInstant {
  /** Canonical display label, e.g. "9:00 AM". */
  label: string;
  /** Exact start of the slot. */
  start: Date;
}

function buildStart(date: string, hours: number, minutes: number): Date {
  const start = new Date(date);
  start.setHours(hours, minutes, 0, 0);
  return start;
}

function formatLabel(hours: number, minutes: number): string {
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

/**
 * Generate the available slots for a day as `{ label, start }` pairs. The
 * label is the canonical value used everywhere (and what `createBooking`
 * validates against); the start is the exact instant to persist.
 */
export function generateSlotInstants({
  date,
  availability,
  existingAppointments,
  serviceDuration,
  slotDuration,
  bufferMinutes,
  now = new Date(),
}: GenerateSlotsInput): SlotInstant[] {
  const slots: SlotInstant[] = [];

  for (const avail of availability) {
    const [startHour, startMin] = avail.startTime.split(":").map(Number);
    const [endHour, endMin] = avail.endTime.split(":").map(Number);

    let current = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;

    while (current + serviceDuration <= end) {
      const hours = Math.floor(current / 60);
      const minutes = current % 60;
      const slotStart = buildStart(date, hours, minutes);

      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + serviceDuration);

      if (slotStart <= now) {
        current += slotDuration;
        continue;
      }

      const hasConflict = existingAppointments.some((apt) => {
        const aptStart = new Date(apt.startTime);
        const aptEnd = new Date(apt.endTime);
        aptStart.setMinutes(aptStart.getMinutes() - bufferMinutes);
        aptEnd.setMinutes(aptEnd.getMinutes() + bufferMinutes);
        return slotStart < aptEnd && slotEnd > aptStart;
      });

      if (!hasConflict) {
        slots.push({ label: formatLabel(hours, minutes), start: slotStart });
      }

      current += slotDuration;
    }
  }

  return slots;
}

/** Convenience wrapper returning only the display labels. */
export function generateSlots(input: GenerateSlotsInput): string[] {
  return generateSlotInstants(input).map((s) => s.label);
}
