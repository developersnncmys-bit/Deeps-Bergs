"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { categories } from "@/lib/mock-data";
import type { Category } from "@/lib/types";

export function ChapterCategories() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByPage = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section
      id="chapter-categories"
      // sticky top-0 z-0 pins Categories at viewport top; ChapterRent (z-10)
      // slides up over it. Extra pb extends the "hold" — how long Categories
      // stays pinned before Rent catches up — without leaking into other
      // sections, because the parent wrapper in page.tsx now scopes the
      // sticky containing block.
      className="sticky top-0 z-0 scroll-mt-20 bg-surface pt-14 pb-48 sm:pt-16 sm:pb-64 lg:pt-20 lg:pb-80"
    >
      {/* Header row — title left, view all right */}
      <Container className="lg:max-w-none">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-sans text-xl uppercase tracking-[0.15em] text-ink sm:text-2xl lg:text-3xl">
            Shop by Category
          </h2>
          <Link
            href="/categories"
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink underline-offset-[6px] hover:underline"
          >
            View All &rarr;
          </Link>
        </div>
      </Container>

      {/* Scrolling category cards + arrows */}
      <div className="relative">
        <div ref={scrollRef} className="no-scrollbar overflow-x-auto scroll-smooth">
          <div className="flex gap-4 px-4 sm:gap-5 sm:px-6 lg:px-10">
            {categories.filter((c) => c.image).map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
            <ViewAllCard />
            <div className="w-1 shrink-0 sm:w-4 lg:w-6" aria-hidden />
          </div>
        </div>

        {/* Prev arrow */}
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          aria-label="Scroll categories left"
          className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 text-ink shadow-md backdrop-blur transition-colors hover:border-ink hover:bg-white sm:flex lg:left-5"
        >
          <Chevron direction="left" />
        </button>

        {/* Next arrow */}
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          aria-label="Scroll categories right"
          className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 text-ink shadow-md backdrop-blur transition-colors hover:border-ink hover:bg-white sm:flex lg:right-5"
        >
          <Chevron direction="right" />
        </button>
      </div>
    </section>
  );
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/c/${category.slug}`}
      className="group relative flex aspect-[3/4] w-[240px] shrink-0 overflow-hidden bg-surface sm:w-[280px] lg:w-[320px]"
    >
      <Image
        src={category.image ?? `https://picsum.photos/seed/dbf-cat-${category.slug}/600/800`}
        alt={category.name}
        fill
        sizes="320px"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />

      {/* Dark gradient at bottom for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

      {/* Text + CTA overlay */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-6 text-center text-white">
        <p className="font-sans text-xl font-bold uppercase tracking-[0.12em]">
          {category.name}
        </p>
        <span className="inline-flex items-center border border-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] transition-colors group-hover:bg-white group-hover:text-ink">
          Shop Now
        </span>
      </div>
    </Link>
  );
}

function ViewAllCard() {
  return (
    <Link
      href="/categories"
      className="group relative flex aspect-[3/4] w-[240px] shrink-0 flex-col items-center justify-center gap-4 bg-ink text-center text-white transition-colors hover:bg-ink/90 sm:w-[280px] lg:w-[320px]"
    >
      <span className="font-sans text-2xl font-bold uppercase tracking-[0.18em]">
        View All
      </span>
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 text-white transition-transform group-hover:translate-x-1">
        <Chevron direction="right" />
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
        {categories.length} Categories
      </span>
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
