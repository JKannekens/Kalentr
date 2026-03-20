"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createTenant, checkSubdomainAvailability } from "./actions";

export default function OnboardingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [subdomain, setSubdomain] = useState("");
  const [subdomainStatus, setSubdomainStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    error?: string;
  }>({ checking: false, available: null });

  // Debounced subdomain availability check
  useEffect(() => {
    if (subdomain.length < 3) {
      setSubdomainStatus({ checking: false, available: null });
      return;
    }

    const timer = setTimeout(async () => {
      setSubdomainStatus({ checking: true, available: null });
      const result = await checkSubdomainAvailability(subdomain);
      setSubdomainStatus({
        checking: false,
        available: result.available,
        error: result.error,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [subdomain]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await createTenant(formData);

      if (!result.success) {
        setError(result.error || "Failed to create business");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kalentr.com";

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Set up your business</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create your booking microsite in just a few steps
        </p>
      </div>

      <div className="rounded-lg border bg-white p-8 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="businessName" className="block text-sm font-medium">
              Business Name
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              required
              placeholder="Acme Consulting"
              className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="subdomain" className="block text-sm font-medium">
              Your booking URL
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                id="subdomain"
                name="subdomain"
                type="text"
                required
                placeholder="acme"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="block w-full rounded-l-md border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="inline-flex items-center rounded-r-md border border-l-0 bg-gray-50 px-3 text-sm text-gray-500 dark:bg-gray-600 dark:border-gray-600">
                .{rootDomain}
              </span>
            </div>
            <div className="mt-1 h-5">
              {subdomainStatus.checking && (
                <p className="text-xs text-gray-500">Checking availability...</p>
              )}
              {!subdomainStatus.checking && subdomainStatus.available === true && (
                <p className="text-xs text-green-600">✓ Available</p>
              )}
              {!subdomainStatus.checking && subdomainStatus.available === false && (
                <p className="text-xs text-red-600">
                  {subdomainStatus.error || "Not available"}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Tell clients about your business..."
              className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="timezone" className="block text-sm font-medium">
              Timezone
            </label>
            <select
              id="timezone"
              name="timezone"
              defaultValue="America/New_York"
              className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Europe/Amsterdam">Amsterdam (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || subdomainStatus.available === false}
          >
            {loading ? "Creating..." : "Create my booking site"}
          </Button>
        </form>
      </div>
    </div>
  );
}
