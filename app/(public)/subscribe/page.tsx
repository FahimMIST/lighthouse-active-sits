import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SubscribeButton } from "./SubscribeButton";

const PLANS = [
  {
    name: "Standard",
    price: "$499",
    per: "per month",
    tagline: "Full access to every active situation — updated every 15 days.",
    features: [
      "Full gated content on all active deals",
      "CTFN analysis, regulatory filings, risk factors",
      "Key Facts, deal documents, advisors",
      "Shareholder activism + voting agreement tracking",
      "Updates published every 15 days",
    ],
    cta: "Subscribe — Standard",
    primary: false,
  },
  {
    name: "Pro",
    price: "$799",
    per: "per month",
    tagline:
      "Everything in Standard — plus instant updates and watchlist alerts.",
    features: [
      "Everything in Standard",
      "Instant deal updates as situations move",
      "Watchlist — follow deals and receive email alerts",
      "Priority access to new situations on publish day",
      "Direct support line to the editorial desk",
    ],
    cta: "Subscribe — Pro",
    primary: true,
  },
];

const FAQ = [
  {
    q: "What's the difference between Standard and Pro?",
    a: "Standard gives you full access to all gated content — CTFN analysis, regulatory filings, documents, activism — updated on a 15-day editorial cycle. Pro adds real-time updates as situations evolve, plus a personal watchlist with email alerts within 15 minutes of a material change.",
  },
  {
    q: "What does 'updated every 15 days' mean?",
    a: "The editorial team reviews and refreshes every active situation on a bi-monthly cycle. Standard subscribers see those refreshed snapshots. Pro subscribers see every incremental update the moment it's published — including regulatory developments, stakeholder filings, and probability changes.",
  },
  {
    q: "How do watchlist alerts work?",
    a: "Pro subscribers can follow individual deals. When the editorial team publishes a material update, you receive an email within 15 minutes with a summary and direct link. Follow and unfollow from any deal page or your account.",
  },
  {
    q: "Can I upgrade from Standard to Pro mid-cycle?",
    a: "Yes. Upgrading prorates the difference for the remaining billing period. You gain instant updates and the watchlist immediately on upgrade.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Manage your subscription through the Stripe Customer Portal in your account. Cancellation takes effect at the end of the current billing period — no prorated refunds, but you keep access through the paid period.",
  },
  {
    q: "Do you offer annual pricing or team seats?",
    a: "Not yet. Annual pricing and firm-wide access are planned. Contact us to discuss enterprise needs.",
  },
];

