import { getTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Tag } from "lucide-react";
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
    where: { id: serviceId, tenantId: tenant.id, isActive: true },
  });

  if (!service) {
    notFound();
  }

  const availability = await prisma.availability.findMany({
    where: { tenantId: tenant.id, isActive: true },
    orderBy: { dayOfWeek: "asc" },
  });

  const bookingConfig = await prisma.bookingConfig.findUnique({
    where: { tenantId: tenant.id },
  });

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        All services
      </Link>

      {/* Service summary card */}
      <div
        className="rounded-2xl p-5 mb-8 text-white"
        style={{ background: tenant.primaryColor }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold leading-tight">{service.name}</h2>
            {service.description && (
              <p className="mt-1.5 text-white/75 text-sm leading-relaxed">
                {service.description}
              </p>
            )}
          </div>
          <div className="shrink-0 text-right space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-sm font-medium">
              <Clock className="h-3.5 w-3.5" />
              {service.duration} min
            </div>
            {service.price != null && service.price > 0 && (
              <p className="text-lg font-bold">${(service.price / 100).toFixed(2)}</p>
            )}
            {service.category && (
              <div className="inline-flex items-center gap-1 bg-white/15 rounded-full px-2.5 py-0.5 text-xs">
                <Tag className="h-3 w-3" />
                {service.category}
              </div>
            )}
          </div>
        </div>
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
