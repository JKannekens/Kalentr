"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createTenant, checkSubdomainAvailability } from "./actions";
import { createService } from "../dashboard/services/actions";
import { getRootDomain } from "@/lib/root-domain";
import { NativeSelect } from "@/components/ui/native-select";
import { CheckCircle2, Circle, Clock } from "lucide-react";

type Step = 1 | 2;

const inputClass = "block w-full rounded-lg border bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-gray-800 dark:border-gray-700";

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 to-white dark:from-gray-900 dark:to-gray-950 flex items-start justify-center pt-16 px-4 pb-16">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-2xl shadow-sm mb-4">
            K
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {step === 1 ? "Set up your booking site" : "Add your first service"}
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            {step === 1
              ? "Takes about 2 minutes. You can change everything later."
              : "What can clients book with you? You can add more later."}
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-3 mb-8 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 text-primary font-medium">
            <CheckCircle2 className="h-4 w-4" /> Account created
          </span>
          <div className="h-px w-8 bg-border" />
          <span className={`flex items-center gap-1.5 ${step >= 1 ? "text-primary font-medium" : ""}`}>
            {step > 1 ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />} Set up your page
          </span>
          <div className="h-px w-8 bg-border" />
          <span className={`flex items-center gap-1.5 ${step === 2 ? "text-primary font-medium" : ""}`}>
            <Circle className="h-4 w-4" /> Add services
          </span>
        </div>

        {step === 1 ? (
          <TenantStep onDone={() => setStep(2)} />
        ) : (
          <ServicesStep />
        )}
      </div>
    </div>
  );
}

function TenantStep({ onDone }: { onDone: () => void }) {
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
        onDone();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const rootDomain = getRootDomain();

  return (
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
          <NativeSelect
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
          </NativeSelect>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading || subdomainStatus.available === false}
        >
          {loading ? "Creating your site…" : "Continue →"}
        </Button>
      </form>
    </div>
  );
}

function ServicesStep() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState<{ name: string; duration: number }[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("isActive", "true");
    const name = formData.get("name") as string;
    const duration = Number(formData.get("duration"));

    try {
      const result = await createService(formData);
      if (!result.success) {
        setError(result.error || "Failed to add service");
      } else {
        setAdded((prev) => [...prev, { name, duration }]);
        form.reset();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function finish() {
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800">
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        {added.length > 0 && (
          <ul className="space-y-2">
            {added.map((s, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/60 px-4 py-2.5 text-sm dark:border-emerald-900/40 dark:bg-emerald-900/15"
              >
                <span className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {s.name}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> {s.duration} min
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium">Service name</label>
          <input
            id="name" name="name" type="text" required
            placeholder="e.g. 60-minute massage"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="duration" className="block text-sm font-medium">Duration</label>
            <NativeSelect id="duration" name="duration" defaultValue="30" className={inputClass}>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
              <option value="120">2 hours</option>
            </NativeSelect>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="price" className="block text-sm font-medium">
              Price <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              id="price" name="price" type="number" min={0} step="0.01"
              placeholder="e.g. 50"
              className={inputClass}
            />
          </div>
        </div>

        <Button type="submit" variant="outline" className="w-full" disabled={loading}>
          {loading ? "Adding…" : added.length > 0 ? "Add another service" : "Add service"}
        </Button>

        <div className="space-y-2">
          <Button
            type="button"
            className="w-full"
            size="lg"
            disabled={added.length === 0 || loading}
            onClick={finish}
          >
            Go to my dashboard →
          </Button>
          <button
            type="button"
            onClick={finish}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            Skip for now
          </button>
        </div>
      </form>
    </div>
  );
}
