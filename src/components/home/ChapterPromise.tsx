"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const banners = ["/images/bannerv1.png", "/images/banner2.png"];
const ROTATE_MS = 6000;

export function ChapterPromise() {
  const [index, setIndex] = useState(0);

  // Auto-rotate
  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, ROTATE_MS);
    return () => clearTimeout(id);
  }, [index]);

  return (
    <section
      id="chapter-promise"
      // Previously: "sticky top-0 z-0 -mt-[72px] flex h-[calc(100svh-60px)] w-full items-end overflow-hidden"
      // The sticky + z-0 made the hero stay fixed while chapters below slid over it. Switched to normal flow.
      className="relative flex h-[calc(100svh-120px)] w-full items-end overflow-hidden"
    >
      {banners.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="100vw"
          priority={i === 0}
          className={cn(
            "object-cover transition-opacity duration-1000 ease-in-out",
            i === index ? "opacity-100" : "opacity-0"
          )}
        />
      ))}

      <div className="relative ml-[50px] flex w-full max-w-[36rem] flex-col items-start gap-5 px-4 pb-[130px] text-white sm:px-6 sm:pb-[150px] lg:px-8 lg:pb-[170px]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/85">
          Winter &apos;26 Edit
        </span>

        <h1
          style={{ fontFamily: "var(--font-italianno)", WebkitTextStroke: "0" }}
          className="text-[clamp(2.25rem,5.5vw,4.25rem)] font-normal leading-[1.05] tracking-normal text-white/95"
        >
          Three ways
          <br />
          to dress.
        </h1>

        <p className="max-w-md text-sm text-white/85 sm:text-[15px]">
          Buy the pieces you&apos;ll keep. Rent the ones you won&apos;t.
          Try everything on without leaving home.
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-5">
          <LinkButton
            href="/s/wedding"
            size="md"
            className="!rounded-none bg-white px-7 text-[12px] font-bold uppercase tracking-[0.18em] text-ink hover:bg-white/90"
          >
            Shop the Collection
          </LinkButton>
          <LinkButton
            href="#chapter-buy"
            size="md"
            variant="ghost"
            className="!rounded-none px-2 text-[12px] font-bold uppercase tracking-[0.18em] text-white underline-offset-[6px] hover:bg-transparent hover:underline"
          >
            Scroll to explore &darr;
          </LinkButton>
        </div>
      </div>
    </section>
  );
}

