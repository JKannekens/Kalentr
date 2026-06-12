import { getTenant } from "@/lib/tenant";
import { notFound } from "next/navigation";
import Image from "next/image";
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

  const initials = tenant.businessName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-50"
      style={{ "--primary-color": tenant.primaryColor } as React.CSSProperties}
    >
      {/* Hero header */}
      <header
        style={{ background: tenant.primaryColor }}
        className="relative overflow-hidden"
      >
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 py-10 sm:py-14">
          <div className="flex items-center gap-5">
            {tenant.logo ? (
              <Image
                src={tenant.logo}
                alt={tenant.businessName}
                width={64}
                height={64}
                className="h-16 w-16 rounded-2xl object-cover shadow-lg ring-2 ring-white/30"
              />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-white ring-2 ring-white/30 shadow-lg">
                {initials}
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {tenant.businessName}
              </h1>
              {tenant.description && (
                <p className="mt-1 text-white/75 text-sm sm:text-base max-w-lg">
                  {tenant.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {children}
      </main>

      <footer className="border-t bg-white">
        <div className="mx-auto max-w-4xl px-4 py-5 flex items-center justify-between text-sm text-gray-400">
          <span>© {new Date().getFullYear()} {tenant.businessName}</span>
          <Link
            href="https://kalentr.com"
            className="hover:text-gray-600 transition-colors"
            target="_blank"
          >
            Powered by Kalentr
          </Link>
        </div>
      </footer>
    </div>
  );
}
