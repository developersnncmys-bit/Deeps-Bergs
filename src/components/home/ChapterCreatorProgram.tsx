"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { creators } from "@/lib/mock-data";
import { TbArrowUpRight } from "react-icons/tb";

const AUTO_SCROLL_MS = 1800;

export function ChapterCreatorProgram() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const el = scrollRef.current;
    if (!el) return;

    const id = window.setInterval(() => {
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: el.clientWidth / 4 + 20, behavior: "smooth" });
      }
    }, AUTO_SCROLL_MS);

    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <section
      id="chapter-creator-program"
      className="scroll-mt-20 bg-black py-16 text-white sm:py-20 lg:py-24"
    >
      {/* Heading + CTA */}
      <Container>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
            For creators
          </p>
          <h2
            style={{ fontFamily: "var(--font-raleway)" }}
            className="text-[clamp(1.5rem,3.5vw,2.75rem)] leading-[1.15] text-white"
          >
            Collect, nurture, and grow
            <br />
            your style community.
          </h2>
          <p className="max-w-xl text-sm text-white/70 sm:text-base">
            Build a storefront, tag products in your reels and earn commission
            on every sale. Unique affiliate links and discount codes — no
            spreadsheets, no invoicing.
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/creators/apply"
              className="inline-flex items-center gap-2 bg-white px-8 py-4 text-[12px] font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-white/90"
            >
              Apply as a creator
            </Link>
            <Link
              href="/creators"
              className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/80 underline-offset-[6px] hover:text-white hover:underline"
            >
              See how it works
            </Link>
          </div>
        </div>
      </Container>

      {/* Creator strip */}
      <div className="relative mt-12 sm:mt-16">
        <div
          ref={scrollRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
          className="no-scrollbar overflow-x-auto scroll-smooth py-8"
        >
        <div className="flex snap-x snap-mandatory gap-4 px-4 sm:gap-5 sm:px-6 lg:px-10">
          {creators.map((c) => (
            <Link
              key={c.id}
              href={`/creators/${c.handle}`}
              className="group relative aspect-[3/4] w-[70vw] shrink-0 snap-start overflow-hidden rounded-[var(--radius-xl)] bg-surface shadow-[0_25px_60px_-15px_rgba(255,255,255,0.18)] ring-1 ring-white/10 sm:w-[42vw] lg:w-[22vw]"
            >
              <Image
                src={c.cover}
                alt={c.name}
                fill
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 42vw, 70vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Creator chip — bottom left */}
              <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/90 bg-transparent py-1 pl-1 pr-3 text-[11px] font-semibold text-white">
                <span className="relative h-5 w-5 overflow-hidden rounded-full">
                  <Image src={c.avatar} alt="" fill sizes="20px" className="object-cover" />
                </span>
                @{c.handle}
              </span>
            </Link>
          ))}

          {/* Join card — final slot */}
          <Link
            href="/creators/apply"
            className="group relative flex aspect-[3/4] w-[70vw] shrink-0 snap-start flex-col items-center justify-center gap-4 rounded-[var(--radius-xl)] border border-white/15 bg-white/[0.04] p-6 text-center text-white shadow-2xl transition-colors hover:bg-white/[0.08] sm:w-[42vw] lg:w-[22vw]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white transition-colors group-hover:bg-brand-dark">
              <TbArrowUpRight size={22} strokeWidth={2} />
            </span>
            <p className="font-sans text-lg uppercase tracking-[0.1em]">
              Your name
              <br />
              goes here
            </p>
            <p className="text-xs text-white/60">
              Start your storefront in minutes.
            </p>
          </Link>

          <div className="w-4 shrink-0 sm:w-6 lg:w-10" aria-hidden />
        </div>
        </div>

        {/* Prev / Next arrows */}
        <button
          type="button"
          onClick={() => scrollRef.current?.scrollBy({ left: -(scrollRef.current.clientWidth / 4 + 20), behavior: "smooth" })}
          aria-label="Previous creators"
          className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition-colors hover:border-white hover:bg-white/20 sm:flex lg:left-5"
        >
          <Chevron direction="left" />
        </button>
        <button
          type="button"
          onClick={() => scrollRef.current?.scrollBy({ left: scrollRef.current.clientWidth / 4 + 20, behavior: "smooth" })}
          aria-label="Next creators"
          className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition-colors hover:border-white hover:bg-white/20 sm:flex lg:right-5"
        >
          <Chevron direction="right" />
        </button>
      </div>
    </section>
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
