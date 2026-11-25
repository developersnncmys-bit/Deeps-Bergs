"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  TbCamera,
  TbMicrophone,
  TbSearch,
  TbSparkles,
  TbUpload,
  TbX,
} from "react-icons/tb";

export type OverlayMode = "text" | "voice" | "visual";

/**
 * Full-width search overlay that covers the navbar region (Kalki-style).
 * Renders three modes from a shared shell so clicking the mic / camera / search
 * icon never pops a small dialog — it always takes over the top of the page.
 */
export function SearchOverlay({
  open,
  initialMode,
  onClose,
}: {
  open: boolean;
  initialMode: OverlayMode;
  onClose: () => void;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<OverlayMode>(initialMode);
  const [q, setQ] = useState("");

  useEffect(() => setMounted(true), []);

  // Sync internal mode with the mode requested when the overlay re-opens.
  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setQ("");
    }
  }, [open, initialMode]);

  // Lock the body scroll while the overlay is open + wire Escape to close.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const submitText = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    router.push(`/search?q=${encodeURIComponent(term)}`);
    onClose();
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className="fixed inset-0 z-[100] flex flex-col bg-black/35 backdrop-blur-sm"
    >
      {/* White nav-replacement bar */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center gap-4 px-4 sm:gap-6 sm:px-6 lg:px-10">
          <form onSubmit={submitText} role="search" className="flex flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setMode("text")}
              aria-label="Search"
              className={
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors " +
                (mode === "text" ? "bg-ink text-white" : "text-ink hover:bg-black/5")
              }
            >
              <TbSearch size={20} />
            </button>
            <button
              type="button"
              onClick={() => setMode("voice")}
              aria-label="Voice search"
              className={
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors " +
                (mode === "voice" ? "bg-ink text-white" : "text-ink hover:bg-black/5")
              }
            >
              <TbMicrophone size={20} />
            </button>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setMode("text")}
              placeholder={
                mode === "voice"
                  ? "Listening…"
                  : mode === "visual"
                    ? "Drop a photo below to search"
                    : "Search a look"
              }
              aria-label="Search the store"
              className="min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-ink-muted focus:outline-none focus-visible:outline-none"
              style={{ outline: "none", boxShadow: "none" }}
            />
            <button
              type="button"
              onClick={() => setMode("visual")}
              aria-label="Visual search"
              className={
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors " +
                (mode === "visual" ? "bg-ink text-white" : "text-ink hover:bg-black/5")
              }
            >
              <TbCamera size={20} />
            </button>
          </form>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-black/5"
          >
            <TbX size={22} />
          </button>
        </div>
      </div>

      {/* Mode-specific content panel */}
      <div className="flex-1 overflow-y-auto">
        {mode === "text" && <TextModePanel onPick={(term) => { setQ(term); router.push(`/search?q=${encodeURIComponent(term)}`); onClose(); }} />}
        {mode === "voice" && <VoiceModePanel onDone={(transcript) => { router.push(`/search?q=${encodeURIComponent(transcript)}&mode=voice`); onClose(); }} />}
        {mode === "visual" && <VisualModePanel onImage={() => { router.push(`/search?mode=visual`); onClose(); }} />}
      </div>
    </div>,
    document.body,
  );
}

/* ─────────────── Text mode — recent / suggested queries ─────────────── */

const SUGGESTIONS = [
  "Red lehenga for sangeet under ₹20k",
  "Ivory chikankari saree",
  "Charcoal nehru jacket",
  "Linen co-ord set for daywear",
  "Emerald silk kurta for reception",
  "Rose-gold bridal saree",
];

function TextModePanel({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-10">
        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-dark">
          <TbSparkles size={14} />
          Smart search
        </p>
        <h2 className="mt-2 font-serif text-2xl text-ink sm:text-3xl">
          Try a look, not just a keyword
        </h2>
        <p className="mt-2 max-w-xl text-sm text-ink-muted">
          Describe the piece in your own words — colour, occasion, budget, fabric. We&apos;ll match the whole catalogue.
        </p>

        <div className="mt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
            Popular searches
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onPick(s)}
                className="rounded-full border border-ink bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Voice mode — browser Web Speech API with graceful fallback ─────────────── */

// Browser SpeechRecognition shape — not in TS lib by default.
// Nesting: event.results[i]          → SpeechRecognitionResult (has isFinal + list of alternatives)
//           event.results[i][j]       → SpeechRecognitionAlternative (has transcript, confidence)
type RecognitionAlternative = { transcript: string; confidence?: number };
type RecognitionResult = {
  [k: number]: RecognitionAlternative;
  length: number;
  isFinal?: boolean;
};
type SpeechRecognitionEventLike = {
  results: { [k: number]: RecognitionResult; length: number };
  resultIndex: number;
};
type SpeechRecognitionErrorLike = { error: string };
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
};

type VoicePhase = "listening" | "done" | "denied" | "unsupported" | "error";

