"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TbCoin,
  TbCopy,
  TbCheck,
  TbUserPlus,
  TbShoppingBag,
  TbRotateClockwise,
  TbArrowDownRight,
} from "react-icons/tb";
import type { LedgerEntry, LedgerKind } from "@/lib/mock-data/loyalty";
import { formatINR } from "@/lib/utils";

const KIND_META: Record<
  LedgerKind,
  { label: string; Icon: typeof TbShoppingBag; tone: "earn" | "redeem" }
> = {
  "earned-purchase": {
    label: "Earned · Purchase",
    Icon: TbShoppingBag,
    tone: "earn",
  },
  "earned-rental": {
    label: "Earned · Rental",
    Icon: TbRotateClockwise,
    tone: "earn",
  },
  "earned-referral": {
    label: "Earned · Referral",
    Icon: TbUserPlus,
    tone: "earn",
  },
  redeemed: { label: "Redeemed", Icon: TbArrowDownRight, tone: "redeem" },
  reversed: { label: "Reversed", Icon: TbArrowDownRight, tone: "redeem" },
};

export function LoyaltyPanel({
  ledger,
  balance,
  pointValue,
  referral,
}: {
  ledger: LedgerEntry[];
  balance: number;
  pointValue: number;
  referral: { code: string; url: string; rewardPoints: number; referredRewardInr: number };
}) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  const copy = (what: "code" | "link", value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(what);
      setTimeout(() => setCopied(null), 1600);
    });
  };

  const sorted = [...ledger].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl text-ink sm:text-4xl">
          Loyalty & Referrals
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Earn points on every purchase and rental, redeem them at checkout,
          and invite friends to stack rewards.
        </p>
      </header>

      {/* Balance card */}
      <section className="flex flex-col gap-6 border border-line bg-gradient-to-br from-brand-tint via-white to-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white">
            <TbCoin size={26} />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
              Your points balance
            </p>
            <p className="mt-1 font-serif text-4xl text-ink">
              {balance.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              Worth{" "}
              <span className="font-semibold text-ink">
                {formatINR(balance * pointValue)}
              </span>{" "}
              at checkout
            </p>
          </div>
        </div>
        <div className="text-right text-xs leading-relaxed text-ink-muted">
          <p>Redeem up to 10% of your order subtotal.</p>
          <p>1 point = {formatINR(pointValue)}</p>
        </div>
      </section>

      {/* Referral card */}
      <section className="border border-line bg-white p-6 sm:p-8">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-dark">
          <TbUserPlus size={14} />
          Refer a friend
        </div>
        <h2 className="mt-2 font-serif text-2xl text-ink">
          Give {formatINR(referral.referredRewardInr)}, earn{" "}
          {referral.rewardPoints} points
        </h2>
        <p className="mt-2 max-w-md text-sm text-ink-muted">
          Share your code or personalised link. We reward them with{" "}
          {formatINR(referral.referredRewardInr)} off their first order and
          credit {referral.rewardPoints} points to your balance once their
          order completes.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <ShareField
            label="Your referral code"
            value={referral.code}
            copied={copied === "code"}
            onCopy={() => copy("code", referral.code)}
          />
          <ShareField
            label="Your referral link"
            value={referral.url}
            copied={copied === "link"}
            onCopy={() => copy("link", referral.url)}
          />
        </div>
      </section>

      {/* Ledger */}
      <section className="border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
          <p className="text-sm font-semibold text-ink">Points Ledger</p>
          <p className="text-xs text-ink-muted">
            {sorted.length} {sorted.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        {sorted.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-ink-muted">
            No activity yet. Make a purchase or refer a friend to start
            earning.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {sorted.map((entry) => {
              const meta = KIND_META[entry.kind];
              const positive = entry.points > 0;
              return (
                <li
                  key={entry.id}
                  className="flex items-center gap-4 px-5 py-4 sm:px-6"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      meta.tone === "earn"
                        ? "bg-brand-tint text-brand-dark"
                        : "bg-bg text-ink-muted"
                    }`}
                  >
                    <meta.Icon size={18} />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">
                      {meta.label}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {entry.note}
                      {entry.orderId && (
                        <>
                          {" · "}
                          <Link
                            href={`/account/orders/${entry.orderId}`}
                            className="text-brand-dark underline underline-offset-2 hover:text-ink"
                          >
                            Order #{entry.orderId}
                          </Link>
                        </>
                      )}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-subtle">
                      {new Date(entry.at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <p
                    className="text-sm font-serif"
                    style={{
                      color: positive
                        ? "var(--color-success)"
                        : "var(--color-danger)",
                    }}
                  >
                    {positive ? "+" : ""}
                    {entry.points.toLocaleString("en-IN")} pts
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function ShareField({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
        {label}
      </p>
      <div className="flex items-stretch overflow-hidden border border-ink">
        <span className="flex-1 truncate bg-white px-4 py-3 text-sm font-medium text-ink">
          {value}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="flex items-center gap-1.5 bg-ink px-4 text-[11px] font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#3a3a3a]"
        >
          {copied ? <TbCheck size={14} /> : <TbCopy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
