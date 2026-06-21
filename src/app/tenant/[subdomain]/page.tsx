import { getTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { ServiceGrid } from "./service-grid";
import { OpeningHours } from "./opening-hours";

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

  const [services, availability] = await Promise.all([
    prisma.service.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.availability.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
  ]);

  const initials = tenant.businessName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (services.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center shadow-sm">
        <CalendarDays className="mx-auto mb-4 h-12 w-12 text-gray-300" />
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
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-5">
        {/* Left: profile + services */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex items-center gap-4">
            {tenant.logo ? (
              <Image
                src={tenant.logo}
                alt={tenant.businessName}
                width={56}
                height={56}
                className="h-14 w-14 rounded-2xl object-cover shadow-sm"
              />
            ) : (
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-sm"
                style={{ background: tenant.primaryColor }}
              >
                {initials}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                {tenant.businessName}
              </h1>
              <p className="text-sm text-gray-500">Book an appointment online</p>
            </div>
          </div>

          {tenant.description && (
            <p className="mb-6 max-w-prose text-sm leading-relaxed text-gray-600">
              {tenant.description}
            </p>
          )}

          <div className="mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Services</h2>
            <p className="text-xs text-gray-500">
              Pick a service to choose a date and time.
            </p>
          </div>
          <ServiceGrid services={services} primaryColor={tenant.primaryColor} />
        </div>

        {/* Right: informational opening hours */}
        <div className="lg:col-span-2">
          <OpeningHours
            primaryColor={tenant.primaryColor}
            availability={availability.map((a) => ({
              dayOfWeek: a.dayOfWeek,
              startTime: a.startTime,
              endTime: a.endTime,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
