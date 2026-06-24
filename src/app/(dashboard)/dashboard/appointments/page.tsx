import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantByOwner } from "@/lib/tenant";
import { redirect } from "next/navigation";
import { AppointmentList } from "./appointment-list";

export default async function AppointmentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tenant = await getTenantByOwner(session.user.id);
  if (!tenant) redirect("/onboarding");

  const appointments = await prisma.appointment.findMany({
    where: { tenantId: tenant.id },
    include: { service: true },
    orderBy: { startTime: "asc" },
  });

  const now = new Date();
  const upcoming = appointments.filter((a) => new Date(a.startTime) >= now);
  const past = appointments.filter((a) => new Date(a.startTime) < now);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">View and manage your bookings</p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-base font-semibold mb-3 text-muted-foreground uppercase tracking-wide text-xs">
            Upcoming · {upcoming.length}
          </h2>
          <AppointmentList appointments={upcoming} type="upcoming" use24Hour={tenant.use24Hour} timeZone={tenant.timezone} />
        </section>

        {past.length > 0 && (
          <section>
            <h2 className="text-base font-semibold mb-3 text-muted-foreground uppercase tracking-wide text-xs">
              Past · {past.length}
            </h2>
            <AppointmentList appointments={past} type="past" use24Hour={tenant.use24Hour} timeZone={tenant.timezone} />
          </section>
        )}
      </div>
    </div>
  );
}
