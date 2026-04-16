import { notFound } from "next/navigation";
import { sanityClient, sanityServerClient } from "@/lib/sanity/client";
import {
  PUBLIC_DEAL_QUERY,
  PAID_DEAL_QUERY,
} from "@/lib/sanity/queries";
import type { PaidDeal, PublicDeal } from "@/lib/sanity/types";
import { clerkClient } from "@clerk/nextjs/server";
import {
  getCurrentUserContext,
  getUserWatchlist,
  isPaidStatus,
} from "@/lib/clerk/helpers";
import type { UserMetadata } from "@/lib/clerk/helpers";
import { DealHeader } from "@/components/deals/DealHeader";
import { SnapshotCard } from "@/components/deals/SnapshotCard";
import { KeyRiskPull } from "@/components/deals/KeyRiskPull";
import { KeyFactsTable } from "@/components/deals/KeyFactsTable";
import { PaywallGate } from "@/components/deals/PaywallGate";
import { RegulatoryFilings } from "@/components/deals/RegulatoryFilings";
import { ShareholderVote } from "@/components/deals/ShareholderVote";
import { CtfnAnalysis } from "@/components/deals/CtfnAnalysis";
import { ShareholderActivism } from "@/components/deals/ShareholderActivism";
import { CollapsibleProse } from "@/components/deals/CollapsibleProse";
import { DocumentLibrary } from "@/components/deals/DocumentLibrary";
import { CheckoutSuccess } from "@/components/deals/CheckoutSuccess";
import { FollowButton } from "@/components/ui/FollowButton";

export const revalidate = 60;

export default async function DealPage({
  params,
}: {
  params: { slug: string };
}) {
  const ctx = await getCurrentUserContext();

  // Read fresh metadata so content unlocks immediately after payment
  // (JWT session claims can lag by up to 60s).
  let paid = ctx.isPaid;
  if (ctx.userId && !paid) {
    const freshUser = await clerkClient.users.getUser(ctx.userId);
    const freshMeta = (freshUser.publicMetadata ?? {}) as UserMetadata;
    paid = isPaidStatus(freshMeta);
  }

  // Layer-3 gating: only fetch paid fields if user is paid
  const deal = paid
    ? await sanityServerClient.fetch<PaidDeal>(PAID_DEAL_QUERY, {
        slug: params.slug,
      })
    : await sanityClient.fetch<PublicDeal>(PUBLIC_DEAL_QUERY, {
        slug: params.slug,
      });

  if (!deal) notFound();

  const watchlist =
    ctx.userId && paid ? await getUserWatchlist(ctx.userId) : [];
  const isFollowing = watchlist.includes(params.slug);
  const followControl =
    paid && ctx.userId ? (
      <FollowButton slug={params.slug} initialFollowing={isFollowing} />
    ) : null;

  return (
    <main className="mx-auto max-w-[720px] px-6 pt-10">
      <CheckoutSuccess />
      <DealHeader deal={deal} followControl={followControl} />

      <div className="mt-7 space-y-6">
        <SnapshotCard deal={deal} isPaid={paid} />

        {deal.key_risk_summary && <KeyRiskPull text={deal.key_risk_summary} />}

        {paid ? (
          <>
            <KeyFactsTable deal={deal as PaidDeal} />

            <RegulatoryFilings filings={(deal as PaidDeal).filings} />

            <ShareholderVote vote={(deal as PaidDeal).shareholder_vote} />

            <CtfnAnalysis
              analysis={(deal as PaidDeal).ctfn_analysis}
              risks={(deal as PaidDeal).risk_factors}
            />

            <ShareholderActivism
              entries={(deal as PaidDeal).shareholder_activism}
            />

            {(deal as PaidDeal).background?.length ? (
              <section className="rounded-lg border border-gray-200 bg-white px-5 py-4">
                <h2 className="mb-3 text-[11px] font-medium uppercase tracking-label text-gray-500">
                  Background
                </h2>
                <CollapsibleProse
                  value={(deal as PaidDeal).background}
                  maxLines={12}
                />
              </section>
            ) : null}

            <DocumentLibrary docs={(deal as PaidDeal).documents} />
          </>
        ) : (
          <PaywallGate isSignedIn={!!ctx.userId} />
        )}
      </div>

      <div className="py-12" />
    </main>
  );
}
