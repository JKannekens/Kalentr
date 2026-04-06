import { getTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BookingForm } from "./booking-form";

export default async function BookServicePage({
  params,
}: {
  params: Promise<{ subdomain: string; serviceId: string }>;
}) {
  const { subdomain, serviceId } = await params;
  const tenant = await getTenant(subdomain);

  if (!tenant) {
    notFound();
  }

  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      tenantId: tenant.id,
      isActive: true,
    },
  });

  if (!service) {
    notFound();
  }

  // Get availability for this tenant
  const availability = await prisma.availability.findMany({
    where: {
      tenantId: tenant.id,
      isActive: true,
    },
    orderBy: { dayOfWeek: "asc" },
  });

  // Get booking config
  const bookingConfig = await prisma.bookingConfig.findUnique({
    where: { tenantId: tenant.id },
  });

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">{service.name}</h2>
        {service.description && (
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {service.description}
          </p>
        )}
        <p className="mt-2 text-sm text-gray-500">
          Duration: {service.duration} minutes
        </p>
      </div>

      <BookingForm
        service={service}
        tenant={tenant}
        availability={availability}
        bookingConfig={bookingConfig}
      />
    </div>
  );
}
