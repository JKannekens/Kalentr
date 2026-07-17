"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { updateBranding, updateBookingConfig, updateAccount, updateCustomDomain } from "./actions";
import type { Tenant, BookingConfig } from "@prisma/client";

type Tab = "branding" | "booking" | "account" | "domain";

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
  tenant: Pick<Tenant, "businessName" | "description" | "logo" | "location" | "primaryColor" | "subdomain" | "timezone" | "use24Hour" | "customDomain">;
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
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);

  const branding = useFormState();
  const booking = useFormState();
  const account = useFormState();
  const domain = useFormState();

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
        <button type="button" className={tabClass("domain")} onClick={() => setTab("domain")}>Custom domain</button>
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
              <label htmlFor="location" className="block text-sm font-medium">Location</label>
              <input
                id="location"
                name="location"
                type="text"
                defaultValue={tenant.location ?? ""}
                placeholder="e.g. 12 Main St, Amsterdam — leave blank if remote"
                className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <p className="mt-1 text-xs text-gray-500">Shown on your microsite and booking confirmations. Leave empty if you work remotely.</p>
            </div>

            <div>
              <label htmlFor="logo" className="block text-sm font-medium">Logo</label>
              <input
                id="logo"
                name="logo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setLogoPreview(file ? URL.createObjectURL(file) : null);
                  setRemoveLogo(false);
                }}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900/30 dark:file:text-emerald-400"
              />
              <p className="mt-1 text-xs text-gray-500">PNG, JPG, or WebP — max 512KB. Leave empty to keep your current logo.</p>
              <input type="hidden" name="removeLogo" value={removeLogo ? "true" : "false"} />
              {(logoPreview || (tenant.logo && !removeLogo)) && (
                <div className="mt-2 flex items-center gap-3">
                  {/* Data URI / object URL preview — next/image can't optimize these. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoPreview ?? tenant.logo ?? ""} alt="Logo preview" className="h-12 w-auto rounded object-contain" />
                  {tenant.logo && !logoPreview && (
                    <button
                      type="button"
                      onClick={() => setRemoveLogo(true)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove logo
                    </button>
                  )}
                </div>
              )}
              {removeLogo && (
                <p className="mt-2 text-xs text-amber-600">Logo will be removed when you save.</p>
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

            <div>
              <label htmlFor="cancellationNoticeHours" className="block text-sm font-medium">Cancellation notice (hours)</label>
              <input
                id="cancellationNoticeHours"
                name="cancellationNoticeHours"
                type="number"
                min={0}
                max={168}
                defaultValue={bookingConfig?.cancellationNoticeHours ?? 1}
                className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <p className="mt-1 text-xs text-gray-500">Clients can&apos;t cancel within this many hours of the slot (0 = allow anytime)</p>
            </div>

            <label htmlFor="requireApproval" className="flex items-start gap-3 rounded-md border px-3 py-3 cursor-pointer dark:border-gray-600">
              <input
                id="requireApproval"
                name="requireApproval"
                type="checkbox"
                defaultChecked={bookingConfig?.requireApproval ?? false}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                <span className="block text-sm font-medium">Require manual approval</span>
                <span className="block text-xs text-gray-500">New bookings stay pending until you confirm them. Off = bookings are confirmed instantly.</span>
              </span>
            </label>

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
              <NativeSelect
                id="timezone"
                name="timezone"
                defaultValue={tenant.timezone}
                wrapperClassName="mt-1"
                className="block w-full rounded-md border px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
                ))}
              </NativeSelect>
              <p className="mt-1 text-xs text-gray-500">Used to display appointment times correctly</p>
            </div>

            <div>
              <label htmlFor="timeFormat" className="block text-sm font-medium">Time format</label>
              <NativeSelect
                id="timeFormat"
                name="timeFormat"
                defaultValue={tenant.use24Hour ? "24" : "12"}
                wrapperClassName="mt-1"
                className="block w-full rounded-md border px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="12">12-hour (1:30 PM)</option>
                <option value="24">24-hour (13:30)</option>
              </NativeSelect>
              <p className="mt-1 text-xs text-gray-500">How times appear on your microsite, emails, and dashboard</p>
            </div>

            <Button type="submit" disabled={account.loading}>
              {account.loading ? "Saving..." : "Save account"}
            </Button>
          </form>
        )}

        {/* Custom domain */}
        {tab === "domain" && (
          <form id="domain-form" onSubmit={(e) => domain.submit(updateCustomDomain, e)} className="space-y-5 max-w-lg">
            <StatusMessages error={domain.error} success={domain.success} />

            <div>
              <label htmlFor="customDomain" className="block text-sm font-medium">Custom domain</label>
              <input
                id="customDomain"
                name="customDomain"
                type="text"
                defaultValue={tenant.customDomain ?? ""}
                placeholder="bookings.yourdomain.com"
                className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 font-mono text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Leave blank to use your default subdomain.</p>
            </div>

            {tenant.customDomain ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4 text-sm dark:bg-emerald-950/30 dark:border-emerald-900">
                <p className="font-medium text-emerald-700 dark:text-emerald-400 mb-2">Domain connected</p>
                <p className="text-emerald-600 dark:text-emerald-500 font-mono">{tenant.customDomain}</p>
              </div>
            ) : (
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm dark:bg-gray-800 dark:border-gray-700">
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">How to connect your domain</p>
                <ol className="space-y-1 text-gray-500 dark:text-gray-400 list-decimal list-inside">
                  <li>Go to your domain registrar&apos;s DNS settings</li>
                  <li>Add a <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">CNAME</span> record pointing to <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{tenant.subdomain}.kalentr.com</span></li>
                  <li>Enter your custom domain above and save</li>
                </ol>
                <p className="mt-2 text-xs text-gray-400">DNS changes can take up to 48 hours to propagate.</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={domain.loading}>
                {domain.loading ? "Saving..." : "Save domain"}
              </Button>
              {tenant.customDomain && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={domain.loading}
                  onClick={() => {
                    const input = document.querySelector<HTMLInputElement>("#customDomain");
                    if (input) { input.value = ""; }
                    document.getElementById("domain-form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                  }}
                >
                  Remove domain
                </Button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
