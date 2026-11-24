"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/mock-data";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/utils";

export function NewArrivalsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hand-picked new arrivals: four traditional pieces + one co-ord set.
  const featuredSlugs = [
    "rosewood-bridal-lehenga",
    "midnight-zardozi-sherwani",
    "blush-organza-saree",
    "ivory-pearl-bandhgala",
    "olive-linen-co-ord",
  ];
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const newArrivals = featuredSlugs
    .map((slug) => bySlug.get(slug))
    .filter((p): p is Product => Boolean(p));

  const scrollByPage = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section
      id="new-arrivals"
      className="scroll-mt-20 bg-bg py-14 sm:py-16 lg:py-20"
    >
      {/* Centered heading */}
      <div className="mb-8 text-center">
        <h2 className="font-sans text-xl uppercase tracking-[0.15em] text-ink sm:text-2xl lg:text-3xl">
          New Arrivals
        </h2>
      </div>

      {/* Scrolling row */}
      <div className="relative">
        <div ref={scrollRef} className="no-scrollbar overflow-x-auto scroll-smooth">
          <div className="flex gap-4 px-4 sm:gap-5 sm:px-6 lg:px-10">
            {newArrivals.map((p) => (
              <ArrivalCard key={p.id} product={p} />
            ))}
            <div className="w-1 shrink-0 sm:w-4 lg:w-6" aria-hidden />
          </div>
        </div>

        {/* Prev arrow */}
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          aria-label="Scroll arrivals left"
          className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink/80 text-white backdrop-blur transition-colors hover:bg-ink sm:flex lg:left-5"
        >
          <Chevron direction="left" />
        </button>

        {/* Next arrow */}
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          aria-label="Scroll arrivals right"
          className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink/80 text-white backdrop-blur transition-colors hover:bg-ink sm:flex lg:right-5"
        >
          <Chevron direction="right" />
        </button>
      </div>
    </section>
  );
}

function ArrivalCard({ product }: { product: Product }) {
  const minRental = product.rentalPricing?.[0];
  return (
    <Link
      href={`/p/${product.slug}`}
      className="group relative flex w-[220px] shrink-0 flex-col gap-3 sm:w-[260px] lg:w-[300px]"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-surface">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="300px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {product.tags?.includes("New") && (
          <span className="absolute left-3 top-3 bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
            New
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 px-0.5">
        <h3 className="line-clamp-1 font-sans text-sm text-ink group-hover:text-brand sm:text-base">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          {product.price != null ? (
            <span className="text-sm font-semibold text-ink">
              {formatINR(product.price)}
            </span>
          ) : minRental ? (
            <span className="text-sm font-semibold text-ink">
              Rent from {formatINR(minRental.price)}
            </span>
          ) : null}
          {product.mrp && product.price && product.mrp > product.price && (
            <span className="text-xs text-ink-subtle line-through">
              {formatINR(product.mrp)}
            </span>
          )}
        </div>
      </div>
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
