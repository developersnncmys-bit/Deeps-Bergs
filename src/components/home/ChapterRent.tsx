"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { looks } from "@/lib/mock-data";
// LooksCarousel import — kept commented alongside the hidden section below.
// import { LooksCarousel } from "@/components/home/LooksCarousel";

const occasions = [
  { src: "/images/rental/sangeet.png", label: "Sangeet Night" },
  { src: "/images/rental/reception.png", label: "Reception" },
  { src: "/images/rental/Mehendi.png", label: "Mehendi" },
  { src: "/images/rental/cocktail.png", label: "Cocktail" },
];

export function ChapterRent() {
  return (
    <section
      id="chapter-rent"
      // relative z-10 + opaque bg so this section slides up over the sticky
      // ChapterCategories (z-0). No border-t — it reads as a flicker line
      // during the slide.
      className="relative z-10 scroll-mt-20 bg-bg pt-16 sm:pt-20 lg:pt-24"
    >
      <Container className="lg:max-w-none">
        {/* ── Row 1 ── Editorial hero: text (left) + big image (right) ── */}
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          {/* Left — text + CTA */}
          <div className="flex flex-col items-start gap-6 lg:pl-[60px] lg:pr-4 lg:pt-20">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-dark">
              Wear it once · Return it clean
            </p>

            <h2
              className="whitespace-pre-line text-[clamp(3.5rem,7vw,6rem)] leading-[0.95] text-brand-dark"
              style={{ fontFamily: "var(--font-great-vibes)" }}
            >
              <Typewriter text={"Rent the\nOccasion."} />
            </h2>

            <p className="max-w-md text-base text-ink-muted">
              3-, 5- or 7-day rentals, delivered dry-cleaned. Deposit refunded
              within 3 working days. Pick your dates, we handle the rest.
            </p>

            <Link
              href="/rent"
              className="mt-2 inline-flex items-center bg-ink px-10 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-brand"
            >
              Browse Rentals
            </Link>
          </div>

          {/* Right — big hero image with overlay */}
          <div className="relative aspect-[5/4] w-full overflow-hidden bg-surface lg:aspect-[4/3]">
            <Image
              src="/images/rental/wedding-guest.png"
              alt="Wedding Guest rental edit"
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/75">
                  The Edit
                </span>
                <span className="mt-1 font-serif text-2xl sm:text-3xl">
                  Wedding Guest
                </span>
              </div>
              <Link
                href="/rent?occasion=wedding-guest"
                className="rounded-full border border-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-ink"
              >
                Shop
              </Link>
            </div>
          </div>
        </div>

        {/* ── Row 1b ── Clean 4-up occasion thumbnails ── */}
        <div className="mt-10 grid grid-cols-2 gap-4 sm:mt-14 sm:grid-cols-4 sm:gap-5">
          {occasions.map((o) => (
            <Link
              key={o.src}
              href={`/rent?occasion=${o.label.toLowerCase().replace(/\s+/g, "-")}`}
              className="group relative block aspect-[4/5] overflow-hidden bg-surface"
            >
              <Image
                src={o.src}
                alt={o.label}
                fill
                sizes="(min-width: 1024px) 18vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <p className="absolute inset-x-0 bottom-4 text-center font-sans text-xs font-bold uppercase tracking-[0.22em] text-white sm:bottom-5 sm:text-sm">
                {o.label}
              </p>
            </Link>
          ))}
        </div>
      </Container>

      {/* ── Row 2 ── Shop the Look (SOW B01) — own white backdrop so it reads as its own block ──
          Temporarily hidden while trying a new design. Uncomment to restore the coverflow carousel.
      <div className="mt-12 bg-white py-14 sm:mt-16 sm:py-16 lg:py-20">
        <LooksCarousel />
      </div>
      */}

      {/* ── Row 2 (NEW DESIGN) ── Shop the Look — own white backdrop so it reads as a distinct block ── */}
      <div className="mt-12 bg-white pt-14 sm:mt-16 sm:pt-16 lg:pt-20">
        <Container>
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
            <h2 className="text-2xl uppercase tracking-[0.15em] text-ink sm:text-3xl lg:text-4xl">
              Shop the Look
            </h2>
            <p className="max-w-md text-sm text-ink-muted sm:text-base">
              Curated outfits you can shop whole, or piece by piece. Rental
              items in a look share one date range.
            </p>
          </div>
        </Container>

        {/* bg.png panel below the heading — 600px tall, full width, with coverflow cards on top */}
        <div
          className="relative mt-10 h-[600px] w-full bg-cover bg-center bg-no-repeat sm:mt-14"
          style={{ backgroundImage: "url('/images/bg.png')" }}
        >
          <LooksCoverflow />
        </div>
      </div>
    </section>
  );
}

