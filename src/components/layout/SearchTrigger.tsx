"use client";

import { useEffect, useState } from "react";
import { SearchBar } from "./SearchBar";
import { cn } from "@/lib/utils";

/**
 * Nav search button. On click, drops a full-width overlay from the top
 * with the SearchBar (which already carries mic + camera for voice/visual search).
 */
export function SearchTrigger({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  // ESC to close + lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Search"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cn("inline-flex items-center", className)}
      >
        <IconSearch />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search the store"
          className="fixed inset-0 z-50 flex flex-col"
        >
          {/* Top panel with search */}
          <div className="animate-fade-in border-b border-line bg-surface">
            <div className="mx-auto flex w-full max-w-3xl items-start gap-4 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
              <div className="flex-1">
                <SearchBar tone="light" />
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-subtle">
                  Try: &quot;red lehenga for sangeet under ₹20k&quot;
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close search"
                className="mt-2 flex h-9 w-9 shrink-0 items-center justify-center text-ink-subtle transition-colors hover:text-ink"
              >
                <IconClose />
              </button>
            </div>
          </div>

          {/* Dimming backdrop — click anywhere to close */}
          <button
            type="button"
            aria-label="Close search"
            onClick={() => setOpen(false)}
            className="flex-1 cursor-default bg-ink/40 backdrop-blur-sm"
          />
        </div>
      )}
    </>
  );
}

function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
    </svg>
  );
}
