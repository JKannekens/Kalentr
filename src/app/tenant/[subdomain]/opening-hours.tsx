import { Clock } from "lucide-react";
import { formatTime } from "@/lib/format-time";

interface AvailabilityWindow {
  dayOfWeek: number; // 0 = Sunday … 6 = Saturday
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

interface OpeningHoursProps {
  primaryColor: string;
  use24Hour: boolean;
  availability: AvailabilityWindow[];
}

// Monday-first display order with their JS getDay() value.
const DAYS: { label: string; dow: number }[] = [
  { label: "Monday", dow: 1 },
  { label: "Tuesday", dow: 2 },
  { label: "Wednesday", dow: 3 },
  { label: "Thursday", dow: 4 },
  { label: "Friday", dow: 5 },
  { label: "Saturday", dow: 6 },
  { label: "Sunday", dow: 0 },
];

/**
 * Read-only weekly hours so clients can see when this business takes bookings.
 * Purely informational — booking itself happens by picking a service.
 */
export function OpeningHours({ primaryColor, use24Hour, availability }: OpeningHoursProps) {
  const openDays = new Set(availability.map((a) => a.dayOfWeek));

  // Next day (within two weeks) that has availability, for a quick highlight.
  let nextOpenLabel: string | null = null;
  if (openDays.size > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let offset = 0; offset < 14; offset++) {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      if (openDays.has(date.getDay())) {
        nextOpenLabel =
          offset === 0
            ? "Today"
            : offset === 1
              ? "Tomorrow"
              : new Intl.DateTimeFormat("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                }).format(date);
        break;
      }
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-900">Opening hours</h2>
      </div>

      {openDays.size === 0 ? (
        <p className="text-sm text-gray-500">
          Hours haven&apos;t been set yet. Pick a service to see available times.
        </p>
      ) : (
        <>
          <dl className="space-y-2">
            {DAYS.map(({ label, dow }) => {
              const windows = availability
                .filter((a) => a.dayOfWeek === dow)
                .map((a) => `${formatTime(a.startTime, use24Hour)} – ${formatTime(a.endTime, use24Hour)}`);
              const isOpen = windows.length > 0;
              return (
                <div
                  key={dow}
                  className="flex items-baseline justify-between gap-3 text-sm"
                >
                  <dt className="text-gray-500">{label}</dt>
                  <dd
                    className={`text-right ${
                      isOpen ? "font-medium text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {isOpen ? windows.join(", ") : "Closed"}
                  </dd>
                </div>
              );
            })}
          </dl>

          {nextOpenLabel && (
            <div
              className="mt-4 rounded-xl px-3 py-2 text-xs font-medium"
              style={{ background: `${primaryColor}14`, color: primaryColor }}
            >
              Next available · {nextOpenLabel}
            </div>
          )}

          <p className="mt-4 text-xs leading-relaxed text-gray-400">
            Choose a service to see open time slots and book.
          </p>
        </>
      )}
    </div>
  );
}
