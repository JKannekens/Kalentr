import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantByOwner } from "@/lib/tenant";
import { redirect } from "next/navigation";
import { ServiceForm } from "./service-form";
import { ServiceList } from "./service-list";

export default async function ServicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tenant = await getTenantByOwner(session.user.id);
  if (!tenant) redirect("/onboarding");

  const services = await prisma.service.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
  });

  const categories = Array.from(
    new Set(services.map((s) => s.category).filter(Boolean))
  ) as string[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Services</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Manage the services clients can book</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ServiceList services={services} />
        </div>
        <div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="font-semibold mb-5">Add service</h2>
            <ServiceForm categories={categories} />
          </div>
        </div>
      </div>
    </div>
  );
}
