"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateAvailability } from "./actions";
import type { Availability } from "@prisma/client";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TIME_OPTIONS = generateTimeOptions();

function generateTimeOptions() {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, "0");
      const min = m.toString().padStart(2, "0");
      options.push(`${hour}:${min}`);
    }
  }
  return options;
}

interface AvailabilityFormProps {
  initialAvailability: Map<number, Availability>;
}

export function AvailabilityForm({ initialAvailability }: AvailabilityFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [schedule, setSchedule] = useState(() => {
    return DAYS.map((_, i) => {
      const existing = initialAvailability.get(i);
      return {
        dayOfWeek: i,
        isActive: existing?.isActive ?? (i >= 1 && i <= 5), // Default Mon-Fri
        startTime: existing?.startTime ?? "09:00",
        endTime: existing?.endTime ?? "17:00",
      };
    });
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    schedule.forEach((day) => {
      if (day.isActive) {
        formData.set(`day-${day.dayOfWeek}-active`, "on");
        formData.set(`day-${day.dayOfWeek}-start`, day.startTime);
        formData.set(`day-${day.dayOfWeek}-end`, day.endTime);
      }
    });

    try {
      const result = await updateAvailability(formData);
      if (!result.success) {
        setError(result.error || "Failed to save");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function updateDay(dayOfWeek: number, updates: Partial<typeof schedule[0]>) {
    setSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, ...updates } : day
      )
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
        {error && (
          <div className="m-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="m-4 rounded-md bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
            Availability saved successfully!
          </div>
        )}

        <div className="divide-y dark:divide-gray-700">
          {schedule.map((day) => (
            <div
              key={day.dayOfWeek}
              className="flex items-center gap-4 px-6 py-4"
            >
              <label className="flex items-center gap-3 w-32">
                <input
                  type="checkbox"
                  checked={day.isActive}
                  onChange={(e) =>
                    updateDay(day.dayOfWeek, { isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">{DAYS[day.dayOfWeek]}</span>
              </label>

              {day.isActive ? (
                <div className="flex items-center gap-2">
                  <select
                    value={day.startTime}
                    onChange={(e) =>
                      updateDay(day.dayOfWeek, { startTime: e.target.value })
                    }
                    className="rounded-md border px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600"
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {formatTime(time)}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-500">to</span>
                  <select
                    value={day.endTime}
                    onChange={(e) =>
                      updateDay(day.dayOfWeek, { endTime: e.target.value })
                    }
                    className="rounded-md border px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600"
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {formatTime(time)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="text-sm text-gray-500">Unavailable</span>
              )}
            </div>
          ))}
        </div>

        <div className="border-t px-6 py-4 dark:border-gray-700">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Availability"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}
