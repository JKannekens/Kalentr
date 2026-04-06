import { auth } from "@/lib/auth";
import { getTenantByOwner } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

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

  const [services, appointments] = await Promise.all([
    prisma.service.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.appointment.findMany({
      where: { tenantId: tenant.id },
      include: { service: true },
      orderBy: { startTime: "desc" },
    }),
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

      <DashboardContent
        appointments={appointments}
        services={services}
        timezone={tenant.timezone}
      />
    </div>
  );
}
