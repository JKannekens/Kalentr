import { getTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

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
      
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <Link
            key={service.id}
            href={`/book/${service.id}`}
            className="block rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md dark:bg-gray-800 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold">{service.name}</h3>
            {service.description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {service.description}
              </p>
            )}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {service.duration} minutes
              </span>
              {service.price && (
                <span className="font-medium">
                  ${(service.price / 100).toFixed(2)}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
