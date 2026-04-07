import { auth } from "@/lib/auth";
import { getTenantByOwner } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tenant = await getTenantByOwner(session.user.id);
  if (!tenant) redirect("/onboarding");

  const bookingConfig = await prisma.bookingConfig.findUnique({
    where: { tenantId: tenant.id },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2">
          <ChevronLeft className="h-4 w-4" /> Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Manage your microsite and booking preferences</p>
      </div>
      <SettingsForm tenant={tenant} bookingConfig={bookingConfig} />
    </div>
  );
}
