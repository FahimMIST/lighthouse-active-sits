"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function CheckoutSuccess() {
  const params = useSearchParams();
  const isSuccess = params.get("checkout") === "success";
  const [status, setStatus] = useState<"polling" | "ready" | "timeout">(
    "polling",
  );

  useEffect(() => {
    if (!isSuccess) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 15; // 15 × 2s = 30s max wait

    async function poll() {
      while (!cancelled && attempts < maxAttempts) {
        attempts++;
        try {
          const res = await fetch("/api/auth/check");
          const data = await res.json();
          if (data.isPaid) {
            setStatus("ready");
            // Small delay so the user sees the success message, then
            // redirect to the deals index (not back to pricing).
            setTimeout(() => {
              window.location.replace("/");
            }, 1500);
            return;
          }
        } catch {
          // Retry on network error
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      if (!cancelled) setStatus("timeout");
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [isSuccess]);

  if (!isSuccess) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 text-center shadow-xl">
        {status === "polling" && (
          <>
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand-gold" />
            <h3 className="text-[16px] font-semibold text-brand-navy">
              Payment successful
            </h3>
            <p className="mt-2 text-[13px] text-gray-600">
              Setting up your account — this takes a few seconds…
            </p>
          </>
        )}
        {status === "ready" && (
          <>
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                className="text-green-600"
              >
                <path
                  d="M4 10l4 4 8-8"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="text-[16px] font-semibold text-brand-navy">
              You&apos;re all set
            </h3>
            <p className="mt-2 text-[13px] text-gray-600">
              Full access unlocked — loading your content now.
            </p>
          </>
        )}
        {status === "timeout" && (
          <>
            <h3 className="text-[16px] font-semibold text-brand-navy">
              Almost there
            </h3>
            <p className="mt-2 text-[13px] text-gray-600">
              Your payment went through but account activation is taking
              longer than usual. Try refreshing the page in a moment.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded bg-brand-navy px-4 py-2 text-[13px] font-medium text-white hover:bg-brand-navy-dark"
            >
              Refresh now
            </button>
          </>
        )}
      </div>
    </div>
  );
}
