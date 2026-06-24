import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { DashboardMobileNav } from "@/components/dashboard/dashboard-mobile-nav";
import { UpgradeWall } from "@/components/dashboard/upgrade-wall";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/stripe";
import Link from "next/link";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { ownerId: session.user.id },
    select: { subscriptionStatus: true, trialEndsAt: true },
  });

  const active = tenant ? isSubscriptionActive(tenant.subscriptionStatus, tenant.trialEndsAt) : true;

  const daysLeft = tenant?.trialEndsAt
    ? Math.max(0, Math.ceil((tenant.trialEndsAt.getTime() - Date.now()) / 86_400_000))
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 border-b border-border/60 bg-card/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-6">
              <DashboardMobileNav
                email={session.user.email}
                trialDaysLeft={tenant?.subscriptionStatus === "trialing" ? daysLeft : undefined}
              />
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-lg font-semibold tracking-tight hover:opacity-80 transition-opacity shrink-0"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold shadow-sm">
                  K
                </span>
                <span className="hidden sm:inline">Kalentr</span>
              </Link>
              <DashboardNav />
            </div>
            <div className="flex items-center gap-3">
              {tenant?.subscriptionStatus === "trialing" && daysLeft !== undefined && daysLeft <= 5 && daysLeft > 0 && (
                <Link
                  href="/dashboard/billing"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                >
                  {daysLeft}d left in trial
                </Link>
              )}
              <span className="hidden lg:inline text-sm text-muted-foreground truncate max-w-48">
                {session.user.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      {!active && <UpgradeWall daysLeft={daysLeft} />}
    </div>
  );
}
