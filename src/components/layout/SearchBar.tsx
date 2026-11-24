"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  SearchOverlay,
  type OverlayMode,
} from "@/components/search/SearchOverlay";

/**
 * Nykaa-style pill search bar.
 * - Pill (rounded-full) container, prefix search icon + inline input
 * - Right-side switchable pill holds the mic (voice/A04) + camera (visual/A05)
 *   with a sliding "selected" background — one mode active at a time.
 * - Any click (input focus / mic / camera) opens the full-width SearchOverlay
 *   so the three AI search surfaces take over the navbar region (Kalki-style).
 */
export function SearchBar({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>("text");
  const isDark = tone === "dark";

  const openOverlay = (mode: OverlayMode) => (e?: React.MouseEvent) => {
    e?.preventDefault();
    setOverlayMode(mode);
    setOverlayOpen(true);
  };

  return (
    <>
      <div
        role="search"
        onClick={openOverlay("text")}
        className={cn(
          "flex h-10 cursor-text items-center gap-2 border-b pl-1 pr-0.5 transition-colors",
          isDark ? "border-white/60" : "border-ink",
          className,
        )}
      >
        {/* Leading search icon */}
        <IconSearch
          className={cn(
            "shrink-0 transition-colors",
            isDark ? "text-white/80" : "text-ink-subtle",
          )}
        />

        {/* Faux input — clicking anywhere opens the overlay */}
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-sm font-medium",
            isDark ? "text-white/85" : "text-ink-muted",
          )}
        >
          Search a look
        </span>

        {/* Switchable mode pill — mic / camera */}
        <div
          className={cn(
            "relative flex items-center rounded-full p-0.5 transition-colors",
            isDark ? "bg-white/15" : "bg-[#f0f0f0]",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <ModeButton
            onClick={openOverlay("voice")}
            ariaLabel="AI voice search"
            isDark={isDark}
          >
            <IconMic />
          </ModeButton>
          <ModeButton
            onClick={openOverlay("visual")}
            ariaLabel="AI visual search"
            isDark={isDark}
          >
            <IconCamera />
          </ModeButton>
        </div>
      </div>

      <SearchOverlay
        open={overlayOpen}
        initialMode={overlayMode}
        onClose={() => setOverlayOpen(false)}
      />
    </>
  );
}

function ModeButton({
  onClick,
  ariaLabel,
  isDark,
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  ariaLabel: string;
  isDark: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn(
        "relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors",
        isDark
          ? "text-white/80 hover:text-white"
          : "text-ink/70 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function IconMic() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" shapeRendering="geometricPrecision" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="9" y="4" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0" />
        <path d="M12 18v3" />
      </g>
      <path
        d="M19 0l1.2 2.3L22.5 3.5l-2.3 1.2L19 7l-1.2-2.3L15.5 3.5l2.3-1.2z"
        fill="var(--color-ink)"
      />
    </svg>
  );
}

function IconCamera() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" shapeRendering="geometricPrecision" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 10h3l2-2h6l2 2h3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z" />
        <circle cx="12" cy="14" r="3" />
      </g>
      <path
        d="M19 0l1.2 2.3L22.5 3.5l-2.3 1.2L19 7l-1.2-2.3L15.5 3.5l2.3-1.2z"
        fill="var(--color-ink)"
      />
    </svg>
  );
}
