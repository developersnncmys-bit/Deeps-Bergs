"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TbPhoto, TbUpload, TbX } from "react-icons/tb";

/**
 * Visual search upload dialog. On the web there is no camera-capture flow (that
 * lives on the apps), so this is a single drag-or-click upload surface.
 *
 * On pick: stashes a data: URL in sessionStorage and fires `onImage` with it so
 * downstream can route to /search?mode=visual. Later this can hand the file off
 * to the Vision API (A05) instead of mocking.
 */
export function VisualSearchSheet({
  open,
  onClose,
  onImage,
}: {
  open: boolean;
  onClose: () => void;
  onImage: (dataUrl: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const consumeFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result ?? "");
      try {
        sessionStorage.setItem("dbf.visualSearch.image", url);
      } catch {
        /* storage full or disabled — the result page will just show a placeholder */
      }
      onImage(url);
    };
    reader.readAsDataURL(file);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) consumeFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) consumeFile(file);
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Visual search"
      onClick={onClose}
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-t-[22px] bg-white pb-6 shadow-2xl sm:rounded-[22px]"
      >
        <div className="flex items-center justify-between px-6 pt-5">
          <h2 className="text-lg font-semibold text-ink">Add a photo</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-black/5 hover:text-ink"
          >
            <TbX size={18} />
          </button>
        </div>
        <p className="mt-1 px-6 text-sm text-ink-muted">
          Upload an outfit or reference photo. We&apos;ll find visually similar
          pieces in the catalogue.
        </p>

        {/* Drag-and-drop zone */}
        <div className="mt-5 px-6">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={
              "flex w-full flex-col items-center gap-3 rounded-[14px] border-2 border-dashed px-6 py-10 text-center transition-colors " +
              (dragging
                ? "border-brand bg-brand/5"
                : "border-line bg-surface hover:border-ink")
            }
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand shadow-sm">
              <TbUpload size={22} />
            </span>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[15px] font-semibold text-ink">
                Drag & drop a photo
              </span>
              <span className="text-xs text-ink-muted">
                or click to choose from your computer
              </span>
            </div>
            <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-ink-subtle">
              PNG · JPG · HEIC up to 10 MB
            </span>
          </button>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-ink px-5 py-3 text-[12px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand"
          >
            <TbPhoto size={16} />
            Choose a photo
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="sr-only"
        />
      </div>
    </div>,
    document.body,
  );
}
