"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Pinned scroll reveal — two slide-ins.
 *
 *   t = 0           t ≈ 0.4             t ≈ 0.75              t = 1
 *   ┌────────┐      ┌────┬────┐          ┌────┬────┐           ┌────┬────┐
 *   │  FULL  │  →   │IMG1│P 1 │   →     │IMG2│P 1 │   →       │IMG2│P 2 │
 *   │  IMG1  │      │    │    │          │    │    │           │    │    │
 *   └────────┘      └────┴────┘          └────┴────┘           └────┴────┘
 *   Scene-1         Scene-2 panel        Panel 1 exits LEFT    Scene-3 panel
 *   over image      slides in →          Panel 2 slides in →   at rest
 *
 * Both reveals happen with the same horizontal slide — the second one is a
 * conveyor swap: panel 1 slides out to the left and panel 2 takes its place.
 */

const IMAGE_1 = "/images/chapterv1.png";
const IMAGE_2 = "/images/chapterv2.png";

export function ChapterStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        setProgress(0);
        return;
      }
      const scrolled = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / total));
      setProgress(p);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
  const easeOut = (x: number) => 1 - Math.pow(1 - x, 2);
  const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

  // Two slide moments, each eased
  const slide1 = easeOut(range(progress, 0.05, 0.4)); // image shifts left, panel-1 enters
  const slide2 = easeOut(range(progress, 0.6, 0.9));  // panel-1 exits left, panel-2 enters

  // Scene-1 headline fades as the first slide starts
  const scene1Op = 1 - range(progress, 0.15, 0.35);

  // Scene-2 copy opacity — stays at 1 while panel-1 is in view,
  // slide2 drags the whole panel-1 away so no separate fade is needed.
  const scene2Op = range(progress, 0.33, 0.45);

  // Scene-3 copy fades in slightly before panel-2 lands
  const scene3Op = range(progress, 0.72, 0.9);

  // Image cross-fade happens alongside the second slide
  const image2Op = slide2;

  // Panel transforms
  // Panel 1 slides in during slide1, then holds at its right-half position.
  // Panel 2 slides in during slide2 and covers Panel 1 by document order.
  // This keeps the image visible on the left throughout.
  const panel1X = (1 - slide1) * 100; // 100 → 0, holds
  const panel2X = (1 - slide2) * 100; // 100 → 0

  return (
    <section
      ref={sectionRef}
      id="chapter-story"
      // Match surrounding light sections so the thin band below the sticky image
      // during section entry/exit blends with the previous section's bg instead of
      // flashing black before the pinned stage engages.
      className="relative bg-bg"
      style={{ height: "300vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* ── Image layer ── */}
        <div
          className="absolute inset-y-0 left-0 h-full w-full"
          style={{ transform: `translateX(${-slide1 * 25}vw)` }}
        >
          <Image
            src={IMAGE_1}
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover"
            style={{ opacity: 1 - image2Op }}
          />
          <Image
            src={IMAGE_2}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            style={{ opacity: image2Op }}
          />
          {/* Soft darken only at the bottom third so the Scene-1 headline stays legible,
              keeps the top of the image bright and undisturbed. */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40" />
        </div>

        {/* ── Scene 1: headline + attribution anchored near the bottom, above the scene dots ── */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-16 z-20 flex flex-col items-center gap-4 px-6 text-center text-white"
          style={{
            opacity: scene1Op,
            transform: `translateX(${-slide1 * 25}vw)`,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-raleway)",
              textShadow: "0 2px 24px rgba(0,0,0,0.45)",
            }}
            className="max-w-3xl text-[clamp(1.25rem,3.5vw,2.75rem)] font-medium leading-[1.1]"
          >
            The finest craft is quiet.
            <br />
            For the few who notice.
          </h2>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/85"
            style={{ textShadow: "0 2px 24px rgba(0,0,0,0.45)" }}
          >
            — The Deeps &amp; Bergs
          </p>
        </div>

        {/* ── Panel 1 (Scene 2) — slides in from right, then slides out left ── */}
        <div
          className="absolute inset-y-0 right-0 flex w-1/2 items-center bg-white"
          style={{ transform: `translateX(${panel1X}%)` }}
        >
          <div
            className="flex w-full flex-col gap-6 px-8 sm:px-12 lg:px-16"
            style={{ opacity: scene2Op }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-muted">
              Born in India
            </p>
            <h2
              style={{ fontFamily: "var(--font-raleway)" }}
              className="text-[clamp(1.5rem,3.25vw,2.75rem)] font-medium leading-[1.1] text-ink"
            >
              Where tradition
              <br />
              becomes wearable.
            </h2>
            <p className="max-w-md text-sm text-ink-muted sm:text-base">
              Our silhouettes trace the lines of classical Indian dress —
              reworked for today. Each piece is a conversation between
              heirloom and present.
            </p>
            <Link
              href="/collections"
              className="group inline-flex items-center gap-2 self-start text-[12px] font-semibold uppercase tracking-[0.22em] text-ink"
            >
              <span className="border-b border-ink pb-1 transition-colors group-hover:border-brand group-hover:text-brand">
                Discover our Collection
              </span>
              <span aria-hidden className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>

        {/* ── Panel 2 (Scene 3) — slides in from right after panel 1 exits ── */}
        <div
          className="absolute inset-y-0 right-0 flex w-1/2 items-center bg-white"
          style={{ transform: `translateX(${panel2X}%)` }}
        >
          <div
            className="flex w-full flex-col gap-6 px-8 sm:px-12 lg:px-16"
            style={{ opacity: scene3Op }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-muted">
              Deliberate by design
            </p>
            <h2
              style={{ fontFamily: "var(--font-raleway)" }}
              className="text-[clamp(1.35rem,3vw,2.5rem)] font-medium leading-[1.1] text-ink"
            >
              A fragment of the city,
              <br />
              carried into the world.
            </h2>
            <p className="max-w-md text-sm text-ink-muted sm:text-base">
              Every edition is one of one — hand-embroidered over weeks in our
              atelier. The stitch count is the quiet part; the way it sits on
              you is the point.
            </p>
            <Link
              href="/collections/limited"
              className="group inline-flex items-center gap-2 self-start text-[12px] font-semibold uppercase tracking-[0.22em] text-ink"
            >
              <span className="border-b border-ink pb-1 transition-colors group-hover:border-brand group-hover:text-brand">
                Discover the Edition
              </span>
              <span aria-hidden className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>

        {/* Scene dots */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-2">
          {[0.1, 0.5, 0.9].map((anchor, i) => {
            const active = Math.abs(progress - anchor) < 0.2;
            return (
              <span
                key={i}
                className={
                  "h-1.5 w-6 transition-colors " +
                  (active ? "bg-white" : "bg-white/30")
                }
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
