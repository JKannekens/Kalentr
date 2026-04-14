"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateBranding, updateBookingConfig, updateAccount } from "./actions";
import type { Tenant, BookingConfig } from "@prisma/client";

type Tab = "branding" | "booking" | "account";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Vancouver",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Amsterdam",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Rome",
  "Europe/Madrid",
  "Europe/Stockholm",
  "Europe/Warsaw",
  "Europe/Helsinki",
  "Europe/Istanbul",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
];

interface SettingsFormProps {
  tenant: Pick<Tenant, "businessName" | "description" | "logo" | "primaryColor" | "subdomain" | "timezone">;
  bookingConfig: BookingConfig | null;
}

function useFormState() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit(action: (fd: FormData) => Promise<{ success: boolean; error?: string }>, e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const result = await action(new FormData(e.currentTarget));
      if (!result.success) setError(result.error || "Failed to save");
      else setSuccess(true);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, success, submit };
}

function StatusMessages({ error, success }: { error: string | null; success: boolean }) {
  if (error) return (
    <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</div>
  );
  if (success) return (
    <div className="rounded-md bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">Saved successfully.</div>
  );
  return null;
}

export function SettingsForm({ tenant, bookingConfig }: SettingsFormProps) {
  const [tab, setTab] = useState<Tab>("branding");

  const branding = useFormState();
  const booking = useFormState();
  const account = useFormState();

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      tab === t
        ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400"
        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
    }`;

  return (
    <div className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
      {/* Tabs */}
      <div className="flex border-b dark:border-gray-700 px-6">
        <button type="button" className={tabClass("branding")} onClick={() => setTab("branding")}>Branding</button>
        <button type="button" className={tabClass("booking")} onClick={() => setTab("booking")}>Booking rules</button>
        <button type="button" className={tabClass("account")} onClick={() => setTab("account")}>Account</button>
      </div>

      <div className="p-6">
        {/* Branding */}
        {tab === "branding" && (
          <form onSubmit={(e) => branding.submit(updateBranding, e)} className="space-y-5 max-w-lg">
            <StatusMessages error={branding.error} success={branding.success} />

            <div>
              <label htmlFor="businessName" className="block text-sm font-medium">Business name</label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                required
                defaultValue={tenant.businessName}
                className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium">Tagline / description</label>
              <textarea
                id="description"
                name="description"
                rows={2}
                defaultValue={tenant.description ?? ""}
                placeholder="Shown on your microsite"
                className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label htmlFor="logo" className="block text-sm font-medium">Logo URL</label>
              <input
                id="logo"
                name="logo"
                type="url"
                defaultValue={tenant.logo ?? ""}
                placeholder="https://example.com/logo.png"
                className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
              />
              {tenant.logo && (
                <img src={tenant.logo} alt="Logo preview" className="mt-2 h-12 w-auto rounded object-contain" />
              )}
            </div>

            <div>
              <label htmlFor="primaryColor" className="block text-sm font-medium">Accent color</label>
              <div className="mt-1 flex items-center gap-3">
                <input
                  id="primaryColor"
                  name="primaryColor"
                  type="color"
                  defaultValue={tenant.primaryColor}
                  className="h-10 w-16 cursor-pointer rounded border p-1 dark:border-gray-600"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">Used for buttons and highlights on your microsite</span>
              </div>
            </div>

            <Button type="submit" disabled={branding.loading}>
              {branding.loading ? "Saving..." : "Save branding"}
            </Button>
          </form>
        )}

        {/* Booking rules */}
        {tab === "booking" && (
          <form onSubmit={(e) => booking.submit(updateBookingConfig, e)} className="space-y-5 max-w-lg">
            <StatusMessages error={booking.error} success={booking.success} />

            <div>
              <label htmlFor="minAdvanceHours" className="block text-sm font-medium">Minimum advance notice (hours)</label>
              <input
                id="minAdvanceHours"
                name="minAdvanceHours"
                type="number"
                min={0}
                max={72}
                defaultValue={bookingConfig?.minAdvanceHours ?? 1}
                className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <p className="mt-1 text-xs text-gray-500">Clients can&apos;t book within this many hours of the slot</p>
            </div>

            <div>
              <label htmlFor="maxAdvanceDays" className="block text-sm font-medium">Booking window (days ahead)</label>
              <input
                id="maxAdvanceDays"
                name="maxAdvanceDays"
                type="number"
                min={1}
                max={365}
                defaultValue={bookingConfig?.maxAdvanceDays ?? 30}
                className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <p className="mt-1 text-xs text-gray-500">How far in advance clients can book</p>
            </div>

            <div>
              <label htmlFor="bufferMinutes" className="block text-sm font-medium">Buffer between appointments (minutes)</label>
              <input
                id="bufferMinutes"
                name="bufferMinutes"
                type="number"
                min={0}
                max={120}
                step={5}
                defaultValue={bookingConfig?.bufferMinutes ?? 0}
                className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <p className="mt-1 text-xs text-gray-500">Gap added after each appointment before the next slot opens</p>
            </div>

            <Button type="submit" disabled={booking.loading}>
              {booking.loading ? "Saving..." : "Save booking rules"}
            </Button>
          </form>
        )}

        {/* Account */}
        {tab === "account" && (
          <form onSubmit={(e) => account.submit(updateAccount, e)} className="space-y-5 max-w-lg">
            <StatusMessages error={account.error} success={account.success} />

            <div>
              <label className="block text-sm font-medium">Subdomain</label>
              <div className="mt-1 flex items-center gap-2 rounded-md border px-3 py-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                <span className="text-gray-700 dark:text-gray-200 font-mono text-sm">{tenant.subdomain}</span>
                <span className="text-gray-400 text-sm">.kalentr.com</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Contact support to change your subdomain</p>
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium">Timezone</label>
              <select
                id="timezone"
                name="timezone"
                defaultValue={tenant.timezone}
                className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Used to display appointment times correctly</p>
            </div>

            <Button type="submit" disabled={account.loading}>
              {account.loading ? "Saving..." : "Save account"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
