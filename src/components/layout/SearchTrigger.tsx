"use client";

import { useState } from "react";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { cn } from "@/lib/utils";

/**
 * Nav search button (mobile).
 * Tapping it opens the full-width SearchOverlay in text mode so the mobile flow
 * matches desktop — one surface for Smart / Voice / Visual search.
 */
export function SearchTrigger({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

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

      <SearchOverlay
        open={open}
        initialMode="text"
        onClose={() => setOpen(false)}
      />
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
