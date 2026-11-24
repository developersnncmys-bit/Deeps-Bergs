"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function ChapterModeSplit() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Section is 300vh. Sticky stage pins for the first 200vh of scroll.
      const scrolled = -rect.top;
      const stickyRange = vh * 2;
      setProgress(clamp01(scrolled / stickyRange));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // 0.00 – 0.35  → quote visible, cards hidden
  // 0.35 – 0.50  → quote fades out, cards fade in (padded state)
  // 0.50 – 1.00  → cards expand padded → edge-to-edge
  const quoteOpacity = 1 - smoothstep(0.25, 0.45, progress);
  const quoteTranslate = -smoothstep(0.25, 0.5, progress) * 24; // slight upward drift
  const cardsOpacity = smoothstep(0.35, 0.55, progress);
  const expansionP = smoothstep(0.5, 1.0, progress);

  const padX = (1 - expansionP) * 96;
  const gap = (1 - expansionP) * 24;
  const tileHeight = 68 + expansionP * 32; // vh

  const quoteActive = quoteOpacity > 0.05;
  const cardsActive = cardsOpacity > 0.05;

  return (
    <section
      ref={sectionRef}
      id="chapter-modes"
      className="relative bg-white"
      style={{ height: "300vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-white">
        {/* Quote layer */}
        <div
          className="absolute inset-0 flex items-center justify-center px-6 sm:px-12 lg:px-20"
          style={{
            opacity: quoteOpacity,
            transform: `translateY(${quoteTranslate}px)`,
            pointerEvents: quoteActive ? "auto" : "none",
          }}
          aria-hidden={!quoteActive}
        >
          <div className="max-w-6xl">
            <p
              className="text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.2] text-ink"
              style={{ fontFamily: "var(--font-great-vibes)" }}
            >
              Every occasion deserves its own{" "}
              <em className="not-italic text-brand-dark">silhouette</em> — borrowed,
              worn, returned. Rent is how you wear a new{" "}
              <em className="not-italic text-brand-dark">story</em> each time,
              without owning the whole closet.
            </p>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-muted">
              — Deeps &amp; Bergs, on renting
            </p>
          </div>
        </div>

        {/* Cards layer */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: cardsOpacity,
            pointerEvents: cardsActive ? "auto" : "none",
          }}
          aria-hidden={!cardsActive}
        >
          <div
            className="flex w-full"
            style={{
              paddingLeft: `${padX}px`,
              paddingRight: `${padX}px`,
              gap: `${gap}px`,
              height: `${tileHeight}vh`,
            }}
          >
            <ModeTile
              href="/shop"
              label="Buy"
              image="/images/category/bridal.png"
              caption={
                <>
                  Own the pieces that feel like you. Heritage craft,
                  <br className="hidden sm:inline" /> delivered to your door.
                </>
              }
            />
            <ModeTile
              href="/rent"
              label="Rent"
              image="/images/rental/wedding-guest.png"
              caption={
                <>
                  3-, 5- or 7-day rentals, delivered dry-cleaned.
                  <br className="hidden sm:inline" /> Deposit refunded in 3 days.
                </>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ModeTile({
  href,
  label,
  image,
  caption,
}: {
  href: string;
  label: string;
  image: string;
  caption: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative block h-full w-1/2 overflow-hidden bg-ink"
      aria-label={label}
    >
      <Image
        src={image}
        alt={label}
        fill
        sizes="50vw"
        className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/55" />

      <h2 className="absolute left-8 top-10 font-serif text-4xl tracking-tight text-white sm:left-12 sm:top-14 sm:text-5xl lg:left-16 lg:top-16 lg:text-6xl">
        {label}
      </h2>

      <div className="absolute bottom-10 left-8 right-8 flex flex-col gap-2 text-white sm:bottom-14 sm:left-12 lg:left-16">
        <p className="max-w-sm text-sm leading-relaxed text-white/90">{caption}</p>
        <span className="mt-1 inline-flex w-fit border-b border-white pb-0.5 text-sm font-medium">
          View More
        </span>
      </div>
    </Link>
  );
}
