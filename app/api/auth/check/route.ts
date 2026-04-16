import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import type { UserMetadata } from "@/lib/clerk/helpers";
import { isPaidStatus, setUserMetadata } from "@/lib/clerk/helpers";
import { getStripe } from "@/lib/stripe/client";

export async function GET(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ isPaid: false });
  }

  // Read FRESH metadata from Clerk API (not stale JWT).
  const user = await clerkClient.users.getUser(userId);
  const meta = (user.publicMetadata ?? {}) as UserMetadata;

  // Already paid — fast path.
  if (isPaidStatus(meta)) {
    return NextResponse.json({ isPaid: true });
  }

  // Not yet paid — check if a Stripe session_id was provided.
  // This handles the case where the webhook hasn't arrived yet (or never will).
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");

  if (sessionId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);

      // Verify the session belongs to this user and payment succeeded.
      if (
        session.payment_status === "paid" &&
        (session.client_reference_id === userId ||
          session.metadata?.clerkUserId === userId)
      ) {
        // Activate directly — don't wait for the webhook.
        await setUserMetadata(userId, {
          stripeSubscriptionStatus: "active",
          stripeCustomerId: (session.customer as string) ?? undefined,
          stripeSubscriptionId:
            (typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id) ?? undefined,
        });
        return NextResponse.json({ isPaid: true });
      }
    } catch (err) {
      console.error("[auth/check] Stripe session verification failed:", err);
    }
  }

  return NextResponse.json({ isPaid: false });
}
