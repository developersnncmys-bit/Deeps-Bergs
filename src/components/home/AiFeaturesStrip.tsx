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
        <TbSearch size={20} strokeWidth={2.2} color="var(--color-ink)" />
        <TbSparkles
          size={10}
          strokeWidth={2.2}
          color="var(--color-ink)"
          className="absolute -right-1 -top-1 animate-twinkle"
        />
      </span>
    ),
  },
  {
    title: "AI Virtual Try-On",
    icon: (
      <span className="inline-flex animate-scan-pulse transition-transform duration-300 group-hover:scale-110">
        <TbUserScan size={20} strokeWidth={2.2} color="var(--color-ink)" />
      </span>
    ),
  },
  {
    title: "360° Try-On",
    icon: (
      <span className="inline-flex animate-spin-slow transition-transform duration-300 group-hover:[animation-duration:1.5s]">
        <TbRotate360 size={24} strokeWidth={2.2} color="var(--color-ink)" />
      </span>
    ),
  },
  {
    title: "Personal Stylist",
    icon: (
      <span className="inline-flex animate-wand-wiggle transition-transform duration-300 group-hover:scale-110">
        <TbWand size={20} strokeWidth={2.2} color="var(--color-ink)" />
      </span>
    ),
  },
];

const HEADLINE = "Shop smarter with AI.";

export function AiFeaturesStrip() {
  return (
    <section className="py-4 sm:py-5 lg:py-6">
      <Container>
        <TypingHeading text={HEADLINE} />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {features.map(({ title, icon }) => (
            <div
              key={title}
              className="group flex cursor-default flex-col items-center gap-3 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white shadow-sm transition-colors group-hover:border-ink sm:h-14 sm:w-14">
                {icon}
              </span>
              <p className="font-sans text-sm text-ink sm:text-base">{title}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function TypingHeading({ text }: { text: string }) {
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
        setDone(true);
      }
    }, 80);
    return () => window.clearInterval(id);
  }, [text]);

  return (
    <h2
      aria-label={text}
      className="mb-5 text-center font-sans text-xl uppercase tracking-[0.15em] text-ink sm:mb-6 sm:text-2xl"
    >
      <span aria-hidden>{typed}</span>
      <span
        aria-hidden
        className={
          "ml-1 inline-block w-[2px] translate-y-[2px] bg-ink align-middle " +
          (done ? "animate-blink" : "opacity-100") +
          " h-[0.9em]"
        }
      />
    </h2>
  );
}
