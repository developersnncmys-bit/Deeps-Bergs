"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TbX, TbCheck, TbLoader2 } from "react-icons/tb";
import { AuthFlow } from "./AuthFlow";
import { useAuth } from "@/lib/auth";

const SUCCESS_MS = 1800;

export function AuthModal() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const wasSignedIn = useRef(false);
  const { user } = useAuth();

  useEffect(() => setMounted(true), []);

  // Track prior auth state so we only trigger the success screen on an
  // in-session sign-in (not when the modal mounts for an already-signed-in user).
  useEffect(() => {
    wasSignedIn.current = !!user;
  }, []);

  // Open/close events dispatched by lib/auth helpers.
  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onClose = () => setOpen(false);
    window.addEventListener("dbf-auth-open", onOpen);
    window.addEventListener("dbf-auth-close", onClose);
    return () => {
      window.removeEventListener("dbf-auth-open", onOpen);
      window.removeEventListener("dbf-auth-close", onClose);
    };
  }, []);

  // When the user becomes signed in while the modal is open, show the
  // celebratory "logging you in" screen briefly before closing.
  useEffect(() => {
    if (user && open) {
      setShowSuccess(true);
      const t = setTimeout(() => {
        setShowSuccess(false);
        setOpen(false);
      }, SUCCESS_MS);
      return () => clearTimeout(t);
    }
    if (!user) {
      setShowSuccess(false);
    }
  }, [user, open]);

  // Lock body scroll + close on ESC when open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !showSuccess) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, showSuccess]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sign in or sign up"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => !showSuccess && setOpen(false)}
    >
      <div
        className={
          "relative w-full overflow-hidden rounded-[20px] bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] " +
          (showSuccess ? "max-w-md" : "max-w-2xl")
        }
        onClick={(e) => e.stopPropagation()}
      >
        {!showSuccess && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow transition-colors hover:bg-white"
          >
            <TbX size={18} />
          </button>
        )}

        {showSuccess ? (
          <SuccessScreen name={user?.name || user?.email?.split("@")[0]} />
        ) : (
          <AuthFlow />
        )}
      </div>
    </div>,
    document.body,
  );
}

function SuccessScreen({ name }: { name?: string }) {
  return (
    <div className="flex flex-col items-center gap-5 px-10 py-14 text-center">
      <span
        aria-hidden
        className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f5ea] text-[#2a7a3a]"
      >
        <TbCheck size={32} strokeWidth={2.5} />
      </span>
      <div>
        <h2
          style={{ fontFamily: "var(--font-raleway)" }}
          className="text-xl font-medium text-ink sm:text-2xl"
        >
          Verification Successful
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          {name
            ? `Welcome${name === "Google user" || name === "Apple user" ? "" : `, ${name}`} — logging you in.`
            : "Welcome to Deeps & Bergs — logging you in."}
        </p>
      </div>
      <div className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-ink-muted">
        <TbLoader2 size={18} className="animate-spin" />
        Logging you in
      </div>
    </div>
  );
}
