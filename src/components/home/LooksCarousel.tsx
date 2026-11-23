"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { looks } from "@/lib/mock-data";
import type { Look } from "@/lib/types";

const STEP = 220; // horizontal offset in px between neighbouring cards — side cards tuck slightly behind center (coverflow style)

export function LooksCarousel() {
  const [active, setActive] = useState(0);
  const total = looks.length;

  const go = (dir: 1 | -1) => setActive((i) => (i + dir + total) % total);
  const goTo = (i: number) => setActive(((i % total) + total) % total);

  // Shortest signed distance so the ring wraps in both directions
  const relOffset = (i: number) => {
    let d = i - active;
    if (d > total / 2) d -= total;
    if (d < -total / 2) d += total;
    return d;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Centered header */}
      <div className="px-4 text-center sm:px-6 lg:px-10">
        <h2 className="font-sans text-2xl uppercase tracking-[0.15em] text-ink sm:text-3xl">
          Shop the Look
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
          Curated outfits you can shop whole, or piece by piece. Rental items
          in a look share one date range.
        </p>
      </div>

      {/* Coverflow stage */}
      <div className="relative h-[410px] w-full overflow-hidden sm:h-[460px] lg:h-[540px]">
        <div className="absolute inset-0 flex items-center justify-center">
          {looks.map((l, i) => {
            const d = relOffset(i);
            const abs = Math.abs(d);
            if (abs > 2) return null;

            const translate = d * STEP;
            const scale = abs === 0 ? 1 : abs === 1 ? 0.88 : 0.76;
            const opacity = abs === 0 ? 1 : abs === 1 ? 0.8: 0.35;
            const z = 30 - abs * 10;
            const isActive = abs === 0;

            return (
              <div
                key={l.id}
                className="absolute transition-all duration-500 ease-out"
                style={{
                  transform: `translateX(${translate}px) scale(${scale})`,
                  opacity,
                  zIndex: z,
                }}
              >
                {isActive ? (
                  <Link href={`/looks/${l.slug}`} aria-label={l.name}>
                    <LookCard look={l} active />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Show ${l.name}`}
                    className="cursor-pointer"
                  >
                    <LookCard look={l} active={false} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Prev / Next controls — anchored over the ±2 (edge-most visible) cards */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous look"
          style={{ left: "max(1rem, calc(50% - 560px))" }}
          className="absolute top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/70"
        >
          <Chevron direction="left" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next look"
          style={{ right: "max(1rem, calc(50% - 560px))" }}
          className="absolute top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/70"
        >
          <Chevron direction="right" />
        </button>
      </div>

    </div>
  );
}

function LookCard({ look, active }: { look: Look; active: boolean }) {
  const itemCount = look.productIds.length;
  return (
    <div className="group relative flex aspect-[3/5] w-[230px] overflow-hidden rounded-[22px] bg-surface shadow-lg sm:w-[260px] lg:w-[300px]">
      <Image
        src={look.coverImage}
        alt={look.name}
        fill
        sizes="340px"
        className="object-cover"
      />

      {/* Gradient — only at the bottom for active card label */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      {/* Item-count pill — only on the active card */}
      {active && (
        <span className="absolute right-4 top-4 bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-ink">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      )}

      {/* Active card label + CTA */}
      {active && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-6 text-center text-white">
          <p className="font-sans text-xl font-bold uppercase tracking-[0.12em]">
            {look.name}
          </p>
          <span className="inline-flex items-center border border-white/90 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] transition-colors group-hover:bg-white group-hover:text-ink">
            Shop the Look
          </span>
        </div>
      )}
    </div>
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
