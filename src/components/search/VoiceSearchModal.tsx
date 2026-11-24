"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TbMicrophone, TbX } from "react-icons/tb";

// Mock transcripts the fake "recogniser" rotates through — looks like real natural
// language queries that would hit AI Smart Search (A03).
const SAMPLE_TRANSCRIPTS = [
  "red lehenga for a sangeet under twenty thousand",
  "ivory saree with chikankari work under ten thousand",
  "men's sherwani for a reception",
  "cotton co-ord set for daywear",
  "charcoal nehru jacket under ten thousand",
];

type Phase = "idle" | "listening" | "done";

export function VoiceSearchModal({
  open,
  onClose,
  onTranscript,
}: {
  open: boolean;
  onClose: () => void;
  onTranscript: (text: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [transcript, setTranscript] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Simulated listening lifecycle — swap this block for a real Web Speech API
  // or an audio upload to Speech-to-Text (A04 third party) when wiring providers.
  useEffect(() => {
    if (!open) return;
    setPhase("listening");
    setTranscript("");
    const picked =
      SAMPLE_TRANSCRIPTS[Math.floor(Math.random() * SAMPLE_TRANSCRIPTS.length)];
    const start = Date.now();

    // Type the transcript out progressively to feel like streaming recognition.
    const typeInterval = window.setInterval(() => {
      const t = Date.now() - start;
      const chars = Math.min(picked.length, Math.floor((t / 1800) * picked.length));
      setTranscript(picked.slice(0, chars));
      if (chars >= picked.length) window.clearInterval(typeInterval);
    }, 80);

    const done = window.setTimeout(() => {
      setPhase("done");
      window.clearInterval(typeInterval);
      setTranscript(picked);
      // Give the user ~800ms to read the final transcript before firing.
      window.setTimeout(() => onTranscript(picked), 800);
    }, 2200);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.clearInterval(typeInterval);
      window.clearTimeout(done);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, onTranscript]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Voice search"
      onClick={onClose}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-[22px] bg-white p-8 shadow-2xl sm:p-10"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close voice search"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-black/5 hover:text-ink"
        >
          <TbX size={18} />
        </button>

        <h2 className="text-center text-[22px] font-semibold text-ink sm:text-2xl">
          What are you looking for?
        </h2>

        {/* Pulsing mic puck */}
        <div className="relative mx-auto mt-10 flex h-36 w-36 items-center justify-center">
          <span
            aria-hidden
            className={
              "absolute inset-0 rounded-full bg-brand/15 " +
              (phase === "listening" ? "animate-ping" : "")
            }
          />
          <span
            aria-hidden
            className={
              "absolute inset-3 rounded-full bg-brand/25 " +
              (phase === "listening" ? "animate-ping [animation-delay:150ms]" : "")
            }
          />
          <span className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-brand text-white shadow-lg">
            <TbMicrophone size={38} strokeWidth={2} />
          </span>
        </div>

        <p className="mt-10 min-h-[1.5em] text-center text-[15px] text-ink-muted">
          {phase === "done"
            ? `"${transcript}"`
            : transcript
              ? `"${transcript}"`
              : "Listening…"}
        </p>

        <p className="mt-2 text-center text-[11px] uppercase tracking-[0.25em] text-ink-subtle">
          Speak in English, Hindi, or mixed
        </p>
      </div>
    </div>,
    document.body,
  );
}
