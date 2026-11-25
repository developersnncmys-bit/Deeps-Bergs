"use client";

import { useState } from "react";
import {
  TbCrown,
  TbSparkles,
  TbTruckDelivery,
  TbRotate2,
  TbPercentage,
  TbCamera,
  TbHeadset,
  TbCircleCheckFilled,
  TbCheck,
} from "react-icons/tb";
import { formatINR } from "@/lib/utils";

type TierKey = "silver" | "gold" | "platinum";

interface Tier {
  key: TierKey;
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  color: string; // swatch
  textOnColor: string;
  benefits: {
    Icon: React.ElementType;
    title: string;
    detail: string;
  }[];
}

const TIERS: Tier[] = [
  {
    key: "silver",
    name: "Silver",
    tagline: "Dip into the catalogue",
    monthly: 499,
    annual: 4990,
    color: "#c9c2b8",
    textOnColor: "#1a1a1a",
    benefits: [
      { Icon: TbPercentage, title: "5% off", detail: "on every purchase" },
      { Icon: TbTruckDelivery, title: "Free shipping", detail: "no minimums" },
      { Icon: TbCamera, title: "2 try-on credits", detail: "per month" },
    ],
  },
  {
    key: "gold",
    name: "Gold",
    tagline: "The members' favourite",
    monthly: 999,
    annual: 9990,
    color: "#c9a96a",
    textOnColor: "#1a1a1a",
    benefits: [
      { Icon: TbPercentage, title: "10% off", detail: "on every purchase" },
      { Icon: TbTruckDelivery, title: "Free priority shipping", detail: "same day in metros" },
      { Icon: TbRotate2, title: "Rental deposit waived", detail: "up to ₹10,000" },
      { Icon: TbCamera, title: "5 try-on credits", detail: "per month" },
      { Icon: TbSparkles, title: "Early access", detail: "to new drops & edits" },
    ],
  },
  {
    key: "platinum",
    name: "Platinum",
    tagline: "White-glove couture",
    monthly: 2499,
    annual: 24990,
    color: "#1a1a1a",
    textOnColor: "#f1ead9",
    benefits: [
      { Icon: TbPercentage, title: "15% off", detail: "on every purchase" },
      { Icon: TbTruckDelivery, title: "Same-day delivery", detail: "7 cities, free" },
      { Icon: TbRotate2, title: "Unlimited rental swaps", detail: "zero deposits" },
      { Icon: TbCamera, title: "Unlimited try-ons", detail: "including at-home" },
      { Icon: TbSparkles, title: "Private atelier access", detail: "preview couture ahead of launch" },
      { Icon: TbHeadset, title: "Dedicated stylist", detail: "on WhatsApp, 7 days a week" },
    ],
  },
];

// Mocked current membership — swap for real auth/user record later.
const CURRENT = {
  tier: "gold" as TierKey,
  cycle: "annual" as "monthly" | "annual",
  renewsAt: new Date(Date.now() + 112 * 24 * 60 * 60 * 1000).toISOString(),
  tryOnCreditsLeft: 3,
  tryOnCreditsTotal: 5,
};

