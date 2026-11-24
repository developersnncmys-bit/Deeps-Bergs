"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { TbMovie, TbSearch, TbSparkles, TbWand } from "react-icons/tb";
import type { ReactNode } from "react";

type AiModule = {
  title: string;
  desc: string;
  href: string;
  cta: string;
  icon: ReactNode;
};

const iconColor = "var(--color-brand-dark)";

const aiModules: AiModule[] = [
  {
    title: "360° Try-On Video",
    desc: "A short multi-angle clip of the fit on you, generated in seconds.",
    href: "/account/try-ons",
    cta: "Watch a Demo",
    icon: <TbMovie size={48} strokeWidth={1.3} color={iconColor} />,
  },
  {
    title: "Smart Search",
    desc: '"Red lehenga for sangeet under ₹20k" — just type it in plain language.',
    href: "/search",
    cta: "Try Smart Search",
    icon: (
      <span className="relative inline-flex">
        <TbSearch size={48} strokeWidth={1.3} color={iconColor} />
        <TbSparkles
          size={18}
          strokeWidth={1.6}
          color={iconColor}
          className="absolute -right-1.5 -top-1.5"
        />
      </span>
    ),
  },
  {
    title: "Personal Stylist",
    desc: "Occasion-ready looks mixing buy and rent, built around your size and budget.",
    href: "/stylist",
    cta: "Talk to Stylist",
    icon: <TbWand size={48} strokeWidth={1.3} color={iconColor} />,
  },
];

export function AiToolkitStrip() {
  return (
    <div className="bg-gradient-to-br from-[#fbe3ea] via-[#efd9e7] to-[#dfd3ef] py-16 sm:py-20 lg:py-24">
      <Container>
        {/* Typewriter headline */}
        <h3 className="mb-12 text-center font-serif text-2xl text-brand-dark sm:mb-14 sm:text-3xl lg:text-[32px]">
          <Typewriter text="Powered by AI, built around you." />
        </h3>

        {/* 3 narrower cards */}
        <div className="grid gap-14 sm:grid-cols-3 sm:gap-6 lg:gap-10">
          {aiModules.map(({ title, desc, href, cta, icon }) => (
            <div
              key={title}
              className="mx-auto flex max-w-[260px] flex-col items-center gap-4 text-center"
            >
              {icon}
              <h3 className="font-serif text-xl text-brand-dark sm:text-[22px]">
                {title}
              </h3>
              <p className="text-sm text-brand-dark/75">{desc}</p>
              <Link
                href={href}
                className="mt-3 inline-flex items-center border-2 border-ink px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-white"
              >
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

/* ──────────── Typewriter — loops: types out, holds, erases, holds, repeats ──────────── */

function Typewriter({
  text,
  typeSpeed = 55,
  eraseSpeed = 25,
  holdAfterTypeMs = 1500,
  holdAfterEraseMs = 400,
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

  // Only animate while the heading is on screen (saves work and keeps the
  // effect feeling "earned" when the user scrolls to it).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setInView(entries.some((e) => e.isIntersecting)),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Loop: type → hold → erase → hold → repeat
  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = window.setTimeout(resolve, ms);
        // If cancelled while waiting, clear to avoid leaks
        return () => window.clearTimeout(id);
      });

    const run = async () => {
      while (!cancelled) {
        // Type
        for (let i = 1; i <= text.length; i++) {
          if (cancelled) return;
          setShown(text.slice(0, i));
          await wait(typeSpeed);
        }
        await wait(holdAfterTypeMs);
        if (cancelled) return;
        // Erase
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
        className="ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-0.5 animate-pulse bg-brand-dark align-middle"
      />
    </span>
  );
}
