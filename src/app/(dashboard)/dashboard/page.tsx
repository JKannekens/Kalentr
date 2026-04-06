import { auth } from "@/lib/auth";
import { getTenantByOwner } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const tenant = await getTenantByOwner(session.user.id);

  // If user doesn't have a tenant yet, redirect to onboarding
  if (!tenant) {
    redirect("/onboarding");
  }

  const [serviceCount, appointmentCount] = await Promise.all([
    prisma.service.count({ where: { tenantId: tenant.id } }),
    prisma.appointment.count({ where: { tenantId: tenant.id } }),
  ]);

  const microSiteUrl =
    process.env.NODE_ENV === "development"
      ? `http://${tenant.subdomain}.localhost:3000`
      : `https://${tenant.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{tenant.businessName}</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Your booking microsite:{" "}
          <a
            href={microSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {microSiteUrl}
          </a>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Services"
          description="Manage the services you offer"
          href="/dashboard/services"
          count={serviceCount}
        />
        <DashboardCard
          title="Availability"
          description="Set your weekly schedule"
          href="/dashboard/availability"
        />
        <DashboardCard
          title="Appointments"
          description="View and manage bookings"
          href="/dashboard/appointments"
          count={appointmentCount}
        />
        <DashboardCard
          title="Settings"
          description="Customize your microsite"
          href="/dashboard/settings"
        />
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  href,
  count,
}: {
  title: string;
  description: string;
  href: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {count !== undefined && (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium dark:bg-gray-700">
            {count}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </Link>
  );
}
