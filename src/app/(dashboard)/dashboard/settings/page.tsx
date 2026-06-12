import { auth } from "@/lib/auth";
import { getTenantByOwner } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tenantBase = await getTenantByOwner(session.user.id);
  if (!tenantBase) redirect("/onboarding");

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantBase.id },
    select: {
      id: true,
      businessName: true,
      description: true,
      logo: true,
      primaryColor: true,
      subdomain: true,
      timezone: true,
      customDomain: true,
    },
  });
  if (!tenant) redirect("/onboarding");

  const bookingConfig = await prisma.bookingConfig.findUnique({
    where: { tenantId: tenant.id },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Manage your microsite and booking preferences</p>
      </div>
      <SettingsForm tenant={tenant} bookingConfig={bookingConfig} />
    </div>
  );
}
