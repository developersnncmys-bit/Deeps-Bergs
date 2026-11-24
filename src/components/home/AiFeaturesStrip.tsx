"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { TbSearch, TbUserScan, TbSparkles, TbWand, TbRotate360 } from "react-icons/tb";
import type { ReactNode } from "react";

const features: { title: string; icon: ReactNode }[] = [
  {
    title: "Smart Search",
    icon: (
      <span className="relative inline-flex transition-transform duration-300 group-hover:scale-110">
        <TbSearch size={20} strokeWidth={2.2} color="var(--color-brand-dark)" />
        <TbSparkles
          size={10}
          strokeWidth={2.2}
          color="var(--color-brand-dark)"
          className="absolute -right-1 -top-1 animate-twinkle"
        />
      </span>
    ),
  },
  {
    title: "AI Virtual Try-On",
    icon: (
      <span className="inline-flex animate-scan-pulse transition-transform duration-300 group-hover:scale-110">
        <TbUserScan size={20} strokeWidth={2.2} color="var(--color-brand-dark)" />
      </span>
    ),
  },
  {
    title: "360° Try-On",
    icon: (
      <span className="inline-flex animate-spin-slow transition-transform duration-300 group-hover:[animation-duration:1.5s]">
        <TbRotate360 size={24} strokeWidth={2.2} color="var(--color-brand-dark)" />
      </span>
    ),
  },
  {
    title: "Personal Stylist",
    icon: (
      <span className="inline-flex animate-wand-wiggle transition-transform duration-300 group-hover:scale-110">
        <TbWand size={20} strokeWidth={2.2} color="var(--color-brand-dark)" />
      </span>
    ),
  },
];

const HEADLINE = "Shop smarter with AI.";

export function AiFeaturesStrip() {
  return (
    <section className="bg-gradient-to-br from-[#fbf3f3] via-[#f5ecec] to-[#fbf3f3] py-6 sm:py-8 lg:py-10">
      <Container>
        <TypingHeading text={HEADLINE} />
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {features.map(({ title, icon }) => (
            <div
              key={title}
              className="group flex cursor-default flex-col items-center gap-3 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-dark/20 bg-white shadow-sm transition-colors group-hover:border-brand-dark sm:h-14 sm:w-14">
                {icon}
              </span>
              <p className="font-sans text-sm text-brand-dark sm:text-base">{title}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function TypingHeading({ text }: { text: string }) {
  const [typed, setTyped] = useState("");

  // Continuous loop: types, holds, erases, holds, repeats — runs always so the
  // user sees it animating no matter when they scroll into view.
  useEffect(() => {
    let cancelled = false;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => window.setTimeout(resolve, ms));

    const run = async () => {
      while (!cancelled) {
        for (let i = 1; i <= text.length; i++) {
          if (cancelled) return;
          setTyped(text.slice(0, i));
          await wait(80);
        }
        await wait(1800);
        if (cancelled) return;
        for (let i = text.length - 1; i >= 0; i--) {
          if (cancelled) return;
          setTyped(text.slice(0, i));
          await wait(35);
        }
        await wait(500);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [text]);

  return (
    <h2
      aria-label={text}
      className="mb-5 min-h-[1.2em] text-center font-sans text-xl uppercase tracking-[0.15em] text-brand-dark sm:mb-6 sm:text-2xl"
    >
      <span aria-hidden>{typed}</span>
      <span
        aria-hidden
        className="ml-1 inline-block h-[0.9em] w-[2px] translate-y-[2px] animate-blink bg-brand-dark align-middle"
      />
    </h2>
  );
}
