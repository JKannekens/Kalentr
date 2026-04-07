import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantByOwner } from "@/lib/tenant";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
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

  const categories = Array.from(new Set(services.map((s) => s.category).filter(Boolean))) as string[];

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2">
          <ChevronLeft className="h-4 w-4" /> Dashboard
        </Link>
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
          <ServiceForm categories={categories} />
        </div>
      </div>
    </div>
  );
}
