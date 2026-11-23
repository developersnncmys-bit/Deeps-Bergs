"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { products } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Slide = {
  key: "her" | "him";
  label: string;
  heroSrc: string;
  heroAlt: string;
  heroHref: string;
  textEyebrow: string;
  textTitle: string;
  textCtaHref: string;
  productIds: string[];
};

const slides: Slide[] = [
  {
    key: "her",
    label: "For her",
    heroSrc: "/images/her/her1.png",
    heroAlt: "For her — signature edit",
    heroHref: "/s/wedding?for=her",
    textEyebrow: "This week · For her",
    textTitle: "Heirloom pieces, honest fabrics.",
    textCtaHref: "/search?mode=buy&for=her",
    productIds: ["p-001", "p-002", "p-004", "p-006", "p-008"],
  },
  {
    key: "him",
    label: "For him",
    heroSrc: "/images/him/him1.png",
    heroAlt: "For him — signature edit",
    heroHref: "/s/wedding?for=him",
    textEyebrow: "This week · For him",
    textTitle: "Crafted essentials, enduring edits.",
    textCtaHref: "/search?mode=buy&for=him",
    productIds: ["p-003", "p-010", "p-013", "p-011", "p-012"],
  },
];

function lookup(ids: string[]): Product[] {
  return ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));
}

type BuyGalleryProps = {
  onSlideChange?: (key: Slide["key"]) => void;
};

export function BuyGallery({ onSlideChange }: BuyGalleryProps = {}) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const slideProducts = lookup(slide.productIds);
  const isDark = slide.key === "him";

  useEffect(() => {
    onSlideChange?.(slide.key);
  }, [slide.key, onSlideChange]);

  const go = (i: number) => setIndex(((i % slides.length) + slides.length) % slides.length);

  return (
    <div>
      {/* Her / Him tabs */}
      <div className="mb-8 flex items-center justify-center gap-8">
        {slides.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => go(i)}
            className={cn(
              "border-b pb-1 text-xs font-semibold uppercase tracking-[0.25em] transition-colors",
              i === index
                ? isDark
                  ? "border-white text-white"
                  : "border-ink text-ink"
                : isDark
                  ? "border-transparent text-white/50 hover:text-white"
                  : "border-transparent text-ink-subtle hover:text-ink"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Editorial layout — big hero (left) + 3×2 grid (right) */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_6fr]">
        {/* Big hero */}
        <Link
          key={slide.key + "-hero"}
          href={slide.heroHref}
          className="group relative aspect-[3/4] overflow-hidden bg-surface lg:aspect-auto lg:h-full"
        >
          <Image
            src={slide.heroSrc}
            alt={slide.heroAlt}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            priority={index === 0}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <p className="font-sans text-2xl leading-tight sm:text-3xl">
              The Signature
              <br />
              Edit
            </p>
            <span className="mt-4 inline-block text-xs font-medium uppercase tracking-[0.2em] underline underline-offset-[6px]">
              {slide.label} &middot; View more
            </span>
          </div>
        </Link>

        {/* 3×2 grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {/* Text card as first cell */}
          <div className="flex aspect-[4/5] flex-col justify-between border border-line bg-surface p-5">
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-subtle">
                {slide.textEyebrow}
              </p>
              <h3 className="font-sans text-xl text-ink sm:text-2xl">
                {slide.textTitle}
              </h3>
            </div>
            <Link
              href={slide.textCtaHref}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-brand hover:text-brand-dark"
            >
              Shop all &rarr;
            </Link>
          </div>

          {slideProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* Prev / Next + counter */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Previous slide"
          className={cn(
            "flex h-10 w-10 items-center justify-center border transition-colors",
            isDark
              ? "border-white/30 text-white hover:border-white"
              : "border-line text-ink hover:border-ink"
          )}
        >
          <Chevron direction="left" />
        </button>
        <span
          className={cn(
            "text-xs tabular-nums transition-colors",
            isDark ? "text-white/70" : "text-ink-muted"
          )}
        >
          {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Next slide"
          className={cn(
            "flex h-10 w-10 items-center justify-center border transition-colors",
            isDark
              ? "border-white/30 text-white hover:border-white"
              : "border-line text-ink hover:border-ink"
          )}
        >
          <Chevron direction="right" />
        </button>
      </div>
    </div>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
