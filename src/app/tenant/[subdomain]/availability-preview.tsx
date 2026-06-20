import { ChevronLeft, ChevronRight } from "lucide-react";

interface AvailabilityPreviewProps {
  primaryColor: string;
  availableWeekdays: number[];
  maxAdvanceDays: number;
  /** ISO string of the next bookable date, or null. */
  nextDate: string | null;
  slots: string[];
}

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

/**
 * Read-only availability snapshot shown next to the service list — mirrors the
 * marketing preview on the landing page. Highlights the days this business
 * takes bookings and the soonest open times.
 */
export function AvailabilityPreview({
  primaryColor,
  availableWeekdays,
  maxAdvanceDays,
  nextDate,
  slots,
}: AvailabilityPreviewProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(monthStart);

  const cells = buildMonthCells(monthStart);
  const availableSet = new Set(availableWeekdays);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + maxAdvanceDays);

  const next = nextDate ? new Date(nextDate) : null;
  const nextLabel = next
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }).format(next)
    : null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      {/* Month header */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">{monthLabel}</p>
        <div className="flex gap-1 text-gray-300">
          <ChevronLeft className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>

      {/* Weekday labels */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((d, i) => (
          <div
            key={i}
            className="py-1 text-center text-xs font-medium text-gray-400"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell.currentMonth) {
            return <div key={i} className="aspect-square" />;
          }
          const date = new Date(
            monthStart.getFullYear(),
            monthStart.getMonth(),
            cell.day
          );
          const isPast = date < today;
          const isOpen =
            !isPast && availableSet.has(date.getDay()) && date <= maxDate;
          const isNext = next != null && date.getTime() === next.getTime();

          return (
            <div
              key={i}
              style={
                isNext
                  ? { background: primaryColor, color: "#ffffff" }
                  : isOpen
                  ? { background: `${primaryColor}1a`, color: primaryColor }
                  : undefined
              }
              className={`flex aspect-square items-center justify-center rounded-lg text-xs font-medium ${
                isNext || isOpen ? "" : "text-gray-300"
              }`}
            >
              {cell.day}
            </div>
          );
        })}
      </div>

      {/* Open slots */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-gray-500">
          {nextLabel ? `Next available · ${nextLabel}` : "Availability"}
        </p>
        {slots.length > 0 ? (
          <div className="space-y-1.5">
            {slots.map((time) => (
              <div
                key={time}
                style={{ background: `${primaryColor}14` }}
                className="flex items-center justify-between rounded-lg px-3 py-1.5"
              >
                <span
                  className="text-xs font-medium"
                  style={{ color: primaryColor }}
                >
                  {time}
                </span>
                <span className="text-xs text-gray-400">Available</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">
            Pick a service to see open times.
          </p>
        )}
      </div>
    </div>
  );
}

function buildMonthCells(
  month: Date
): { day: number; currentMonth: boolean }[] {
  const year = month.getFullYear();
  const m = month.getMonth();
  // Convert JS Sunday-first (0-6) to Monday-first index for the grid.
  const firstDay = (new Date(year, m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, m + 1, 0).getDate();

  const cells: { day: number; currentMonth: boolean }[] = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: 0, currentMonth: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, currentMonth: true });

  return cells;
}
