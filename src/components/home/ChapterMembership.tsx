"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  TbArrowRight,
  TbCheck,
  TbChevronDown,
  TbCrown,
  TbMedal,
  TbTrophy,
} from "react-icons/tb";
import { Container } from "@/components/ui/Container";

type TierId = "silver" | "gold" | "platinum";
type Billing = "monthly" | "annual";

type Tier = {
  id: TierId;
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  benefits: string[];
  accent: string;
  featured?: boolean;
};

const tiers: Tier[] = [
  {
    id: "silver",
    name: "Silver",
    tagline: "For the occasional guest",
    monthly: 499,
    annual: 4990,
    Icon: TbMedal,
    accent: "text-[#9fb0c4]",
    benefits: [
      "10% off every rental",
      "Free standard shipping",
      "2 Virtual Try-On credits per month",
      "Member-only sale previews",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    tagline: "For the regular reveller",
    monthly: 1299,
    annual: 12990,
    Icon: TbTrophy,
    accent: "text-[#d9b56a]",
    featured: true,
    benefits: [
      "20% off every rental",
      "Free express shipping both ways",
      "8 Virtual Try-On credits per month",
      "48-hour early access to drops",
      "Priority chat support",
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    tagline: "For the always-in-season set",
    monthly: 2499,
    annual: 24990,
    Icon: TbCrown,
    accent: "text-white",
    benefits: [
      "30% off every rental",
      "Free same-day shipping (metro)",
      "Unlimited Virtual Try-On",
      "7-day early access to drops",
      "Dedicated stylist on WhatsApp",
      "Invite-only atelier previews",
    ],
  },
];

const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function ChapterMembership() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [openId, setOpenId] = useState<TierId>("gold");

  return (
    <section
      id="chapter-membership"
      className="scroll-mt-20 bg-black py-16 text-white sm:py-20 lg:py-24"
    >
      <Container>
        {/* Centered section header */}
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-4 text-center sm:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
            Membership
          </p>
          <h2
            style={{ fontFamily: "var(--font-raleway)" }}
            className="min-h-[2.4em] whitespace-pre-line text-[clamp(1.5rem,3.5vw,2.75rem)] leading-[1.15] text-white"
          >
            <LoopingTypewriter text={"Join the circle.\nWear it more, pay less."} />
          </h2>
          <p className="max-w-xl text-sm text-white/70 sm:text-base">
            One subscription, three tiers. Rental discounts, free shipping,
            early drops and try-on credits — renew or cancel anytime.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          {/* Left — lifestyle image with overlay copy */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-xl)] bg-ink lg:aspect-auto">
            <Image
              src="/images/rental/reception.png"
              alt=""
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
          </div>

          {/* Right — billing toggle + tier accordion */}
          <div className="flex flex-col gap-6">
            <BillingToggle billing={billing} setBilling={setBilling} />

            <div className="flex flex-col gap-3">
              {tiers.map((t) => (
                <TierRow
                  key={t.id}
                  tier={t}
                  billing={billing}
                  open={openId === t.id}
                  onToggle={() =>
                    setOpenId((cur) => (cur === t.id ? ("" as TierId) : t.id))
                  }
                />
              ))}
            </div>

            <p className="text-xs text-white/55">
              Billed {billing === "monthly" ? "every month" : "once a year"}.
              Cancel anytime from your account.{" "}
              <Link
                href="/membership"
                className="font-semibold text-white underline underline-offset-4 hover:text-[#d9b56a]"
              >
                Compare all benefits
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

function BillingToggle({
  billing,
  setBilling,
}: {
  billing: Billing;
  setBilling: (b: Billing) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="inline-flex rounded-full border border-white/15 bg-white/[0.04] p-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
        {(["monthly", "annual"] as const).map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setBilling(b)}
            className={
              "rounded-full px-4 py-2 transition-colors " +
              (billing === b
                ? "bg-white text-ink"
                : "text-white/65 hover:text-white")
            }
          >
            {b}
          </button>
        ))}
      </div>
      {billing === "annual" && (
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d9b56a]">
          Save ~2 months
        </span>
      )}
    </div>
  );
}

function TierRow({
  tier,
  billing,
  open,
  onToggle,
}: {
  tier: Tier;
  billing: Billing;
  open: boolean;
  onToggle: () => void;
}) {
  const price = billing === "monthly" ? tier.monthly : tier.annual;
  const cadence = billing === "monthly" ? "/mo" : "/yr";

  return (
    <div
      className={
        "overflow-hidden rounded-[var(--radius-lg)] border transition-colors " +
        (open
          ? "border-white/25 bg-white/[0.06]"
          : "border-white/10 bg-white/[0.03] hover:border-white/20")
      }
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
      >
        <tier.Icon size={22} className={tier.accent} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold uppercase tracking-[0.12em] text-white">
              {tier.name}
            </span>
            {tier.featured && (
              <span className="rounded-full bg-[#d9b56a]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#d9b56a]">
                Most popular
              </span>
            )}
          </div>
          <span className="truncate text-[12px] text-white/60">
            {tier.tagline}
          </span>
        </div>
        <div className="flex items-baseline gap-1 tabular-nums">
          <span className="text-lg font-semibold text-white">{money(price)}</span>
          <span className="text-[11px] text-white/60">{cadence}</span>
        </div>
        <TbChevronDown
          size={18}
          className={
            "shrink-0 text-white/60 transition-transform " +
            (open ? "rotate-180" : "")
          }
        />
      </button>

      {open && (
        <div className="border-t border-white/10 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {tier.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-white/90">
                <TbCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-[#d9b56a]"
                  strokeWidth={2.5}
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href={`/membership/subscribe?tier=${tier.id}&billing=${billing}`}
              className="inline-flex items-center gap-2 bg-white px-6 py-3 text-[12px] font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-brand hover:text-white"
            >
              Subscribe
              <TbArrowRight size={14} />
            </Link>
            <Link
              href={`/membership#${tier.id}`}
              className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/65 underline-offset-[6px] hover:text-white hover:underline"
            >
              See all benefits
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* Always-on typewriter — types the heading, holds, erases, holds, repeats.
   Unlike the AiToolkitStrip version, this one is not gated by IntersectionObserver
   because the user wants it to animate continuously. */
function LoopingTypewriter({
  text,
  typeSpeed = 60,
  eraseSpeed = 30,
  holdAfterTypeMs = 1800,
  holdAfterEraseMs = 500,
}: {
  text: string;
  typeSpeed?: number;
  eraseSpeed?: number;
  holdAfterTypeMs?: number;
  holdAfterEraseMs?: number;
}) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    let cancelled = false;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => window.setTimeout(resolve, ms));

    const run = async () => {
      while (!cancelled) {
        for (let i = 1; i <= text.length; i++) {
          if (cancelled) return;
          setShown(text.slice(0, i));
          await wait(typeSpeed);
        }
        await wait(holdAfterTypeMs);
        if (cancelled) return;
        for (let i = text.length - 1; i >= 0; i--) {
          if (cancelled) return;
          setShown(text.slice(0, i));
          await wait(eraseSpeed);
        }
        await wait(holdAfterEraseMs);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [text, typeSpeed, eraseSpeed, holdAfterTypeMs, holdAfterEraseMs]);

  return (
    <>
      {shown}
      <span
        aria-hidden
        className="ml-0.5 inline-block h-[0.85em] w-[2px] translate-y-[0.08em] animate-pulse bg-white align-middle"
      />
    </>
  );
}
