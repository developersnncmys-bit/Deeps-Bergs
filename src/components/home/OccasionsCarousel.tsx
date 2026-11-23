"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";

type Occasion = { slug: string; label: string; image: string };

const occasions: Occasion[] = [
  { slug: "wedding-guest", label: "Wedding Guest", image: "/images/rental/wedding-guest.png" },
  { slug: "sangeet", label: "Sangeet Night", image: "/images/rental/sangeet.png" },
  { slug: "reception", label: "Reception", image: "/images/rental/reception.png" },
  { slug: "mehendi", label: "Mehendi", image: "/images/rental/Mehendi.png" },
  { slug: "cocktail", label: "Cocktail", image: "/images/rental/cocktail.png" },
  { slug: "festive-daywear", label: "Festive Daywear", image: "/images/rental/festive.png" },
];

export function OccasionsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByPage = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div>
      {/* Centered heading, no "See all" */}
      <div className="mb-6 text-center">
        <h3 className="font-sans text-xl text-ink sm:text-2xl">
          Rent by the occasion
        </h3>
      </div>

      <div className="relative">
        {/* Scrollable row */}
        <div ref={scrollRef} className="no-scrollbar overflow-x-auto scroll-smooth">
          <div className="flex gap-4 px-4 sm:gap-5 sm:px-6 lg:px-10">
            {occasions.map((o) => (
              <OccasionCard key={o.slug} occasion={o} />
            ))}
            <div className="w-1 shrink-0 sm:w-4 lg:w-6" aria-hidden />
          </div>
        </div>

        {/* Prev arrow — desktop only (mobile uses touch) */}
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          aria-label="Scroll occasions left"
          className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 text-ink shadow-md backdrop-blur transition-colors hover:border-ink hover:bg-white sm:flex lg:left-5"
        >
          <Chevron direction="left" />
        </button>

        {/* Next arrow */}
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          aria-label="Scroll occasions right"
          className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 text-ink shadow-md backdrop-blur transition-colors hover:border-ink hover:bg-white sm:flex lg:right-5"
        >
          <Chevron direction="right" />
        </button>
      </div>
    </div>
  );
}

function OccasionCard({ occasion }: { occasion: Occasion }) {
  return (
    <Link
      href={`/rent?occasion=${occasion.slug}`}
      className="group flex w-[240px] shrink-0 flex-col gap-3 sm:w-[280px] lg:w-[320px]"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-[28px] bg-surface">
        <Image
          src={occasion.image}
          alt={occasion.label}
          fill
          sizes="320px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <p className="font-sans text-base text-ink group-hover:text-brand sm:text-lg">
        {occasion.label}
      </p>
    </Link>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