export function MembershipPanel() {
  const [cycle, setCycle] = useState<"monthly" | "annual">(CURRENT.cycle);
  const current = TIERS.find((t) => t.key === CURRENT.tier)!;
  const renewsAt = new Date(CURRENT.renewsAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl text-ink sm:text-4xl">Membership</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Members-only pricing, deposit waivers, priority try-ons and early
          access to new drops.
        </p>
      </header>

      {/* Current tier card */}
      <section
        className="relative overflow-hidden border border-line p-6 sm:p-8"
        style={{
          background: `linear-gradient(135deg, ${current.color}22 0%, #ffffff 60%)`,
        }}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: current.color, color: current.textOnColor }}
            >
              <TbCrown size={24} />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
                Your membership
              </p>
              <p className="mt-1 font-serif text-3xl text-ink">
                {current.name}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {CURRENT.cycle === "annual" ? "Annual plan" : "Monthly plan"} ·
                Renews on {renewsAt}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
              Try-on credits left
            </p>
            <p className="mt-1 font-serif text-2xl text-ink">
              {CURRENT.tryOnCreditsLeft}
              <span className="text-base text-ink-muted">
                {" "}
                / {CURRENT.tryOnCreditsTotal}
              </span>
            </p>
            <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-line sm:ml-auto">
              <div
                className="h-full bg-ink"
                style={{
                  width: `${(CURRENT.tryOnCreditsLeft / CURRENT.tryOnCreditsTotal) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        <ul className="mt-6 grid gap-x-6 gap-y-2 border-t border-line/50 pt-5 text-sm sm:grid-cols-2">
          {current.benefits.map((b) => (
            <li key={b.title} className="flex items-start gap-3">
              <TbCircleCheckFilled
                size={16}
                className="mt-0.5 shrink-0"
                style={{ color: "var(--color-success)" }}
              />
              <span className="text-ink">
                <span className="font-semibold">{b.title}</span>{" "}
                <span className="text-ink-muted">{b.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Compare tiers */}
      <section>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl text-ink">Compare plans</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Upgrade or change your cycle any time — we prorate the switch.
            </p>
          </div>
          <div className="inline-flex self-start rounded-full border border-ink p-0.5 text-xs font-semibold sm:self-auto">
            <button
              type="button"
              onClick={() => setCycle("monthly")}
              className={`rounded-full px-4 py-1.5 transition-colors ${cycle === "monthly" ? "bg-ink text-white" : "text-ink hover:bg-bg"}`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setCycle("annual")}
              className={`rounded-full px-4 py-1.5 transition-colors ${cycle === "annual" ? "bg-ink text-white" : "text-ink hover:bg-bg"}`}
            >
              Annual
              <span className="ml-1 text-[10px] font-bold text-brand-dark">
                − 17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {TIERS.map((tier) => {
            const isCurrent = tier.key === CURRENT.tier;
            const isUpgrade =
              TIERS.findIndex((t) => t.key === tier.key) >
              TIERS.findIndex((t) => t.key === CURRENT.tier);
            const price = cycle === "annual" ? tier.annual : tier.monthly;
            return (
              <article
                key={tier.key}
                className={`relative flex flex-col overflow-hidden border bg-white transition-colors ${
                  isCurrent ? "border-ink shadow-lg" : "border-line"
                }`}
              >
                {isCurrent && (
                  <span className="absolute right-4 top-4 rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Current
                  </span>
                )}

                <div
                  className="px-6 pb-5 pt-6"
                  style={{ backgroundColor: `${tier.color}18` }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full"
                      style={{ backgroundColor: tier.color, color: tier.textOnColor }}
                    >
                      <TbCrown size={16} />
                    </span>
                    <p className="font-serif text-xl text-ink">{tier.name}</p>
                  </div>
                  <p className="mt-2 text-xs text-ink-muted">{tier.tagline}</p>
                  <p className="mt-4 flex items-baseline gap-1">
                    <span className="font-serif text-3xl text-ink">
                      {formatINR(price)}
                    </span>
                    <span className="text-xs text-ink-muted">
                      / {cycle === "annual" ? "year" : "month"}
                    </span>
                  </p>
                </div>

                <ul className="flex-1 space-y-3 px-6 py-5 text-sm">
                  {tier.benefits.map((b) => (
                    <li key={b.title} className="flex items-start gap-2">
                      <TbCheck size={16} className="mt-0.5 shrink-0 text-ink" />
                      <span className="text-ink">
                        <span className="font-semibold">{b.title}</span>{" "}
                        <span className="text-ink-muted">· {b.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-line p-5">
                  <button
                    type="button"
                    disabled={isCurrent}
                    className={`w-full py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
                      isCurrent
                        ? "cursor-default border border-line-strong bg-white text-ink-muted"
                        : isUpgrade
                          ? "bg-ink text-white hover:bg-[#3a3a3a]"
                          : "border border-ink text-ink hover:bg-ink hover:text-white"
                    }`}
                  >
                    {isCurrent
                      ? "Current plan"
                      : isUpgrade
                        ? `Upgrade to ${tier.name}`
                        : `Switch to ${tier.name}`}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Manage billing */}
      <section className="border border-line bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
              Billing & cycle
            </p>
            <p className="mt-1 text-sm text-ink">
              Next payment of{" "}
              <span className="font-semibold">
                {formatINR(current.annual)}
              </span>{" "}
              on {renewsAt}.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="border border-ink px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-white"
            >
              Update payment method
            </button>
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-wider text-ink-muted underline-offset-4 hover:text-ink hover:underline"
            >
              Cancel membership
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
