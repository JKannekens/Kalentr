import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/landing-nav";
import { tenantUrl } from "@/lib/root-domain";
import {
  ArrowRight,
  BellRing,
  Calendar,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Globe,
  KeyRound,
  MapPin,
  Mail,
  Paperclip,
  ShieldCheck,
  Star,
  Tag,
  Users,
  Zap,
} from "lucide-react";

const ROLES = [
  "Freelance designers",
  "Business coaches",
  "Consultants",
  "Personal trainers",
  "Therapists",
  "Photographers",
  "Tutors",
];

const EXTRA_FEATURES = [
  {
    icon: Globe,
    title: "Your own URL — or domain",
    desc: "yourname.kalentr.com the moment you sign up. Connect a custom domain whenever you like.",
  },
  {
    icon: Users,
    title: "No login for clients",
    desc: "Clients book with just their name and email. Zero friction means more bookings.",
  },
  {
    icon: Clock,
    title: "Timezone-proof",
    desc: "Set your hours once. Everyone — you, your clients, their calendars — sees the right local time.",
  },
  {
    icon: ShieldCheck,
    title: "Self-service cancellation",
    desc: "Every confirmation includes a secure cancel link. You decide how much notice is required.",
  },
  {
    icon: Tag,
    title: "Services, categories & pricing",
    desc: "List everything you offer with duration and price. Clients pick exactly what they need.",
  },
  {
    icon: KeyRound,
    title: "Sign in with Google or Microsoft",
    desc: "One-click sign-in for you. Or classic email and password — your choice.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Create your account",
    desc: "Sign up and claim your booking URL. Takes 30 seconds — no credit card.",
    icon: Zap,
  },
  {
    step: "02",
    title: "Add services & hours",
    desc: "Define what you offer and when you work. Buffers, notice periods and approval are up to you.",
    icon: Calendar,
  },
  {
    step: "03",
    title: "Share your link",
    desc: "Clients pick a time and book. Confirmations, invites and reminders happen on their own.",
    icon: Globe,
  },
];

const FAQ = [
  {
    q: "Do my clients need an account?",
    a: "No. Clients book with just their name and email — no signup, no app. They immediately get a confirmation email with a calendar invite.",
  },
  {
    q: "Can I approve bookings before they're confirmed?",
    a: "Yes. Turn on manual approval and new bookings arrive as requests. You confirm with one click, and the client gets their confirmation and calendar invite the moment you do.",
  },
  {
    q: "What happens after someone books?",
    a: "The client receives a confirmation with an “Add to Google Calendar” button and an invite file that works with Apple and Outlook too. You get notified by email, and the client automatically receives a reminder 24 hours before the appointment.",
  },
  {
    q: "Can clients cancel a booking themselves?",
    a: "Yes — every confirmation contains a secure cancellation link. You choose the cancellation policy: require 24 hours' notice, a week, or allow cancelling anytime.",
  },
  {
    q: "Can I use my own domain?",
    a: "Your page is live at yourname.kalentr.com instantly, and you can connect your own domain (like bookings.yourname.com) from the settings.",
  },
  {
    q: "What does it cost?",
    a: "One plan: €9 per month after a 14-day free trial. Everything included, cancel anytime.",
  },
];

function ClientPagePreview() {
  return (
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
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" />
                  Amsterdam, NL
                </p>
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
  );
}

/* ─── Feature vignettes (pure-Tailwind mini mockups) ─── */

function BookingFlowVignette() {
  const slots = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "2:00 PM"];
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-lg">
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-4">
        <span>1. Date</span>
        <span>→</span>
        <span className="font-semibold text-gray-900 dark:text-white">2. Time</span>
        <span>→</span>
        <span>3. Details</span>
      </div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Tuesday, June 24
        <span className="ml-2 text-xs font-normal text-gray-400">Europe/Amsterdam</span>
      </p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {slots.map((t, i) => (
          <div
            key={t}
            className={`rounded-lg border px-2 py-1.5 text-center text-xs font-medium ${
              i === 2
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400"
            }`}
          >
            {t}
          </div>
        ))}
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-8 rounded-lg border border-gray-200 dark:border-gray-700 px-3 flex items-center text-xs text-gray-400">
          Jane Doe
        </div>
        <div className="h-8 rounded-lg border border-gray-200 dark:border-gray-700 px-3 flex items-center text-xs text-gray-400">
          jane@example.com
        </div>
      </div>
      <div className="rounded-lg bg-emerald-500 py-2 text-center text-sm font-medium text-white shadow-sm">
        Confirm booking
      </div>
    </div>
  );
}

