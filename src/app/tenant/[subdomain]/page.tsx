import { getTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { ServiceGrid } from "./service-grid";
import { AvailabilityPreview } from "./availability-preview";
import { generateSlots } from "@/lib/generate-slots";

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

  const [services, availability, bookingConfig] = await Promise.all([
    prisma.service.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.availability.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: { dayOfWeek: "asc" },
    }),
    prisma.bookingConfig.findUnique({ where: { tenantId: tenant.id } }),
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

  // Build a real availability preview for the right-hand calendar panel.
  const availableWeekdays = Array.from(
    new Set(availability.map((a) => a.dayOfWeek))
  );
  const maxAdvanceDays = bookingConfig?.maxAdvanceDays ?? 30;
  const { nextDate, slots } = await getNextAvailability(
    tenant.id,
    services[0],
    availability,
    bookingConfig,
    maxAdvanceDays
  );

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

          <ServiceGrid services={services} primaryColor={tenant.primaryColor} />
        </div>

        {/* Right: availability calendar */}
        <div className="lg:col-span-2">
          <AvailabilityPreview
            primaryColor={tenant.primaryColor}
            availableWeekdays={availableWeekdays}
            maxAdvanceDays={maxAdvanceDays}
            nextDate={nextDate ? nextDate.toISOString() : null}
            slots={slots}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Find the next bookable date and a few real open slots for the calendar preview.
 */
async function getNextAvailability(
  tenantId: string,
  service: { id: string; duration: number },
  availability: { dayOfWeek: number; startTime: string; endTime: string }[],
  bookingConfig: {
    slotDurationMinutes: number;
    bufferMinutes: number;
  } | null,
  maxAdvanceDays: number
): Promise<{ nextDate: Date | null; slots: string[] }> {
  const availableDays = new Set(availability.map((a) => a.dayOfWeek));
  if (availableDays.size === 0) {
    return { nextDate: null, slots: [] };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 0; offset <= maxAdvanceDays; offset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    if (!availableDays.has(date.getDay())) continue;

    const dayStart = new Date(date);
    const dayEnd = new Date(date);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const appointments = await prisma.appointment.findMany({
      where: {
        tenantId,
        status: { notIn: ["CANCELLED"] },
        startTime: { gte: dayStart, lt: dayEnd },
      },
      select: { startTime: true, endTime: true },
    });

    const windows = availability.filter((a) => a.dayOfWeek === date.getDay());
    const slots = generateSlots({
      date: date.toISOString().split("T")[0],
      availability: windows,
      existingAppointments: appointments,
      serviceDuration: service.duration,
      slotDuration: bookingConfig?.slotDurationMinutes ?? 30,
      bufferMinutes: bookingConfig?.bufferMinutes ?? 0,
    });

    if (slots.length > 0) {
      return { nextDate: date, slots: slots.slice(0, 4) };
    }
  }

  return { nextDate: null, slots: [] };
}
