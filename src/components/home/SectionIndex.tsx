"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type ChapterEntry = {
  id: string;
  label: string;
  tone?: "light" | "dark";
};

export function SectionIndex({ chapters }: { chapters: ChapterEntry[] }) {
  const [activeId, setActiveId] = useState<string>(chapters[0]?.id ?? "");
  const [revealed, setRevealed] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Track which chapter is most in view
  useEffect(() => {
    const targets = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Pick the entry with the greatest intersection ratio among those in view
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      {
        // The band that defines "in view" — focuses on the middle of the viewport
        rootMargin: "-40% 0px -40% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );
    targets.forEach((t) => observerRef.current?.observe(t));
    return () => observerRef.current?.disconnect();
  }, [chapters]);

  // Reveal the index only after the user scrolls past the first viewport
  useEffect(() => {
    const onScroll = () => {
      setRevealed(window.scrollY > window.innerHeight * 0.4);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeChapter = chapters.find((c) => c.id === activeId) ?? chapters[0];
  const activeTone = activeChapter?.tone === "dark" ? "dark" : "light";

  return (
    <nav
      aria-label="Chapter navigation"
      className={cn(
        "pointer-events-none fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-3 transition-opacity duration-500 lg:flex",
        revealed ? "opacity-100" : "opacity-0"
      )}
    >
      {chapters.map((c, i) => {
        const active = c.id === activeId;
        return (
          <a
            key={c.id}
            href={`#${c.id}`}
            className={cn(
              "pointer-events-auto group flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.25em] transition-colors",
              activeTone === "dark" ? "text-white/60 hover:text-white" : "text-ink-subtle hover:text-ink",
              active && (activeTone === "dark" ? "text-white" : "text-ink")
            )}
          >
            <span
              className={cn(
                "tabular-nums transition-opacity",
                active ? "opacity-100" : "opacity-0 group-hover:opacity-80"
              )}
            >
              {c.label}
            </span>
            <span className="relative flex h-5 w-5 items-center justify-center">
              <span
                className={cn(
                  "block h-px transition-all",
                  active ? "w-5" : "w-3",
                  activeTone === "dark" ? "bg-white" : "bg-ink",
                  !active && "opacity-40 group-hover:opacity-80"
                )}
              />
            </span>
            <span className="w-6 text-right tabular-nums">
              {String(i).padStart(2, "0")}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
