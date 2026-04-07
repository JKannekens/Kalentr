import { getTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ServiceGrid } from "./service-grid";

export default async function TenantHomePage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const tenant = await getTenant(subdomain);
  
  if (!tenant) {
    notFound();
  }

  const services = await prisma.service.findMany({
    where: {
      tenantId: tenant.id,
      isActive: true,
    },
    orderBy: { name: "asc" },
  });

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          No services available
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Check back later for available appointments.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Book an Appointment</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Select a service to view available times
      </p>
      
      <ServiceGrid services={services} />
    </div>
  );
}
