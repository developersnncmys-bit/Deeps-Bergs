"use client";

import Link from "next/link";
import { TbSparkles } from "react-icons/tb";

export function AskAiFab() {
  return (
    <Link
      href="/assistant"
      aria-label="Ask AI"
      className="group fixed bottom-[60px] right-5 z-50 flex items-center gap-2 rounded-full bg-ink py-3 pl-4 pr-5 text-white shadow-xl transition-all hover:bg-brand hover:shadow-2xl sm:bottom-[72px] sm:right-8"
    >
      <span className="relative inline-flex h-6 w-6 items-center justify-center">
        <span
          aria-hidden
          className="absolute inset-0 animate-ping rounded-full bg-white/30"
        />
        <TbSparkles size={18} strokeWidth={1.8} className="relative animate-twinkle" />
      </span>
      <span className="text-[12px] font-semibold uppercase tracking-[0.2em]">
        Ask AI
      </span>
    </Link>
  );
}
