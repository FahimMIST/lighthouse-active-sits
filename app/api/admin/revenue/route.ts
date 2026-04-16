import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getStripe } from "@/lib/stripe/client";
import type { UserMetadata } from "@/lib/clerk/helpers";

async function requireAdmin() {
  const { userId, sessionClaims } = auth();
  const meta = (sessionClaims?.metadata ?? {}) as UserMetadata;
  if (!userId || meta.role !== "admin") return null;
  return userId;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const stripe = getStripe();
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60;

    // Fetch recent charges (last 100)
    const charges = await stripe.charges.list({
      limit: 100,
      created: { gte: thirtyDaysAgo },
    });

    // Fetch active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
    });

    // Compute metrics
    let totalRevenue30d = 0;
    let totalRevenue7d = 0;
    let totalReportSales = 0;
    let totalSubPayments = 0;
    const recentTransactions: {
      id: string;
      amount: number;
      currency: string;
      description: string;
      type: "subscription" | "report" | "other";
      email: string;
      date: string;
      status: string;
    }[] = [];

    for (const charge of charges.data) {
      if (charge.status !== "succeeded") continue;
      const amount = charge.amount / 100;
      totalRevenue30d += amount;
      if (charge.created >= sevenDaysAgo) totalRevenue7d += amount;

      const isReport =
        charge.metadata?.type === "single_report" ||
        (charge.description?.toLowerCase().includes("report") ?? false) ||
        amount < 200; // heuristic: reports are < $200, subs are >= $499
      const isSub = !isReport;

      if (isReport) totalReportSales++;
      if (isSub) totalSubPayments++;

      recentTransactions.push({
        id: charge.id,
        amount,
        currency: charge.currency,
        description:
          charge.metadata?.dealSlug
            ? `Report: ${charge.metadata.dealSlug.replace(/-/g, " ")}`
            : charge.description || "Payment",
        type: isReport ? "report" : "subscription",
        email: charge.billing_details?.email || charge.receipt_email || "—",
        date: new Date(charge.created * 1000).toISOString(),
        status: charge.status,
      });
    }

    // MRR from active subscriptions
    let mrr = 0;
    for (const sub of subscriptions.data) {
      const item = sub.items.data[0];
      if (item?.price?.recurring?.interval === "month") {
        mrr += (item.price.unit_amount ?? 0) / 100;
      } else if (item?.price?.recurring?.interval === "year") {
        mrr += (item.price.unit_amount ?? 0) / 100 / 12;
      }
    }

    return NextResponse.json({
      mrr,
      activeSubscriptions: subscriptions.data.length,
      totalRevenue30d,
      totalRevenue7d,
      totalReportSales,
      totalSubPayments,
      recentTransactions: recentTransactions.slice(0, 20),
    });
  } catch (err) {
    console.error("[admin/revenue] Stripe error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Stripe data" },
      { status: 500 },
    );
  }
}
