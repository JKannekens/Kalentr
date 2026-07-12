"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createTenant, checkSubdomainAvailability } from "./actions";
import { getRootDomain } from "@/lib/root-domain";
import { CheckCircle2, Circle } from "lucide-react";

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

  useEffect(() => {
    if (subdomain.length < 3) {
      setSubdomainStatus({ checking: false, available: null });
      return;
    }
    const timer = setTimeout(async () => {
      setSubdomainStatus({ checking: true, available: null });
      const result = await checkSubdomainAvailability(subdomain);
      setSubdomainStatus({ checking: false, available: result.available, error: result.error });
    }, 500);
    return () => clearTimeout(timer);
  }, [subdomain]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await createTenant(new FormData(e.currentTarget));
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

  const rootDomain = getRootDomain();
  const inputClass = "block w-full rounded-lg border bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-gray-800 dark:border-gray-700";

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 to-white dark:from-gray-900 dark:to-gray-950 flex items-start justify-center pt-16 px-4 pb-16">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-2xl shadow-sm mb-4">
            K
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Set up your booking site</h1>
          <p className="mt-2 text-muted-foreground text-sm">Takes about 2 minutes. You can change everything later.</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-3 mb-8 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 text-primary font-medium">
            <CheckCircle2 className="h-4 w-4" /> Account created
          </span>
          <div className="h-px w-8 bg-border" />
          <span className="flex items-center gap-1.5 text-primary font-medium">
            <Circle className="h-4 w-4" /> Set up your page
          </span>
          <div className="h-px w-8 bg-border" />
          <span className="flex items-center gap-1.5">
            <Circle className="h-4 w-4" /> Add services
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="businessName" className="block text-sm font-medium">Business name</label>
              <input
                id="businessName" name="businessName" type="text" required
                placeholder="e.g. Sarah's Wellness Studio"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="subdomain" className="block text-sm font-medium">Your booking URL</label>
              <div className="flex rounded-lg shadow-sm overflow-hidden border dark:border-gray-700 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition">
                <input
                  id="subdomain" name="subdomain" type="text" required
                  placeholder="sarahwellness"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className="flex-1 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm focus:outline-none"
                />
                <span className="inline-flex items-center bg-muted px-3 text-sm text-muted-foreground border-l dark:border-gray-700 shrink-0">
                  .{rootDomain}
                </span>
              </div>
              <div className="h-5 flex items-center">
                {subdomainStatus.checking && (
                  <p className="text-xs text-muted-foreground">Checking availability…</p>
                )}
                {!subdomainStatus.checking && subdomainStatus.available === true && (
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Available
                  </p>
                )}
                {!subdomainStatus.checking && subdomainStatus.available === false && (
                  <p className="text-xs text-red-600">{subdomainStatus.error || "Not available"}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="block text-sm font-medium">
                Tagline <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                id="description" name="description" rows={2}
                placeholder="e.g. Holistic wellness sessions for busy professionals"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="timezone" className="block text-sm font-medium">Your timezone</label>
              <select
                id="timezone" name="timezone" defaultValue="America/New_York"
                className={inputClass}
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
              size="lg"
              disabled={loading || subdomainStatus.available === false}
            >
              {loading ? "Creating your site…" : "Create my booking site →"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
