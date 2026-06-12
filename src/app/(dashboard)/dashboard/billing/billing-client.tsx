"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap, AlertCircle, Loader2, CreditCard } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const features = [
  "Unlimited appointments",
  "Custom booking page with your branding",
  "Automated email notifications",
  "Service & availability management",
  "Client management",
  "Priority support",
];

function StatusBanner() {
  const params = useSearchParams();
  if (params.get("success") === "1") {
    return (
      <div className="mb-6 flex items-center gap-2.5 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        Payment successful — your subscription is now active.
      </div>
    );
  }
  if (params.get("canceled") === "1") {
    return (
      <div className="mb-6 flex items-center gap-2.5 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700">
        <AlertCircle className="h-4 w-4 shrink-0" />
        Checkout cancelled. You can try again below.
      </div>
    );
  }
  return null;
}

interface Props {
  status: string;
  trialEndsAt: string | null;
  daysLeft: number | null;
  isActive: boolean;
  hasStripeCustomer: boolean;
}

export function BillingClient({ status, daysLeft, isActive }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  }

  const statusLabel =
    status === "active" ? "Active"
    : status === "trialing" ? (daysLeft && daysLeft > 0 ? `Trial — ${daysLeft} day${daysLeft === 1 ? "" : "s"} left` : "Trial expired")
    : status === "past_due" ? "Past due"
    : status === "canceled" ? "Canceled"
    : "Inactive";

  const statusColor =
    status === "active" ? "text-emerald-700 bg-emerald-50 border-emerald-100"
    : status === "trialing" && daysLeft && daysLeft > 0 ? "text-blue-700 bg-blue-50 border-blue-100"
    : "text-red-700 bg-red-50 border-red-100";

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="mt-1 text-muted-foreground text-sm">Manage your Kalentr subscription.</p>
      </div>

      <Suspense>
        <StatusBanner />
      </Suspense>

      {/* Current plan card */}
      <div className="rounded-2xl border bg-card shadow-sm mb-6 overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Current plan</p>
              <p className="text-lg font-semibold">Kalentr Pro</p>
            </div>
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-3xl font-bold">€9</span>
            <span className="text-muted-foreground text-sm">/month</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {!isActive && (
            <Button className="w-full sm:w-auto" size="lg" onClick={handleUpgrade} disabled={loading}>
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Redirecting…</>
              ) : (
                <><Zap className="h-4 w-4 mr-2" />Subscribe for €9/month</>
              )}
            </Button>
          )}

          {isActive && status === "active" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              To cancel or update your payment method, contact support.
            </div>
          )}
        </div>
      </div>

      {status === "trialing" && daysLeft !== null && daysLeft > 0 && (
        <p className="text-sm text-muted-foreground">
          Your free trial ends in <strong>{daysLeft} day{daysLeft === 1 ? "" : "s"}</strong>. Subscribe before then to keep your booking site live.
        </p>
      )}
    </div>
  );
}
