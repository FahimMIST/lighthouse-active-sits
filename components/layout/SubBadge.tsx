"use client";

import { useUser } from "@clerk/nextjs";

interface Meta {
  stripeSubscriptionStatus?: string;
  manualAccessGrant?: boolean;
}

export function SubBadge() {
  const { user, isLoaded } = useUser();
  if (!isLoaded || !user) return null;

  const meta = (user.publicMetadata ?? {}) as Meta;
  const isPaid =
    meta.stripeSubscriptionStatus === "active" ||
    meta.stripeSubscriptionStatus === "past_due" ||
    meta.manualAccessGrant;

  if (!isPaid) return null;

  return (
    <span className="rounded-full bg-brand-gold px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
      Pro
    </span>
  );
}
