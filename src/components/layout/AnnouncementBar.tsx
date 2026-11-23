"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Message = {
  text: string;
  link?: { label: string; href: string };
};

const messages: Message[] = [
  {
    text: "Winter '26 is here — shop the new season",
    link: { label: "Explore", href: "/s/wedding" },
  },
  { text: "Free shipping on orders over ₹2,500" },
  {
    text: "Rent & return — deposits always refunded",
    link: { label: "How rentals work", href: "/help#rentals" },
  },
  {
    text: "Virtual Try-On is live",
    link: { label: "Try it", href: "/account/try-ons" },
  },
];

const ROTATE_MS = 5000;

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [paused]);

  const current = messages[index];

  return (
    <div className="bg-ink text-white">
      <div className="grid h-10 grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-2 text-[11px] tabular-nums text-white/60">
          <Spinner active={!paused} />
          <span>
            {index + 1}/{messages.length}
          </span>
        </div>

        <p
          key={index}
          aria-live="polite"
          className="animate-fade-in truncate text-center text-[11px] text-white sm:text-xs"
        >
          {current.text}
          {current.link && (
            <>
              {" "}
              <Link
                href={current.link.href}
                className="underline underline-offset-4 hover:text-accent"
              >
                {current.link.label}
              </Link>
            </>
          )}
        </p>

        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Resume announcements" : "Pause announcements"}
          className="text-white/60 hover:text-white"
        >
          {paused ? <IconPlay /> : <IconPause />}
        </button>
      </div>
    </div>
  );
}

function Spinner({ active }: { active: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={active ? "animate-spin" : ""}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" opacity="0.3" />
      <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 5l12 7-12 7V5z" />
    </svg>
  );
}
