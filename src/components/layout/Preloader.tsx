"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Cinematic three-phase preloader:
 *
 *   REVEAL (750ms) — logo paints on via clip-path wipe (L → R) + soft scale-in
 *   HOLD   (900ms) — thin line grows underneath, center outward
 *   EXIT   (900ms) — two black panels slide apart like stage curtains,
 *                    revealing the page behind
 *
 * Total ≈ 2.55s. Respects prefers-reduced-motion by skipping entirely.
 */
const REVEAL_MS = 750;
const HOLD_MS = 900;
const EXIT_MS = 900;

type Phase = "reveal" | "hold" | "exit" | "hidden";

export function Preloader() {
  const [phase, setPhase] = useState<Phase>("reveal");

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setPhase("hidden");
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t1 = setTimeout(() => setPhase("hold"), REVEAL_MS);
    const t2 = setTimeout(() => setPhase("exit"), REVEAL_MS + HOLD_MS);
    const t3 = setTimeout(() => setPhase("hidden"), REVEAL_MS + HOLD_MS + EXIT_MS);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    if (phase === "exit" || phase === "hidden") document.body.style.overflow = "";
  }, [phase]);

  if (phase === "hidden") return null;

  // ─── EXIT: curtain split (two black panels slide apart) ───
  if (phase === "exit") {
    return (
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999]">
        <div
          className="absolute inset-x-0 top-0 h-1/2 bg-black animate-curtain-up"
          style={{ animationDuration: `${EXIT_MS}ms` }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 bg-black animate-curtain-down"
          style={{ animationDuration: `${EXIT_MS}ms` }}
        />
      </div>
    );
  }

  // ─── REVEAL + HOLD: logo paints on, line grows center-out ───
  return (
    <div
      aria-hidden
      role="presentation"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
    >
      <div className="flex flex-col items-center gap-7">
        {/* Logo — horizontal clip-path reveal + soft scale */}
        <div
          className="animate-logo-reveal"
          style={{ animationDuration: `${REVEAL_MS}ms` }}
        >
          <Image
            src="/images/white-logo.png"
            alt=""
            width={2170}
            height={725}
            priority
            className="h-12 w-auto sm:h-16 lg:h-20"
          />
        </div>

        {/* Hairline underline — stays invisible during reveal, grows center-outward during hold */}
        <div className="h-px w-48 overflow-visible sm:w-64 lg:w-72">
          <div
            className={cn(
              "h-full origin-center bg-white",
              phase === "reveal" ? "scale-x-0" : "animate-line-grow"
            )}
            style={{
              animationDuration: `${HOLD_MS * 0.7}ms`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
