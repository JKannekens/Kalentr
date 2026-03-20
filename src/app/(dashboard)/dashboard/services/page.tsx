import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantByOwner } from "@/lib/tenant";
import { redirect } from "next/navigation";
import { ServiceForm } from "./service-form";
import { ServiceList } from "./service-list";

export default async function ServicesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const tenant = await getTenantByOwner(session.user.id);
  if (!tenant) {
    redirect("/onboarding");
  }

  const services = await prisma.service.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Services</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Manage the services clients can book
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ServiceList services={services} />
        </div>
        <div>
          <ServiceForm />
        </div>
      </div>
    </div>
  );
}
