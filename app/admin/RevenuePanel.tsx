"use client";

import { useCallback, useEffect, useState } from "react";

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  description: string;
  type: "subscription" | "report" | "other";
  email: string;
  date: string;
  status: string;
}

interface RevenueData {
  mrr: number;
  activeSubscriptions: number;
  totalRevenue30d: number;
  totalRevenue7d: number;
  totalReportSales: number;
  totalSubPayments: number;
  recentTransactions: Transaction[];
}

export function RevenuePanel() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/revenue");
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError("Could not load Stripe data. Check that Stripe keys are configured.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-[13px] text-gray-500">
        Loading revenue data from Stripe…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-[13px] text-gray-500">
        {error || "No data available."}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Revenue stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="MRR"
          value={`$${data.mrr.toLocaleString()}`}
          accent
        />
        <StatCard
          label="Revenue (30d)"
          value={`$${data.totalRevenue30d.toLocaleString()}`}
        />
        <StatCard
          label="Revenue (7d)"
          value={`$${data.totalRevenue7d.toLocaleString()}`}
        />
        <StatCard
          label="Active subs"
          value={String(data.activeSubscriptions)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="Sub payments (30d)"
          value={String(data.totalSubPayments)}
        />
        <StatCard
          label="Report sales (30d)"
          value={String(data.totalReportSales)}
        />
        <StatCard
          label="Avg. revenue / day"
          value={`$${Math.round(data.totalRevenue30d / 30).toLocaleString()}`}
        />
      </div>

      {/* Recent transactions */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h3 className="text-[11px] font-medium uppercase tracking-label text-gray-500">
            Recent transactions
          </h3>
          <button
            onClick={load}
            className="text-[11px] font-medium text-brand-navy hover:underline"
          >
            Refresh
          </button>
        </header>
        {data.recentTransactions.length === 0 ? (
          <div className="px-5 py-8 text-center text-[13px] text-gray-500">
            No transactions in the last 30 days.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-gray-50 text-left text-[10px] uppercase tracking-label text-gray-500">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.map((t) => (
                  <tr key={t.id} className="border-t border-gray-100">
                    <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-gray-600">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <TypeBadge type={t.type} />
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-2.5 text-gray-700">
                      {t.description}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{t.email}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right font-semibold tabular-nums text-brand-navy">
                      ${t.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        accent
          ? "border-green-200 bg-green-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="text-[10px] font-medium uppercase tracking-label text-gray-500">
        {label}
      </div>
      <div
        className={`mt-1 text-[20px] font-semibold tabular-nums ${
          accent ? "text-green-800" : "text-brand-navy"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const styles =
    type === "subscription"
      ? "bg-brand-gold-light text-brand-gold-ink border-brand-gold/40"
      : type === "report"
        ? "bg-blue-50 text-blue-800 border-blue-200"
        : "bg-gray-100 text-gray-600 border-gray-300";
  return (
    <span
      className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-label ${styles}`}
    >
      {type === "subscription" ? "Sub" : type === "report" ? "Report" : type}
    </span>
  );
}