function RulesVignette() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-lg">
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Booking rules</p>
      <div className="space-y-3 mb-5">
        {[
          { label: "Buffer between appointments", value: "15 min" },
          { label: "Minimum advance notice", value: "2 hours" },
          { label: "Booking window", value: "60 days" },
          { label: "Cancellation notice", value: "24 hours" },
        ].map((r) => (
          <div key={r.label} className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{r.label}</span>
            <span className="font-medium text-gray-900 dark:text-white">{r.value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Require manual approval</span>
          <span className="inline-flex h-5 w-9 items-center rounded-full bg-emerald-500 px-0.5">
            <span className="ml-auto h-4 w-4 rounded-full bg-white shadow" />
          </span>
        </div>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Pending request</p>
            <p className="truncate text-xs text-amber-700/80 dark:text-amber-400/80">Jane Doe · UX Audit · Fri 2:00 PM</p>
          </div>
          <span className="shrink-0 rounded-lg bg-emerald-500 px-3 py-1 text-xs font-medium text-white shadow-sm">
            Confirm
          </span>
        </div>
      </div>
    </div>
  );
}

function EmailVignette() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-lg">
        <p className="text-xs text-gray-400 mb-1">Alex Morgan Design</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Booking Confirmed — UX Audit
        </p>
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-xs text-gray-500 space-y-1 mb-3">
          <p>
            <span className="text-gray-400">Date</span> · Friday, June 27
          </p>
          <p>
            <span className="text-gray-400">Time</span> · 2:00 PM (90 minutes)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm">
            Add to Google Calendar
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs text-gray-500">
            <Paperclip className="h-3 w-3" />
            invite.ics
          </span>
        </div>
      </div>
      <div className="ml-8 flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 shadow-md">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50">
          <BellRing className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-900 dark:text-white">Reminder sent automatically</p>
          <p className="truncate text-xs text-gray-400">UX Audit tomorrow at 2:00 PM</p>
        </div>
      </div>
    </div>
  );
}

