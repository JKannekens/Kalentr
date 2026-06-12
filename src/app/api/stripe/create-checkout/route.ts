import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, PLAN_PRICE_ID } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true, stripeCustomerId: true },
  });

  if (!tenant) {
    return NextResponse.json({ error: "No tenant found" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: tenant.stripeCustomerId ?? undefined,
    customer_email: tenant.stripeCustomerId ? undefined : session.user.email!,
    line_items: [{ price: PLAN_PRICE_ID, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?success=1`,
    cancel_url: `${appUrl}/dashboard/billing?canceled=1`,
    metadata: { tenantId: tenant.id },
    subscription_data: {
      metadata: { tenantId: tenant.id },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
