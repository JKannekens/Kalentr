import { getTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ServiceGrid } from "./service-grid";
import { CalendarDays } from "lucide-react";

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
    where: { tenantId: tenant.id, isActive: true },
    orderBy: { name: "asc" },
  });

  if (services.length === 0) {
    return (
      <div className="text-center py-20">
        <CalendarDays className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">
          No services available yet
        </h2>
        <p className="mt-2 text-gray-500">
          Check back soon for available appointments.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Book an appointment</h2>
        <p className="mt-1 text-gray-500">
          Choose a service below to see available times.
        </p>
      </div>
      <ServiceGrid services={services} primaryColor={tenant.primaryColor} />
    </div>
  );
}
