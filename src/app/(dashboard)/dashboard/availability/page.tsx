import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantByOwner } from "@/lib/tenant";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Availability, TimeOff } from "@prisma/client";
import { AvailabilityForm } from "./availability-form";
import { TimeOffForm } from "./time-off-form";

export default async function AvailabilityPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const tenant = await getTenantByOwner(session.user.id);
  if (!tenant) {
    redirect("/onboarding");
  }

  const [availability, timeOff]: [Availability[], TimeOff[]] = await Promise.all([
    prisma.availability.findMany({
      where: { tenantId: tenant.id },
      orderBy: { dayOfWeek: "asc" },
    }),
    prisma.timeOff.findMany({
      where: { tenantId: tenant.id },
      orderBy: { startDate: "asc" },
    }),
  ]);

  // Convert to a map for easier access
  const availabilityMap = new Map<number, Availability>(
    availability.map((a) => [a.dayOfWeek, a])
  );

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2">
          <ChevronLeft className="h-4 w-4" /> Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Availability</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Set your weekly schedule for when clients can book
        </p>
      </div>

      <AvailabilityForm initialAvailability={availabilityMap} />

      <div>
        <h2 className="text-xl font-semibold mb-1">Time Off & Holidays</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Block specific dates when you&apos;re unavailable
        </p>
        <TimeOffForm initialTimeOff={timeOff} />
      </div>
    </div>
  );
}
