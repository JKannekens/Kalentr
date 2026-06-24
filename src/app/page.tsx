import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/landing-nav";
import {
  Calendar,
  Clock,
  Mail,
  Globe,
  LayoutDashboard,
  Users,
  ArrowRight,
  CheckCircle2,
  Zap,
  Star,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 text-foreground">
      <LandingNav />

      <main className="flex-1">
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden pt-20 pb-28 sm:pt-28 sm:pb-36">
          {/* Background gradient */}
          <div aria-hidden className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,#d1fae5,transparent)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,white)] dark:bg-[linear-gradient(to_bottom,transparent_60%,#030712)]" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-xs font-medium text-emerald-700 mb-8">
                <Star className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" />
                14-day free trial · No credit card required
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.05]">
                The booking page
                <br />
                <span className="text-emerald-500">clients love to use</span>
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Set up your professional booking microsite in minutes. Share one link —
                clients pick a time, you get the appointment. No back-and-forth. No missed bookings.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/register">
                  <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg transition-all px-8 h-12 text-base">
                    Get your booking page
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/tenant/alexmorgan" className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline underline-offset-4 transition-colors">
                  See a live example →
                </Link>
              </div>

              <p className="mt-4 text-xs text-gray-400">
                Setup takes under 2 minutes · €9/mo after trial
              </p>
            </div>

            {/* Dashboard mockup */}
            <div className="mt-20 mx-auto max-w-5xl">
              <div className="relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 mx-4 h-6 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center px-3">
                    <span className="text-xs text-gray-400">yourname.kalentr.com</span>
                  </div>
                </div>
                {/* Mock booking page content — mirrors the real client site */}
                <div className="p-6 sm:p-8 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-gray-900">
                  <div className="grid gap-6 sm:grid-cols-5">
                    {/* Left: profile + services */}
                    <div className="sm:col-span-3">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                          AM
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Alex Morgan Design</p>
                          <p className="text-xs text-gray-500">Book an appointment online</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                        I help startups and small businesses craft beautiful, user-friendly digital products.
                      </p>
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Services</p>
                        <p className="text-xs text-gray-500">Pick a service to choose a date and time.</p>
                      </div>
                      <div className="space-y-3">
                        {[
                          { name: "Design Consultation", meta: "30 min · Consultation", price: "$50" },
                          { name: "UX Audit", meta: "90 min · Audit", price: "$150" },
                          { name: "Website Strategy", meta: "60 min · Strategy", price: "$100" },
                        ].map((s) => (
                          <div key={s.name} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-3.5 shadow-sm">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                              <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="h-3 w-3" />
                                {s.meta}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2.5">
                              <span className="text-sm font-semibold text-indigo-600">{s.price}</span>
                              <span className="rounded-lg bg-indigo-500 px-3 py-1 text-xs font-medium text-white shadow-sm">Book</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Right: opening hours */}
                    <div className="hidden sm:block sm:col-span-2">
                      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">Opening hours</p>
                        </div>
                        <div className="space-y-2">
                          {[
                            { day: "Monday", hours: "9:00 AM – 5:00 PM" },
                            { day: "Tuesday", hours: "9:00 AM – 5:00 PM" },
                            { day: "Wednesday", hours: "9:00 AM – 5:00 PM" },
                            { day: "Thursday", hours: "9:00 AM – 5:00 PM" },
                            { day: "Friday", hours: "9:00 AM – 5:00 PM" },
                            { day: "Saturday", hours: null },
                            { day: "Sunday", hours: null },
                          ].map((d) => (
                            <div key={d.day} className="flex items-baseline justify-between gap-3 text-sm">
                              <span className="text-gray-500">{d.day}</span>
                              <span className={d.hours ? "font-medium text-gray-900 dark:text-white" : "text-gray-400"}>
                                {d.hours ?? "Closed"}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-300">
                          Next available · Today
                        </div>
                        <p className="mt-4 text-xs leading-relaxed text-gray-400">
                          Choose a service to see open time slots and book.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 mt-3">Your public booking page, live instantly</p>
            </div>
          </div>
        </section>

        {/* ─── Trust strip ─── */}
        <section className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs text-gray-400 uppercase tracking-widest font-medium mb-6">Perfect for</p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
              {[
                "Freelance designers",
                "Business coaches",
                "Consultants",
                "Personal trainers",
                "Therapists",
                "Photographers",
                "Tutors",
              ].map((role) => (
                <span key={role} className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How it works ─── */}
        <section id="how-it-works" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-3">Simple by design</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                Up and running in minutes
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* connector lines */}
              <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-gradient-to-r from-gray-200 via-emerald-300 to-gray-200 dark:from-gray-700 dark:via-emerald-700 dark:to-gray-700" />
              {[
                {
                  step: "01",
                  title: "Create your account",
                  desc: "Sign up and choose your booking URL. Takes 30 seconds. No credit card.",
                  icon: Zap,
                },
                {
                  step: "02",
                  title: "Add your services",
                  desc: "Define what you offer — name, duration, price. Set your weekly availability.",
                  icon: Calendar,
                },
                {
                  step: "03",
                  title: "Share your link",
                  desc: "Send clients to your booking page. They pick a time. You get a confirmation email.",
                  icon: Globe,
                },
              ].map(({ step, title, desc, icon: Icon }) => (
                <div key={step} className="relative text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 mb-5">
                    <Icon className="h-7 w-7 text-emerald-500" />
                  </div>
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">{step}</p>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Features ─── */}
        <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-3">Everything included</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                Built for independent professionals
              </h2>
              <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                No configuration nightmares. No overpowered enterprise features you&apos;ll never touch.
                Just what you need to run your bookings.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Globe,
                  title: "Your own booking URL",
                  desc: "Get yourname.kalentr.com the moment you sign up. Connect a custom domain later.",
                },
                {
                  icon: Clock,
                  title: "Smart availability",
                  desc: "Set weekly hours, block time off for holidays, and control how far ahead clients can book.",
                },
                {
                  icon: Mail,
                  title: "Automatic emails",
                  desc: "Clients get confirmation emails instantly. You get notified for every new booking.",
                },
                {
                  icon: Users,
                  title: "No login for clients",
                  desc: "Clients book with just their name and email. Zero friction, more bookings.",
                },
                {
                  icon: LayoutDashboard,
                  title: "Clean dashboard",
                  desc: "See upcoming appointments at a glance. Confirm, cancel, or mark as complete in one click.",
                },
                {
                  icon: Calendar,
                  title: "Service catalogue",
                  desc: "List all your services with duration and pricing. Clients choose what they need.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all hover:-translate-y-0.5"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Pricing ─── */}
        <section id="pricing" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-3">Pricing</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                One price. No surprises.
              </h2>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Start free. Upgrade when you&apos;re ready.
              </p>
            </div>

            <div className="mx-auto max-w-sm">
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-8 py-8 text-white text-center">
                  <p className="text-sm font-medium text-emerald-100 mb-1">Kalentr Pro</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-extrabold">€9</span>
                    <span className="text-emerald-200">/month</span>
                  </div>
                  <p className="mt-2 text-emerald-100 text-sm">14-day free trial included</p>
                </div>
                <div className="p-8">
                  <ul className="space-y-3 mb-8">
                    {[
                      "Unlimited appointments",
                      "Your own booking URL",
                      "Custom services & pricing",
                      "Smart availability management",
                      "Automatic email confirmations",
                      "Client booking history",
                      "Cancel anytime",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-11" size="lg">
                      Start free trial →
                    </Button>
                  </Link>
                  <p className="mt-3 text-center text-xs text-gray-400">No credit card required</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="py-24 bg-gray-900 dark:bg-black relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#065f46_0%,transparent_70%)] opacity-60" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
              Ready to fill your calendar?
            </h2>
            <p className="text-gray-400 mb-10 text-lg max-w-xl mx-auto">
              Join freelancers and consultants who stopped chasing clients for availability and started getting booked automatically.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg hover:shadow-xl transition-all px-10 h-13 text-base font-semibold">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <p className="mt-4 text-sm text-gray-500">14-day free trial · No credit card · Cancel anytime</p>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-800 bg-gray-900 dark:bg-black py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-semibold text-white">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white text-sm font-bold">
                K
              </span>
              Kalentr
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
              <Link href="/register" className="hover:text-white transition-colors">Sign up</Link>
            </div>
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} Kalentr. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