function getRecognitionCtor():
  | (new () => SpeechRecognitionLike)
  | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function VoiceModePanel({ onDone }: { onDone: (transcript: string) => void }) {
  const [phase, setPhase] = useState<VoicePhase>("listening");
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef<string>("");
  const doneRef = useRef(false);

  const start = () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setPhase("unsupported");
      return;
    }

    const recognition = new Ctor();
    recognition.lang = "en-IN"; // en-IN handles Hinglish surprisingly well
    recognition.continuous = false;
    recognition.interimResults = true;
    recognitionRef.current = recognition;
    finalRef.current = "";
    doneRef.current = false;
    setPhase("listening");
    setTranscript("");

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        const piece = r[0].transcript;
        if (r.isFinal) finalText += piece;
        else interim += piece;
      }
      finalRef.current += finalText;
      setTranscript((finalRef.current + interim).trim());
    };

    recognition.onerror = (event: SpeechRecognitionErrorLike) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setPhase("denied");
      } else if (event.error === "no-speech") {
        // Soft fail — stay in listening so user can try again
      } else {
        setPhase("error");
      }
    };

    recognition.onend = () => {
      const final = finalRef.current.trim();
      if (final && !doneRef.current) {
        doneRef.current = true;
        setPhase("done");
        setTranscript(final);
        window.setTimeout(() => onDone(final), 600);
      }
    };

    try {
      recognition.start();
    } catch {
      setPhase("error");
    }
  };

  useEffect(() => {
    start();
    return () => {
      recognitionRef.current?.abort();
    };
    // Only on mount — callers get a fresh VoiceModePanel per open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label =
    phase === "denied"
      ? "Microphone blocked. Enable it in your browser settings."
      : phase === "unsupported"
        ? "Voice search isn't supported in this browser. Try Chrome, Edge or Safari."
        : phase === "error"
          ? "Couldn't hear you. Try again."
          : transcript
            ? `“${transcript}”`
            : "Listening…";

  return (
    <div className="bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-10 lg:py-24">
        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-dark">
          <TbSparkles size={14} />
          Voice search
        </p>
        <h2 className="mt-2 font-serif text-2xl text-ink sm:text-3xl">
          What are you looking for?
        </h2>

        <button
          type="button"
          onClick={() => {
            // Tap to stop & submit if we already have something; otherwise restart.
            if (transcript && phase === "listening") {
              recognitionRef.current?.stop();
            } else if (phase !== "listening") {
              start();
            }
          }}
          aria-label={phase === "listening" ? "Stop and search" : "Start listening"}
          className="relative mt-10 flex h-40 w-40 items-center justify-center"
        >
          <span
            aria-hidden
            className={
              "absolute inset-0 rounded-full bg-ink/15 " +
              (phase === "listening" ? "animate-ping" : "")
            }
          />
          <span
            aria-hidden
            className={
              "absolute inset-3 rounded-full bg-ink/25 " +
              (phase === "listening" ? "animate-ping [animation-delay:150ms]" : "")
            }
          />
          <span className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full bg-ink text-white shadow-lg">
            <TbMicrophone size={42} />
          </span>
        </button>

        <p className="mt-10 min-h-[1.5em] max-w-xl text-lg text-ink">{label}</p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-ink-subtle">
          Speak in English, Hindi, or mixed
        </p>

        {(phase === "denied" || phase === "unsupported" || phase === "error") && (
          <button
            type="button"
            onClick={start}
            className="mt-6 inline-flex items-center border border-ink px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-white"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────── Visual mode — Kalki-style upload panel ─────────────── */

const POPULAR_VISUAL_SEARCHES = [
  "/images/category/bridal.png",
  "/images/rental/sangeet.png",
  "/images/rental/reception.png",
  "/images/rental/Mehendi.png",
  "/images/rental/cocktail.png",
  "/images/category/co-ord.png",
];

function VisualModePanel({ onImage }: { onImage: (dataUrl: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const consumeFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result ?? "");
      try {
        sessionStorage.setItem("dbf.visualSearch.image", url);
      } catch {
        /* ignore */
      }
      onImage(url);
    };
    reader.readAsDataURL(file);
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const file = e.clipboardData.files?.[0];
    if (file && file.type.startsWith("image/")) consumeFile(file);
  };

  return (
    <div className="bg-white" onPaste={onPaste}>
      <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <h2 className="text-center text-xl font-semibold text-ink sm:text-2xl">
          Image Search
        </h2>

        {/* Dashed drop zone — compact */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file && file.type.startsWith("image/")) consumeFile(file);
          }}
          className={
            "mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-[12px] border-2 border-dashed px-6 py-6 text-center transition-colors " +
            (dragging
              ? "border-brand bg-brand/5"
              : "border-ink-subtle/50 bg-surface hover:border-ink")
          }
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm">
            <TbUpload size={20} />
          </span>
          <p className="max-w-lg text-xs text-ink-muted sm:text-sm">
            Drag and drop your image here, click{" "}
            <span className="font-semibold text-ink">&ldquo;Upload Image&rdquo;</span>,
            or paste the image here
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileRef.current?.click();
            }}
            className="mt-1 inline-flex items-center justify-center border border-ink px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-white"
          >
            Upload Image
          </button>
          <p className="text-[9px] uppercase tracking-[0.2em] text-ink-subtle">
            PNG · JPG · HEIC up to 10 MB
          </p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) consumeFile(file);
          }}
          className="sr-only"
        />

        {/* Popular visual searches */}
        <div className="mt-6">
          <p className="text-xs font-semibold text-ink">
            Popular Search Product Images
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
            {POPULAR_VISUAL_SEARCHES.map((src) => (
              <button
                key={src}
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch(src);
                    const blob = await res.blob();
                    const file = new File([blob], "popular.png", {
                      type: blob.type,
                    });
                    consumeFile(file);
                  } catch {
                    /* ignore — the popular pick will just no-op if the image can't be fetched */
                  }
                }}
                className="group relative aspect-[3/4] overflow-hidden rounded-[10px] border border-line bg-surface"
                aria-label="Try this popular search"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
