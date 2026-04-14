import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <span className="flex items-center gap-2 text-xl font-semibold tracking-tight">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                K
              </span>
              Kalentr
            </span>
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden py-24 sm:py-36">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.emerald.200/50),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,theme(colors.emerald.900/30),transparent_60%)]"
          />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Booking, simplified
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
              Your booking page,
              <br />
              <span className="text-primary">ready in minutes</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Get your own branded booking microsite. Let clients book appointments
              24/7 without the back-and-forth. Perfect for consultants, coaches,
              freelancers, and service providers.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg">Start for free</Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg">
                  See features
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="border-y border-border/60 bg-secondary/40 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
              Everything you need to manage bookings
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                title="Your own subdomain"
                description="Get a professional booking URL like yourname.kalentr.com or connect your custom domain."
              />
              <FeatureCard
                title="Service management"
                description="Define your services with duration, description, and pricing. Clients pick what they need."
              />
              <FeatureCard
                title="Flexible availability"
                description="Set your weekly schedule. Block off time when you're busy. Control how far ahead clients can book."
              />
              <FeatureCard
                title="No login for clients"
                description="Clients book instantly with just their name and email. Frictionless experience."
              />
              <FeatureCard
                title="Email confirmations"
                description="Automatic confirmation emails to you and your clients. Never miss an appointment."
              />
              <FeatureCard
                title="Dashboard"
                description="Manage all your appointments in one place. Confirm, reschedule, or cancel with ease."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Kalentr. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="group rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
