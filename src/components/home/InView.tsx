"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Wraps children with a one-shot fade-in that triggers when the element
 * enters the viewport. Used to give each chapter a gentle reveal.
 */
export function InView({
  children,
  className,
  as: As = "div",
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <As
      ref={ref}
      style={shown && delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
      // Opacity-only entrance — no translate so the section never shifts out
      // of its natural layout slot (which was leaving a strip of body bg
      // visible above entering sections). Starts at a non-zero opacity so
      // there's no "see-through" moment where content behind could bleed in.
      className={cn(
        "transition-opacity duration-500 ease-out",
        shown ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {children}
    </As>
  );
}
