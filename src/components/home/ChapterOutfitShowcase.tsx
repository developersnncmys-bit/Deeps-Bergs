"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";

const N = 10;
const PRODUCTS = Array.from(
  { length: N },
  (_, i) => `/images/3d/products/p-v${i + 1}.png`,
);
const MODELS = Array.from(
  { length: N },
  (_, i) => `/images/3d/women-model/w-v${i + 1}.png`,
);
const LABELS = [
  "Signature Edit",
  "Bridal Noir",
  "Heirloom",
  "Daywear",
  "Off Duty",
  "Ceremonial",
  "Festive",
  "Resort",
  "Soirée",
  "Atelier",
];

// Card geometry — small product cards attached edge-to-edge so the model
// stays the focal point and the strip reads as a supporting backdrop.
const CARD_W = 150;
const CARD_H = 200;
const CARD_GAP = 0; // attached, no gap
const STEP = CARD_W + CARD_GAP;
// Diagonal slope — each card's Y is a function of its horizontal distance from
// the model centre. Negative distance (card is LEFT of model) → upward shift.
// Positive distance (RIGHT of model) → downward shift. Creates a continuous
// diagonal path: products rise as they approach from the right, pass through
// centre at middle height, then keep rising after they pass to the left.
const SLOPE = 0.35;
// Clamp so far-off cards don't fly out of the stage.
const MAX_Y = 160;

// Scrolling speed in pixels/sec. One product passes every STEP / SPEED seconds.
const SPEED = 55;

// Render N products 3× so the strip spans well past the viewport on both sides —
// enough buffer for a seamless loop with offset wrap.
const COPIES = 3;
const STRIP_LEN = N * COPIES;

export function ChapterOutfitShowcase() {
  const [modelIdx, setModelIdx] = useState(0);
  // Active strip index — the one specific card in the strip currently centred
  // on the model. Lives in [N, 2N-1] (the middle copy) so the highlight is
  // stable and doesn't appear to "jump" copies at wrap.
  const [activeStripIdx, setActiveStripIdx] = useState(N);
  const stripRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      reducedMotion.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
    }
  }, []);

  useEffect(() => {
    // Set initial per-card Y positions before the first frame so the diagonal
    // is visible even if reduced-motion short-circuits the rAF loop.
    const applyInitialY = () => {
      const cards = stripRef.current?.children;
      if (!cards) return;
      for (let i = 0; i < cards.length; i++) {
        const dist = (i - N) * STEP;
        let y = dist * SLOPE;
        if (y > MAX_Y) y = MAX_Y;
        if (y < -MAX_Y) y = -MAX_Y;
        (cards[i] as HTMLElement).style.transform = `translateY(${y}px)`;
      }
    };
    applyInitialY();

    if (reducedMotion.current) return;
    let raf = 0;
    let offset = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1); // cap big jumps (tab blur, etc.)
      last = now;
      offset += SPEED * dt;

      const cycleW = N * STEP;
      if (offset >= cycleW) offset -= cycleW;

      if (stripRef.current) {
        stripRef.current.style.transform = `translate3d(${-offset}px, -50%, 0)`;

        // Per-card diagonal Y — distance from model centre * SLOPE, clamped.
        // Children of stripRef are the product cards in order.
        const cards = stripRef.current.children;
        for (let i = 0; i < cards.length; i++) {
          const dist = (i - N) * STEP - offset;
          let y = dist * SLOPE;
          if (y > MAX_Y) y = MAX_Y;
          if (y < -MAX_Y) y = -MAX_Y;
          (cards[i] as HTMLElement).style.transform = `translateY(${y}px)`;
        }
      }

      // Which source product is currently centred on the model?
      // Strip is laid out so srcIdx 0 is at model centre when offset = 0.
      // After `offset` scrolls past STEP, srcIdx 1 arrives at centre, etc.
      const steps = Math.round(offset / STEP);
      const idx = steps % N;
      setModelIdx((prev) => (prev === idx ? prev : idx));
      // The specific strip card at centre — always within the middle copy.
      const stripCentre = N + (steps % N);
      setActiveStripIdx((prev) => (prev === stripCentre ? prev : stripCentre));

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      id="chapter-outfit-showcase"
      className="scroll-mt-20 bg-white py-16 sm:py-20 lg:py-24"
    >
      <Container>
        <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-3 text-center sm:mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-dark">
            Live try-on
          </p>
          <h2
            style={{ fontFamily: "var(--font-raleway)" }}
            className="text-[clamp(1.5rem,3vw,2.5rem)] font-semibold uppercase tracking-[0.04em] leading-[1.1] text-ink"
          >
            Every piece, previewed on-body.
          </h2>
          <p className="max-w-xl text-sm text-ink-muted sm:text-base">
            Virtual try-on in real time. The outfit at centre swaps to
            whichever piece is passing — paused, styled and shown on-body
            before you commit.
          </p>
        </div>
      </Container>

      {/* Stage — full viewport width, no container, tall enough for zigzag + model */}
      <div className="relative h-[560px] w-full overflow-hidden bg-white sm:h-[640px] lg:h-[720px]">
        {/* Product strip — in the background, behind the model */}
        <div
          ref={stripRef}
          aria-hidden
          className="absolute top-1/2 z-0 flex items-center will-change-transform"
          style={{
            // Position so srcIdx 0 of the middle copy is at the horizontal centre of the stage
            left: `calc(50% - ${CARD_W / 2}px - ${N * STEP}px)`,
            gap: `${CARD_GAP}px`,
            transform: "translate3d(0, -50%, 0)",
          }}
        >
          {Array.from({ length: STRIP_LEN }, (_, i) => {
            const srcIdx = i % N;
            const isActive = i === activeStripIdx;
            return (
              <div
                key={i}
                className={
                  "relative flex shrink-0 flex-col items-center justify-between bg-white/95 p-5 shadow-sm will-change-transform transition-[border-color] duration-300 " +
                  (isActive
                    ? "border-2 border-info"
                    : "border border-black/10")
                }
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  // translateY is set per-frame by the rAF tick (diagonal slope).
                }}
              >
                <div className="relative w-full flex-1">
                  <Image
                    src={PRODUCTS[srcIdx]}
                    alt=""
                    fill
                    sizes={`${CARD_W}px`}
                    className="object-contain"
                  />
                </div>
                <p
                  className={
                    "mt-3 text-[12px] font-medium transition-colors " +
                    (isActive ? "text-info" : "text-ink")
                  }
                >
                  {LABELS[srcIdx]}
                </p>
              </div>
            );
          })}
        </div>

        {/* Model at centre, on top of the strip */}
        <div className="pointer-events-none relative z-10 flex h-full justify-center">
          <div className="relative h-full w-full max-w-[520px]">
            {/* Cross-fade stack — swap-in feels soft rather than flicker */}
            {MODELS.map((src, i) => (
              <Image
                key={src}
                src={src}
                alt=""
                fill
                sizes="(min-width: 1024px) 520px, 80vw"
                priority={i === 0}
                className="object-contain object-bottom transition-opacity duration-500 ease-out"
                style={{ opacity: i === modelIdx ? 1 : 0 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
