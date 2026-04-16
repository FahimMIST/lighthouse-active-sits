import Link from "next/link";

export function SubscriptionBanner() {
  return (
    <div className="border-b border-brand-gold/30 bg-brand-gold-light">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3 text-[13px]">
        <span className="text-brand-gold-ink">
          <strong className="font-semibold">Active Situations</strong> —
          full deal intelligence, regulatory tracking, and CTFN analysis from{" "}
          <strong className="font-semibold tabular-nums">$499/mo</strong>.
        </span>
        <div className="flex gap-2">
          <Link
            href="/sign-up"
            className="font-medium text-brand-gold-ink hover:underline"
          >
            Sign up free
          </Link>
          <Link
            href="/subscribe"
            className="rounded bg-brand-navy px-3 py-1 font-medium text-white hover:bg-brand-navy-dark"
          >
            See plans
          </Link>
        </div>
      </div>
    </div>
  );
}
