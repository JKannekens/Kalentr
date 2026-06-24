import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantByOwner } from "@/lib/tenant";
import { redirect } from "next/navigation";
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
        <h1 className="text-2xl font-bold tracking-tight">Availability</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Set your weekly schedule for when clients can book</p>
      </div>

      <AvailabilityForm initialAvailability={availabilityMap} use24Hour={tenant.use24Hour} />

      <div>
        <h2 className="text-lg font-semibold mb-0.5">Time off & holidays</h2>
        <p className="text-sm text-muted-foreground mb-4">Block specific dates when you&apos;re unavailable</p>
        <TimeOffForm initialTimeOff={timeOff} />
      </div>
    </div>
  );
}
