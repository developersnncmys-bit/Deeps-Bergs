"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Mode = "text" | "voice" | "visual";

/**
 * Nykaa-style pill search bar.
 * - Pill (rounded-full) container, prefix search icon + inline input
 * - Right-side switchable pill holds the mic (voice/A04) + camera (visual/A05)
 *   with a sliding "selected" background — one mode active at a time.
 * - Enter in the input submits a text search (A03).
 */
export function SearchBar({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<Mode>("text");
  const [listening, setListening] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isDark = tone === "dark";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  };

  const activateVoice = () => {
    setMode("voice");
    setListening(true);
    setTimeout(() => setListening(false), 1200);
  };

  const activateVisual = () => {
    setMode("visual");
    fileRef.current?.click();
  };

  const onVisualFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    router.push(`/search?mode=visual`);
  };

  return (
    <form
      onSubmit={submit}
      role="search"
      className={cn(
        "flex h-10 items-center gap-2 border-b pl-1 pr-0.5 transition-colors",
        isDark ? "border-white/60" : "border-ink",
        className
      )}
    >
      {/* Leading search icon */}
      <IconSearch
        className={cn(
          "shrink-0 transition-colors",
          isDark ? "text-white/80" : "text-ink-subtle"
        )}
      />

      {/* Input */}
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setMode("text")}
        placeholder={
          listening
            ? "Listening…"
            : mode === "visual"
              ? "Pick a photo to search with"
              : "Search a look"
        }
        aria-label="Search the store"
        style={{ fontFamily: "var(--font-raleway)" }}
        className={cn(
          "min-w-0 flex-1 bg-transparent text-sm font-medium outline-none transition-colors",
          isDark
            ? "text-white placeholder:font-medium placeholder:text-white/85"
            : "text-ink placeholder:font-medium placeholder:text-ink-muted"
        )}
      />

      {/* Switchable mode pill — mic / camera (light grey container, black active) */}
      <div
        className={cn(
          "relative flex items-center rounded-full p-0.5 transition-colors",
          isDark ? "bg-white/15" : "bg-[#f0f0f0]"
        )}
      >
        <ModeButton
          active={mode === "voice"}
          onClick={activateVoice}
          ariaLabel={listening ? "Listening…" : "AI voice search"}
          isDark={isDark}
        >
          <IconMic />
        </ModeButton>
        <ModeButton
          active={mode === "visual"}
          onClick={activateVisual}
          ariaLabel="AI visual search"
          isDark={isDark}
        >
          <IconCamera />
        </ModeButton>

        {/* hidden file input for visual search */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onVisualFile}
          className="sr-only"
        />
      </div>
    </form>
  );
}

function ModeButton({
  active,
  onClick,
  ariaLabel,
  isDark,
  children,
}: {
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
  isDark: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn(
        "relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors",
        active
          ? isDark
            ? "bg-white text-ink shadow-sm"
            : "bg-ink text-white shadow-sm"
          : isDark
            ? "text-white/80 hover:text-white"
            : "text-ink/70 hover:text-ink"
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
  // Bolder mic strokes + larger black AI sparkle in the top-right corner.
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" shapeRendering="geometricPrecision" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="9" y="4" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0" />
        <path d="M12 18v3" />
      </g>
      {/* 4-point sparkle, center (19, 3.5), outer radius 3.5 */}
      <path
        d="M19 0l1.2 2.3L22.5 3.5l-2.3 1.2L19 7l-1.2-2.3L15.5 3.5l2.3-1.2z"
        fill="var(--color-ink)"
      />
    </svg>
  );
}

function IconCamera() {
  // Bolder camera strokes + matching black AI sparkle.
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
