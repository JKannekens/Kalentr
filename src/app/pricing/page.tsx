import Link from "next/link";
import { CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  "Unlimited appointments",
  "Custom booking page with your branding",
  "Automated email confirmations & reminders",
  "Service catalogue management",
  "Weekly availability templates",
  "Time-off & holiday blocking",
  "Client contact history",
  "Priority email support",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Nav */}
      <nav className="border-b border-border/60 bg-white/80 backdrop-blur-md dark:bg-gray-950/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">K</span>
            Kalentr
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
            <Button asChild size="sm">
              <Link href="/register">Start free trial</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary mb-6">
          <Zap className="h-3.5 w-3.5" />
          Simple pricing
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          One plan, everything included
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Start free for 14 days. No credit card required. Cancel anytime.
        </p>
      </div>

      {/* Pricing card */}
      <div className="mx-auto max-w-md px-4 sm:px-0 pb-24">
        <div className="rounded-2xl border bg-white shadow-xl dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground">
            <p className="text-sm font-medium text-primary-foreground/80 mb-1">Kalentr Pro</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold">€9</span>
              <span className="text-primary-foreground/80">/month</span>
            </div>
            <p className="mt-2 text-sm text-primary-foreground/80">
              After your 14-day free trial
            </p>
          </div>

          <div className="p-8">
            <ul className="space-y-3 mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <Button asChild className="w-full" size="lg">
              <Link href="/register">Start 14-day free trial →</Link>
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              No credit card required during trial
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 space-y-6 text-sm">
          {[
            ["What happens after my trial?", "You'll see a prompt to subscribe for €9/month. If you don't subscribe, your booking page will be paused — but nothing is deleted."],
            ["Can I cancel anytime?", "Yes. Cancel from your billing page and you won't be charged again. Your data stays safe."],
            ["Do I need a credit card to try?", "No. Sign up and you get 14 days free with no payment details required."],
          ].map(([q, a]) => (
            <div key={q}>
              <p className="font-medium">{q}</p>
              <p className="mt-1 text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
