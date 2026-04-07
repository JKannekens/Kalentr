import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantByOwner } from "@/lib/tenant";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AppointmentList } from "./appointment-list";

export default async function AppointmentsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const tenant = await getTenantByOwner(session.user.id);
  if (!tenant) {
    redirect("/onboarding");
  }

  const appointments = await prisma.appointment.findMany({
    where: { tenantId: tenant.id },
    include: { service: true },
    orderBy: { startTime: "asc" },
  });

  // Separate into upcoming and past
  const now = new Date();
  const upcoming = appointments.filter((a) => new Date(a.startTime) >= now);
  const past = appointments.filter((a) => new Date(a.startTime) < now);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2">
          <ChevronLeft className="h-4 w-4" /> Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Appointments</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          View and manage your bookings
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Upcoming ({upcoming.length})
          </h2>
          <AppointmentList appointments={upcoming} type="upcoming" />
        </section>

        {past.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">
              Past ({past.length})
            </h2>
            <AppointmentList appointments={past} type="past" />
          </section>
        )}
      </div>
    </div>
  );
}
