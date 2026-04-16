import Link from "next/link";

export function PaywallGate({ isSignedIn = false }: { isSignedIn?: boolean }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white px-7 py-8 text-center">
      <div className="mb-2 text-[10px] font-medium uppercase tracking-label text-gray-500">
        Members only
      </div>
      <h3 className="font-serif text-[20px] font-normal text-brand-navy">
        Full intelligence on this situation
      </h3>
      <p className="mx-auto mt-2 max-w-[420px] text-[13px] leading-[1.6] text-gray-600">
        Subscribe to unlock CTFN analysis, regulatory lifecycle tracking,
        deal documents, shareholder activism, and proprietary closing
        estimates.
      </p>

      <ul className="mx-auto mt-5 max-w-xs space-y-2 text-left">
        {[
          "Full CTFN editorial analysis + risk factors",
          "Per-regulator filing lifecycle with step tracking",
          "Shareholder activism + voting agreements",
          "Deal documents, advisors, key facts",
          "Watchlist alerts when situations move",
        ].map((f) => (
          <li
            key={f}
            className="flex items-start gap-2 text-[13px] leading-[1.5] text-gray-700"
          >
            <span className="mt-[5px] block h-1 w-1 shrink-0 rounded-full bg-brand-gold" />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col items-center gap-2">
        <Link
          href="/subscribe"
          className="rounded bg-brand-navy px-8 py-2.5 text-[13px] font-medium text-white hover:bg-brand-navy-dark"
        >
          Subscribe — $499/mo
        </Link>
        {!isSignedIn && (
          <Link
            href="/sign-in"
            className="text-[12px] text-gray-500 hover:text-brand-navy"
          >
            Already a member? Sign in
          </Link>
        )}
      </div>
    </section>
  );
}
