import { auth } from "@/lib/auth";
import { getTenantByOwner } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { CalendarDays, Briefcase, ExternalLink } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tenant = await getTenantByOwner(session.user.id);
  if (!tenant) redirect("/onboarding");

  const [services, appointments, timeOff] = await Promise.all([
    prisma.service.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.appointment.findMany({
      where: { tenantId: tenant.id, status: { not: "CANCELLED" } },
      include: { service: true },
      orderBy: { startTime: "desc" },
    }),
    prisma.timeOff.findMany({
      where: { tenantId: tenant.id },
      orderBy: { startDate: "asc" },
    }),
  ]);

  const microSiteUrl =
    process.env.NODE_ENV === "development"
      ? `http://${tenant.subdomain}.localhost:3000`
      : `https://${tenant.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingThisWeek = appointments.filter(
    (a) => new Date(a.startTime) >= now && new Date(a.startTime) <= nextWeek
  ).length;
  const pendingCount = appointments.filter((a) => a.status === "PENDING").length;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{tenant.businessName}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Welcome back — here&apos;s your overview</p>
        </div>
        <a
          href={microSiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted transition-colors shrink-0"
        >
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
          View booking page
        </a>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Upcoming this week</p>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold">{upcomingThisWeek}</p>
          {pendingCount > 0 && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
              {pendingCount} pending confirmation
            </p>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Active services</p>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold">{services.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {services.length === 0 ? "Add your first service" : "Available for booking"}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground mb-3">Your booking link</p>
          <a
            href={microSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline break-all leading-snug"
          >
            {microSiteUrl.replace(/^https?:\/\//, "")}
          </a>
          <p className="mt-1 text-xs text-muted-foreground">Share this with clients</p>
        </div>
      </div>

      <DashboardContent
        appointments={appointments}
        services={services}
        timezone={tenant.timezone}
        use24Hour={tenant.use24Hour}
        timeOff={timeOff}
      />
    </div>
  );
}
