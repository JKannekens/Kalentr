"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Trash2 } from "lucide-react";
import type { DateRange } from "react-day-picker";
import type { TimeOff } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addTimeOff, deleteTimeOff } from "./actions";

interface TimeOffFormProps {
  initialTimeOff: TimeOff[];
}

export function TimeOffForm({ initialTimeOff }: TimeOffFormProps) {
  const [entries, setEntries] = useState<TimeOff[]>(initialTimeOff);
  const [range, setRange] = useState<DateRange | undefined>();
  const [label, setLabel] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!range?.from) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("startDate", format(range.from, "yyyy-MM-dd"));
    formData.set("endDate", format(range.to ?? range.from, "yyyy-MM-dd"));
    formData.set("label", label);

    try {
      const result = await addTimeOff(formData);
      if (!result.success) {
        setError(result.error || "Failed to add");
      } else {
        setRange(undefined);
        setLabel("");
        setOpen(false);
        window.location.reload();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteTimeOff(id);
    if (result.success) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
        {entries.length === 0 ? (
          <p className="px-6 py-4 text-sm text-gray-500">No time off scheduled.</p>
        ) : (
          <ul className="divide-y dark:divide-gray-700">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <span className="text-sm font-medium">
                    {formatDate(entry.startDate)}
                    {!isSameDay(entry.startDate, entry.endDate) && (
                      <> &ndash; {formatDate(entry.endDate)}</>
                    )}
                  </span>
                  {entry.label && (
                    <span className="ml-2 text-sm text-gray-500">{entry.label}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(entry.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 px-6 py-4 space-y-3">
        <p className="text-sm font-medium">Add time off</p>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Date range</label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-64 justify-start text-left font-normal",
                    !range && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {range?.from ? (
                    range.to && !isSameDay(range.from, range.to) ? (
                      <>
                        {format(range.from, "MMM d, yyyy")} &ndash;{" "}
                        {format(range.to, "MMM d, yyyy")}
                      </>
                    ) : (
                      format(range.from, "MMM d, yyyy")
                    )
                  ) : (
                    "Pick a date or range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={setRange}
                  numberOfMonths={1}
                  disabled={{ before: new Date() }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Label (optional)</label>
            <input
              type="text"
              placeholder="e.g. Christmas, Vacation"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="rounded-md border px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 w-48 h-9"
            />
          </div>

          <Button onClick={handleAdd} disabled={loading || !range?.from}>
            {loading ? "Adding..." : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function isSameDay(a: Date, b: Date): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getUTCFullYear() === db.getUTCFullYear() &&
    da.getUTCMonth() === db.getUTCMonth() &&
    da.getUTCDate() === db.getUTCDate()
  );
}
