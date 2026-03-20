import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantByOwner } from "@/lib/tenant";
import { redirect } from "next/navigation";
import { AvailabilityForm } from "./availability-form";

export default async function AvailabilityPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const tenant = await getTenantByOwner(session.user.id);
  if (!tenant) {
    redirect("/onboarding");
  }

  const availability = await prisma.availability.findMany({
    where: { tenantId: tenant.id },
    orderBy: { dayOfWeek: "asc" },
  });

  // Convert to a map for easier access
  const availabilityMap = new Map(
    availability.map((a) => [a.dayOfWeek, a])
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Availability</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Set your weekly schedule for when clients can book
        </p>
      </div>

      <AvailabilityForm initialAvailability={availabilityMap} />
    </div>
  );
}