/* ──────────── Typewriter — loops: types, holds, erases, holds, repeats ──────────── */

function Typewriter({
  text,
  typeSpeed = 95,
  eraseSpeed = 40,
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
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Only animate when the heading is on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setInView(entries.some((e) => e.isIntersecting)),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, ms);
      });

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
  }, [inView, text, typeSpeed, eraseSpeed, holdAfterTypeMs, holdAfterEraseMs]);

  return (
    <span ref={ref}>
      {shown}
      <span
        aria-hidden
        className="ml-0.5 inline-block h-[0.75em] w-[3px] translate-y-1 animate-pulse bg-brand-dark align-middle"
      />
    </span>
  );
}

/* ──────────── LooksCoverflow — big centre card + smaller side cards on the bg panel ──────────── */

// Coverflow geometry — positions are computed from cumulative card widths so the
// visible edge-to-edge gap between any two neighbouring cards is constant,
// regardless of their scale.
const CARD_W = 340;                        // lg centre card width
const CARD_W_1 = Math.round(CARD_W * 0.78); // ±1 card visible width
const CARD_W_2 = Math.round(CARD_W * 0.62); // ±2 card visible width
const CARD_GAP = 28;                       // constant visible gap between neighbouring cards

const posFor = (abs: number) => {
  if (abs === 0) return 0;
  if (abs === 1) return CARD_W / 2 + CARD_GAP + CARD_W_1 / 2;
  return CARD_W / 2 + CARD_GAP + CARD_W_1 + CARD_GAP + CARD_W_2 / 2;
};

function LooksCoverflow() {
  const [active, setActive] = useState(0);
  const total = looks.length;

  const go = (dir: 1 | -1) => setActive((i) => (i + dir + total) % total);
  const goTo = (i: number) => setActive(((i % total) + total) % total);

  const relOffset = (i: number) => {
    let d = i - active;
    if (d > total / 2) d -= total;
    if (d < -total / 2) d += total;
    return d;
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="relative flex h-full items-center justify-center">
        {looks.map((l, i) => {
          const d = relOffset(i);
          const abs = Math.abs(d);
          if (abs > 2) return null;

          const translate = Math.sign(d) * posFor(abs);
          const scale = abs === 0 ? 1 : abs === 1 ? 0.78 : 0.62;
          const opacity = 1;
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
                  <LookCoverCard look={l} active />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show ${l.name}`}
                  className="cursor-pointer"
                >
                  <LookCoverCard look={l} active={false} />
                </button>
              )}
            </div>
          );
        })}

        {/* Prev / Next — pinned to the panel's screen edges, past the ±2 cards */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous look"
          className="absolute left-4 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/70 lg:left-8"
        >
          <CoverChevron direction="left" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next look"
          className="absolute right-4 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/70 lg:right-8"
        >
          <CoverChevron direction="right" />
        </button>
      </div>
    </div>
  );
}

function LookCoverCard({
  look,
  active,
}: {
  look: (typeof looks)[number];
  active: boolean;
}) {
  const itemCount = look.productIds.length;
  return (
    <div className="group relative flex aspect-[3/5] w-[260px] overflow-hidden bg-surface shadow-xl sm:w-[300px] lg:w-[340px]">
      <Image
        src={look.coverImage}
        alt={look.name}
        fill
        sizes="340px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

      {active && (
        <span className="absolute right-4 top-4 bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-ink">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      )}

      {active && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-6 text-center text-white">
          <p className="text-xl font-bold uppercase tracking-[0.12em]">
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

function CoverChevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path
        d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
