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

export function generateSlots({
  date,
  availability,
  existingAppointments,
  serviceDuration,
  slotDuration,
  bufferMinutes,
  now = new Date(),
}: GenerateSlotsInput): string[] {
  const slots: string[] = [];

  for (const avail of availability) {
    const [startHour, startMin] = avail.startTime.split(":").map(Number);
    const [endHour, endMin] = avail.endTime.split(":").map(Number);

    let current = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;

    while (current + serviceDuration <= end) {
      const slotStart = new Date(date);
      slotStart.setHours(Math.floor(current / 60), current % 60, 0, 0);

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
        slots.push(
          slotStart.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        );
      }

      current += slotDuration;
    }
  }

  return slots;
}