function DashboardVignette() {
  const events: Record<number, { label: string; color: string }> = {
    3: { label: "UX Audit", color: "bg-emerald-500/20 text-emerald-900 dark:bg-emerald-500/30 dark:text-emerald-100" },
    9: { label: "Consult", color: "bg-violet-500/20 text-violet-900 dark:bg-violet-500/30 dark:text-violet-100" },
    10: { label: "Strategy", color: "bg-orange-400/20 text-orange-900 dark:bg-orange-400/30 dark:text-orange-100" },
    16: { label: "Consult", color: "bg-emerald-500/20 text-emerald-900 dark:bg-emerald-500/30 dark:text-emerald-100" },
  };
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">June 2026</p>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
          <span className="bg-gray-900 px-2.5 py-1 font-medium text-white dark:bg-white dark:text-gray-900">month</span>
          <span className="px-2.5 py-1 text-gray-500">week</span>
          <span className="px-2.5 py-1 text-gray-500">day</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-medium uppercase text-gray-400">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 21 }, (_, i) => i + 1).map((d) => {
          const event = events[d];
          return (
            <div
              key={d}
              className="min-h-11 rounded-md border border-gray-100 dark:border-gray-800 p-1"
            >
              <span className={`text-[10px] ${d === 9 ? "font-bold text-emerald-600" : "text-gray-400"}`}>{d}</span>
              {event && (
                <div className={`mt-0.5 truncate rounded px-1 text-[9px] font-semibold leading-4 ${event.color}`}>
                  {event.label}
                </div>
              )}
              {d === 10 && <p className="text-[9px] text-gray-400 px-1">+2</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const SHOWCASE = [
  {
    eyebrow: "For your clients",
    title: "Booking takes three taps. No account, no app.",
    desc: "Clients open your link, pick a service, pick a time, done. They only ever see slots that actually work — your hours, your buffers, minus everything already booked.",
    points: [
      "Only genuinely free slots are offered — double bookings are impossible",
      "Times shown in your timezone, stated clearly on the page",
      "Works beautifully on any phone",
    ],
    vignette: BookingFlowVignette,
  },
  {
    eyebrow: "For your peace of mind",
    title: "Your calendar, your rules.",
    desc: "Decide how far ahead clients can book, how much notice you need, and how much breathing room you want between appointments. Want the final say? Turn on manual approval and confirm each request with one click.",
    points: [
      "Buffers, minimum notice and a booking window",
      "Optional manual approval for every new booking",
      "A cancellation policy you control — 24 hours, a week, or anytime",
    ],
    vignette: RulesVignette,
  },
  {
    eyebrow: "On autopilot",
    title: "Confirmations, invites and reminders — sent for you.",
    desc: "Every booking triggers a confirmation email with a calendar invite that works with Google, Apple and Outlook. A reminder goes out 24 hours before the appointment, so no-shows stop eating your day.",
    points: [
      "Calendar invite attached to every confirmation",
      "Automatic reminder 24 hours before each appointment",
      "You're notified of every new booking and cancellation",
    ],
    vignette: EmailVignette,
  },
  {
    eyebrow: "For your overview",
    title: "Your whole week at a glance.",
    desc: "A clean dashboard calendar with month, week and day views. Tap any appointment for client details, confirm pending requests, and see exactly where your time goes.",
    points: [
      "Month, week and day views with color-coded services",
      "Client details one tap away",
      "Fully responsive — manage bookings from your phone",
    ],
    vignette: DashboardVignette,
  },
];

export default function HomePage() {
  // The demo tenant must be visited on its subdomain — the tenant site's
  // internal links only resolve through the subdomain rewrite.
  const demoUrl = tenantUrl("alexmorgan");

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 text-foreground">
      <LandingNav />

      <main className="flex-1">
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div aria-hidden className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,#d1fae5,transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,#064e3b40,transparent)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,white)] dark:bg-[linear-gradient(to_bottom,transparent_60%,#030712)]" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-900 px-3.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-8">
                <Star className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" />
                14-day free trial · No credit card required
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.05]">
                Stop asking
                <br />
                <span className="text-gray-400 dark:text-gray-500">&ldquo;when works for you?&rdquo;</span>
                <br />
                <span className="text-emerald-500">Start getting booked.</span>
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Kalentr gives you a professional booking page in minutes. Share one link —
                clients pick a time, calendar invites and reminders go out automatically,
                and your schedule fills itself.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/register">
                  <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg transition-all px-8 h-12 text-base">
                    Get your booking page
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href={demoUrl} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline underline-offset-4 transition-colors">
                  See a live example →
                </a>
              </div>

              <p className="mt-4 text-xs text-gray-400">
                Setup takes under 2 minutes · €9/mo after trial · Cancel anytime
              </p>
            </div>

            {/* Preview + floating automation cards */}
            <div className="relative mt-20 mx-auto max-w-5xl">
              <div aria-hidden className="absolute -top-6 -right-4 z-10 hidden lg:flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 pr-5 shadow-xl rotate-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60">
                  <CalendarCheck2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-gray-900 dark:text-white">Booking confirmed</span>
                  <span className="block text-xs text-gray-400">Calendar invite sent to Jane</span>
                </span>
              </div>
              <div aria-hidden className="absolute -bottom-6 -left-4 z-10 hidden lg:flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 pr-5 shadow-xl -rotate-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/60">
                  <BellRing className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-gray-900 dark:text-white">Reminder sent</span>
                  <span className="block text-xs text-gray-400">24 hours before the appointment</span>
                </span>
              </div>

              <ClientPagePreview />
              <p className="text-center text-xs text-gray-400 mt-4">Your public booking page — live the moment you sign up</p>
            </div>
          </div>
        </section>

        {/* ─── Trust strip ─── */}
        <section className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs text-gray-400 uppercase tracking-widest font-medium mb-6">Built for independent professionals</p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
              {ROLES.map((role) => (
                <span key={role} className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Feature showcase ─── */}
        <section id="features" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-3">What it does for you</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                Everything between &ldquo;hello&rdquo; and &ldquo;see you Friday&rdquo;
              </h2>
              <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                From the moment a client opens your link to the reminder before you meet —
                Kalentr handles the whole conversation you used to have over email.
              </p>
            </div>

            <div className="space-y-24">
              {SHOWCASE.map(({ eyebrow, title, desc, points, vignette: Vignette }, i) => (
                <div key={title} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                  <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                    <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-3">{eyebrow}</p>
                    <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
                      {title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">{desc}</p>
                    <ul className="space-y-2.5">
                      {points.map((p) => (
                        <li key={p} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`mx-auto w-full max-w-md ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                    <Vignette />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Everything else ─── */}
        <section className="py-24 bg-gray-50 dark:bg-gray-900/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-3">And the rest</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                No enterprise bloat. Just what you need.
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {EXTRA_FEATURES.map(({ icon: Icon, title, desc }) => (
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

        {/* ─── How it works ─── */}
        <section id="how-it-works" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-3">Simple by design</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                Live before your coffee gets cold
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-gradient-to-r from-gray-200 via-emerald-300 to-gray-200 dark:from-gray-700 dark:via-emerald-700 dark:to-gray-700" />
              {STEPS.map(({ step, title, desc, icon: Icon }) => (
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

        {/* ─── Pricing ─── */}
        <section id="pricing" className="py-24 bg-gray-50 dark:bg-gray-900/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-3">Pricing</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                One price. Everything included.
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
                      "Your own booking URL + custom domain",
                      "Calendar invites & automatic reminders",
                      "Approval, buffer & cancellation rules",
                      "Dashboard with month, week & day views",
                      "Email notifications for every booking",
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

        {/* ─── FAQ ─── */}
        <section className="py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-3">FAQ</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                Questions, answered
              </h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              {FAQ.map(({ q, a }) => (
                <details key={q} className="group px-6 py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-medium text-gray-900 dark:text-white [&::-webkit-details-marker]:hidden">
                    {q}
                    <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{a}</p>
                </details>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-gray-400">
              Something else?{" "}
              <a href="mailto:hello@kalentr.com" className="inline-flex items-center gap-1 font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                <Mail className="h-3.5 w-3.5" />
                hello@kalentr.com
              </a>
            </p>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="py-24 bg-gray-900 dark:bg-black relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#065f46_0%,transparent_70%)] opacity-60" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
              Your next client is ready to book.
            </h2>
            <p className="text-gray-400 mb-10 text-lg max-w-xl mx-auto">
              Set up your booking page tonight and wake up to appointments —
              confirmed, on your calendar, reminder scheduled.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg hover:shadow-xl transition-all px-10 h-12 text-base font-semibold">
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
