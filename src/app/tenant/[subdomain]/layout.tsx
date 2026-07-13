import { getTenant } from "@/lib/tenant";
import { getRootDomain } from "@/lib/root-domain";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const tenant = await getTenant(subdomain);

  if (!tenant) {
    notFound();
  }

  const rootDomain = getRootDomain();
  const registerUrl = `${rootDomain.includes("localhost") ? "http" : "https"}://${rootDomain}/register`;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: `linear-gradient(to bottom right, ${tenant.primaryColor}14, #ffffff 60%)`,
      }}
    >
      {tenant.isDemo && (
        <div className="bg-gray-900 px-4 py-2 text-center text-xs text-white sm:text-sm">
          You&apos;re viewing a demo — feel free to click around, bookings are disabled.{" "}
          <a href={registerUrl} className="font-semibold text-emerald-400 underline underline-offset-2 hover:text-emerald-300">
            Create your own page →
          </a>
        </div>
      )}

      {/* Slim brand bar */}
      <header className="sticky top-0 z-20 border-b border-gray-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-2.5 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            {tenant.logo && (
              // Logo is a user-uploaded data URI — next/image can't optimize it.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tenant.logo}
                alt={tenant.businessName}
                className="h-8 w-8 rounded-lg object-cover shadow-sm"
              />
            )}
            <span className="font-semibold tracking-tight text-gray-900">
              {tenant.businessName}
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>

      <footer className="border-t border-gray-200/70 bg-white/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 text-sm text-gray-400 sm:px-6">
          <span>
            © {new Date().getFullYear()} {tenant.businessName}
          </span>
          <Link
            href="https://kalentr.com"
            className="transition-colors hover:text-gray-600"
            target="_blank"
          >
            Powered by Kalentr
          </Link>
        </div>
      </footer>
    </div>
  );
}