export default function SubscribePage() {
  const { userId } = auth();
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="border-b border-gray-200 pb-8 text-center">
        <div className="text-[11px] font-medium uppercase tracking-label text-brand-gold-ink">
          Pricing
        </div>
        <h1 className="mt-2 font-serif text-[34px] leading-[1.2] tracking-tight text-brand-navy">
          M&amp;A intelligence built for professionals
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-[1.6] text-gray-600">
          Structured deal intelligence, regulatory lifecycle tracking, CTFN
          editorial analysis, and watchlist alerts — priced for merger-arb
          desks and advisory teams.
        </p>
      </header>

      <section className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`flex flex-col rounded-lg border bg-white p-6 ${
              p.primary
                ? "border-[1.5px] border-brand-gold shadow-sm"
                : "border-gray-200"
            }`}
          >
            {p.primary && (
              <div className="mb-3 inline-flex w-fit rounded border border-brand-gold/40 bg-brand-gold-light px-2 py-[2px] text-[10px] font-medium uppercase tracking-label text-brand-gold-ink">
                Most popular
              </div>
            )}
            <div className="text-[11px] font-medium uppercase tracking-label text-gray-500">
              {p.name}
            </div>
            <div className="mt-2 flex items-baseline gap-2 tabular-nums">
              <span className="text-[36px] font-semibold text-brand-navy">
                {p.price}
              </span>
              <span className="text-[13px] text-gray-500">{p.per}</span>
            </div>
            <p className="mt-2 text-[13px] leading-[1.55] text-gray-600">
              {p.tagline}
            </p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {p.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-[13px] leading-[1.5] text-gray-700"
                >
                  <span className="mt-[7px] block h-1 w-1 shrink-0 rounded-full bg-brand-gold" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-gray-100 pt-5">
              {userId ? (
                <SubscribeButton label={p.cta} />
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/sign-up"
                    className={`flex-1 rounded px-4 py-2.5 text-center text-[13px] font-medium ${
                      p.primary
                        ? "bg-brand-navy text-white hover:bg-brand-navy-dark"
                        : "border border-gray-300 text-gray-700 hover:border-brand-navy"
                    }`}
                  >
                    Create account
                  </Link>
                  <Link
                    href="/sign-in"
                    className="rounded border border-gray-300 px-4 py-2.5 text-[13px] font-medium hover:border-brand-navy"
                  >
                    Sign in
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Comparison table */}
      <section className="mt-12 overflow-x-auto">
        <h2 className="mb-4 text-[11px] font-medium uppercase tracking-label text-gray-500">
          Compare plans
        </h2>
        <table className="w-full text-[13px]">
          <thead className="border-b border-gray-200 text-left">
            <tr>
              <th className="pb-2 pr-4 text-[10px] font-medium uppercase tracking-label text-gray-500">
                Feature
              </th>
              <th className="pb-2 px-4 text-[10px] font-medium uppercase tracking-label text-gray-500">
                Standard
              </th>
              <th className="pb-2 px-4 text-[10px] font-medium uppercase tracking-label text-gray-500">
                Pro
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <CompRow feature="Gated content (analysis, filings, docs)" standard pro />
            <CompRow feature="Shareholder activism tracking" standard pro />
            <CompRow feature="Regulatory lifecycle with step tracking" standard pro />
            <CompRow feature="Key Facts, advisors, commentary" standard pro />
            <CompRow feature="Update frequency" standard="Every 15 days" pro="Instant" />
            <CompRow feature="Watchlist + email alerts" pro />
            <CompRow feature="Priority access to new deals" pro />
            <CompRow feature="Editorial desk support line" pro />
          </tbody>
        </table>
      </section>

      <section className="mt-14">
        <h2 className="text-[11px] font-medium uppercase tracking-label text-gray-500">
          Frequently asked
        </h2>
        <dl className="mt-4 divide-y divide-gray-200 border-t border-gray-200">
          {FAQ.map((item) => (
            <div key={item.q} className="py-5">
              <dt className="text-[15px] font-semibold text-brand-navy">
                {item.q}
              </dt>
              <dd className="mt-1.5 text-[14px] leading-[1.6] text-gray-600">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="py-12 text-center">
        <p className="text-[13px] text-gray-500">
          Questions?{" "}
          <a
            href="mailto:hello@ctfnlighthouse.com"
            className="text-brand-navy underline decoration-brand-gold underline-offset-2"
          >
            hello@ctfnlighthouse.com
          </a>
        </p>
      </div>
    </main>
  );
}

function CompRow({
  feature,
  standard,
  pro,
}: {
  feature: string;
  standard?: boolean | string;
  pro?: boolean | string;
}) {
  const cell = (val?: boolean | string) =>
    val === true ? (
      <svg width="16" height="16" viewBox="0 0 16 16" className="text-green-600">
        <path
          d="M3 8l3 3 7-7"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ) : typeof val === "string" ? (
      <span className="font-medium text-brand-navy">{val}</span>
    ) : (
      <span className="text-gray-300">—</span>
    );

  return (
    <tr>
      <td className="py-3 pr-4 text-gray-700">{feature}</td>
      <td className="py-3 px-4">{cell(standard)}</td>
      <td className="py-3 px-4">{cell(pro)}</td>
    </tr>
  );
}
