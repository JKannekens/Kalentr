import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { isSubscriptionActive } from "@/lib/stripe";
import { BillingClient } from "./billing-client";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tenant = await prisma.tenant.findUnique({
    where: { ownerId: session.user.id },
    select: { subscriptionStatus: true, trialEndsAt: true, stripeCustomerId: true },
  });

  if (!tenant) redirect("/onboarding");

  const active = isSubscriptionActive(tenant.subscriptionStatus, tenant.trialEndsAt);

  const daysLeft = tenant.trialEndsAt
    ? Math.max(0, Math.ceil((tenant.trialEndsAt.getTime() - Date.now()) / 86_400_000))
    : null;

  return (
    <BillingClient
      status={tenant.subscriptionStatus}
      trialEndsAt={tenant.trialEndsAt?.toISOString() ?? null}
      daysLeft={daysLeft}
      isActive={active}
      hasStripeCustomer={!!tenant.stripeCustomerId}
    />
  );
}
