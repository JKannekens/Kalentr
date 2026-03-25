"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createBooking, getAvailableSlots } from "./actions";
import type { Service, Availability, BookingConfig } from "@prisma/client";
import type { TenantInfo } from "@/lib/tenant";

interface BookingFormProps {
  service: Service;
  tenant: TenantInfo;
  availability: Availability[];
  bookingConfig: BookingConfig | null;
}

type Step = "date" | "time" | "details" | "confirm";

export function BookingForm({
  service,
  tenant,
  availability,
  bookingConfig,
}: BookingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + (bookingConfig?.maxAdvanceDays || 30));

  // Generate calendar dates
  const dates = generateDates(today, maxDate, availability);

  async function handleDateSelect(date: Date) {
    setSelectedDate(date);
    setSelectedTime(null);
    setLoadingSlots(true);
    setError(null);

    try {
      const result = await getAvailableSlots(
        tenant.id,
        service.id,
        date.toISOString().split("T")[0]
      );
      setSlots(result.slots);
      setStep("time");
    } catch {
      setError("Failed to load available times");
    } finally {
      setLoadingSlots(false);
    }
  }

  function handleTimeSelect(time: string) {
    setSelectedTime(time);
    setStep("details");
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("serviceId", service.id);
    formData.set("date", selectedDate.toISOString().split("T")[0]);
    formData.set("time", selectedTime);

    try {
      const result = await createBooking(formData);
      if (!result.success) {
        setError(result.error || "Booking failed");
      } else {
        setStep("confirm");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "confirm") {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You&apos;ll receive a confirmation email shortly.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <p className="font-medium">{service.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedDate?.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}{" "}
            at {selectedTime}
          </p>
        </div>
        <Button onClick={() => router.push("/")}>Book Another</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <span className={step === "date" ? "font-medium" : "text-gray-400"}>
          1. Date
        </span>
        <span className="text-gray-300">→</span>
        <span className={step === "time" ? "font-medium" : "text-gray-400"}>
          2. Time
        </span>
        <span className="text-gray-300">→</span>
        <span className={step === "details" ? "font-medium" : "text-gray-400"}>
          3. Details
        </span>
      </div>

      {/* Date selection */}
      {step === "date" && (
        <div>
          <h3 className="text-lg font-medium mb-4">Select a Date</h3>
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            {dates.map((dateInfo, i) => (
              <button
                key={i}
                disabled={!dateInfo.available}
                onClick={() => dateInfo.available && handleDateSelect(dateInfo.date)}
                className={`
                  aspect-square rounded-lg text-sm
                  ${!dateInfo.available
                    ? "text-gray-300 cursor-not-allowed"
                    : "hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
                  }
                  ${dateInfo.isToday ? "ring-1 ring-blue-500" : ""}
                `}
              >
                {dateInfo.date.getDate()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Time selection */}
      {step === "time" && selectedDate && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              Available Times for{" "}
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setStep("date")}>
              Change Date
            </Button>
          </div>
          
          {loadingSlots ? (
            <p className="text-gray-500">Loading available times...</p>
          ) : slots.length === 0 ? (
            <p className="text-gray-500">No available times for this date.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {slots.map((time) => (
                <button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className="rounded-md border px-3 py-2 text-sm hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  {time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Client details form */}
      {step === "details" && selectedDate && selectedTime && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Your Details</h3>
            <Button variant="ghost" size="sm" onClick={() => setStep("time")}>
              Change Time
            </Button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <p className="font-medium">{service.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}{" "}
              at {selectedTime}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium">
                Name
              </label>
              <input
                id="clientName"
                name="clientName"
                type="text"
                required
                className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label htmlFor="clientEmail" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="clientEmail"
                name="clientEmail"
                type="email"
                required
                className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label htmlFor="clientPhone" className="block text-sm font-medium">
                Phone (optional)
              </label>
              <input
                id="clientPhone"
                name="clientPhone"
                type="tel"
                className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Booking..." : "Confirm Booking"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

function generateDates(
  start: Date,
  end: Date,
  availability: Availability[]
): { date: Date; available: boolean; isToday: boolean }[] {
  const dates: { date: Date; available: boolean; isToday: boolean }[] = [];
  const availableDays = new Set(
    availability.filter((a) => a.isActive).map((a) => a.dayOfWeek)
  );

  // Start from the beginning of the week
  const current = new Date(start);
  current.setDate(current.getDate() - current.getDay());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate 5 weeks of dates
  for (let i = 0; i < 35; i++) {
    const date = new Date(current);
    date.setDate(current.getDate() + i);

    const isPast = date < today;
    const isAvailableDay = availableDays.has(date.getDay());
    const isWithinRange = date >= start && date <= end;

    dates.push({
      date,
      available: !isPast && isAvailableDay && isWithinRange,
      isToday: date.getTime() === today.getTime(),
    });
  }

  return dates;
}
