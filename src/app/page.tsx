import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <span className="text-xl font-bold">Kalentr</span>
            <div className="flex items-center gap-4">
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
        <section className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Your booking page,
              <br />
              <span className="text-blue-600">ready in minutes</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
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

        <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
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

      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Kalentr. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
