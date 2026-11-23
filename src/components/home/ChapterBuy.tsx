"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { BuyGallery } from "@/components/home/BuyGallery";
import { cn } from "@/lib/utils";

export function ChapterBuy() {
  const [slideKey, setSlideKey] = useState<"her" | "him">("her");
  const isDark = slideKey === "him";

  return (
    <section
      id="chapter-buy"
      className={cn(
        "scroll-mt-20 border-t py-14 transition-colors duration-500 sm:py-16 lg:py-20",
        isDark ? "border-ink bg-ink" : "border-line bg-surface"
      )}
    >
      <Container className="lg:max-w-[1600px]">
        {/* Centered header */}
        <div className="mb-10 flex flex-col items-center gap-3 text-center sm:mb-12">
          <h2
            className={cn(
              "text-3xl leading-tight transition-colors sm:text-4xl",
              isDark ? "text-white" : "text-ink"
            )}
          >
            Own it forever.
          </h2>
          <Link
            href="/search?mode=buy"
            className={cn(
              "text-sm underline underline-offset-[6px] decoration-[1px] transition-colors",
              isDark ? "text-white hover:text-accent" : "text-ink hover:text-brand"
            )}
          >
            Discover
          </Link>
        </div>

        {/* 2-slide gallery carousel (for her / for him) */}
        <BuyGallery onSlideChange={setSlideKey} />
      </Container>
    </section>
  );
}
