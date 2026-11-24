"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Slide = {
  src: string;
  eyebrow: string;
  headline: string[];               // one entry per line
  body: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

const banners: Slide[] = [
  // Slide 1 — Buy-focused. Women in gold/festive imagery.
  {
    src: "/images/bannerv3.png",
    eyebrow: "Winter '26 Edit",
    headline: ["Own the occasion."],
    body: "Heritage silhouettes, crafted to last. The pieces you'll return to, wedding after wedding.",
    primaryCta: { label: "Shop the Collection", href: "/s/wedding" },
    secondaryCta: { label: "Scroll to explore ↓", href: "#chapter-buy" },
  },
  // Slide 2 — Rent-focused. Men in printed kurtas.
  {
    src: "/images/bannerv9.png",
    eyebrow: "The Rental Edit",
    headline: ["Wear it once.", "Return it clean."],
    body: "3-, 5- or 7-day rentals. Dry-cleaned, delivered, and the deposit is back in 3 days.",
    primaryCta: { label: "Browse Rentals", href: "/rent" },
    secondaryCta: { label: "How it works ↓", href: "#chapter-rent" },
  },
];

const ROTATE_MS = 6000;

export function ChapterPromise() {
  const [index, setIndex] = useState(0);

  // Auto-rotate
  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, ROTATE_MS);
    return () => clearTimeout(id);
  }, [index]);

  const current = banners[index];

  return (
    <section
      id="chapter-promise"
      className="relative flex h-[calc(100svh-120px)] w-full items-end overflow-hidden"
    >
      {/* Rotating background images */}
      {banners.map((b, i) => (
        <Image
          key={b.src}
          src={b.src}
          alt=""
          fill
          sizes="100vw"
          priority={i === 0}
          className={cn(
            "object-cover transition-opacity duration-1000 ease-in-out",
            i === index ? "opacity-100" : "opacity-0"
          )}
        />
      ))}

      {/* Text block — re-mounts with key={index} so the animate-fade-in util
          re-triggers on each slide change */}
      <div
        key={index}
        className="animate-fade-in relative ml-[50px] flex w-full max-w-[36rem] flex-col items-start gap-5 px-4 pb-[130px] text-white sm:px-6 sm:pb-[150px] lg:px-8 lg:pb-[170px]"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/85">
          {current.eyebrow}
        </span>

        <h1
          style={{ fontFamily: "var(--font-italiana)", WebkitTextStroke: "0" }}
          className="text-[clamp(2.25rem,5.5vw,4.25rem)] font-normal leading-[1.05] tracking-normal text-white/95"
        >
          {current.headline.map((line, i) => (
            <span key={i} className="block whitespace-nowrap">
              {line}
            </span>
          ))}
        </h1>

        <p className="max-w-md text-sm text-white/85 sm:text-[15px]">
          {current.body}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-5">
          <LinkButton
            href={current.primaryCta.href}
            size="md"
            style={{ fontFamily: "var(--font-raleway)" }}
            className="!rounded-none bg-white px-7 text-[12px] font-black uppercase tracking-[0.18em] text-ink hover:bg-white/90"
          >
            {current.primaryCta.label}
          </LinkButton>
          <LinkButton
            href={current.secondaryCta.href}
            size="md"
            variant="ghost"
            style={{ fontFamily: "var(--font-raleway)" }}
            className="!rounded-none px-2 text-[12px] font-black uppercase tracking-[0.18em] text-white underline-offset-[6px] hover:bg-transparent hover:underline"
          >
            {current.secondaryCta.label}
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
