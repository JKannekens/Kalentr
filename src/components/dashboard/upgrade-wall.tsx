"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, CheckCircle2, Loader2 } from "lucide-react";

const features = [
  "Unlimited appointments",
  "Custom booking page",
  "Email notifications",
  "Service management",
  "Availability settings",
  "Client management",
];

export function UpgradeWall({ daysLeft }: { daysLeft?: number }) {
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

  const expired = !daysLeft || daysLeft <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card shadow-xl overflow-hidden">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 mb-4">
            <Zap className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold">
            {expired ? "Your trial has ended" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
          </h2>
          <p className="mt-2 text-primary-foreground/80 text-sm">
            {expired
              ? "Subscribe to keep your booking site live."
              : "Upgrade now to keep uninterrupted access."}
          </p>
        </div>

        <div className="p-8">
          <div className="flex items-baseline justify-center gap-1 mb-6">
            <span className="text-4xl font-bold">€9</span>
            <span className="text-muted-foreground">/month</span>
          </div>

          <ul className="space-y-2.5 mb-8">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <Button className="w-full" size="lg" onClick={handleUpgrade} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Redirecting to checkout…
              </>
            ) : (
              "Subscribe for €9/month →"
            )}
          </Button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Cancel anytime. No hidden fees.
          </p>
        </div>
      </div>
    </div>
  );
}
