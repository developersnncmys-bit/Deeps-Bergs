"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useMenu } from "./menu-context";
import { sections, categories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const secondaryLinks = [
  { href: "/stylist", label: "Personal Stylist" },
  { href: "/account/try-ons", label: "Virtual Try-On" },
  { href: "/videos", label: "Videos" },
  { href: "/creators", label: "Creators" },
  { href: "/search", label: "Search" },
];

const utilityLinks = [
  { href: "/help", label: "Help Centre" },
  { href: "/help#contact", label: "Contact Us" },
  { href: "/account/orders", label: "Track an Order" },
  { href: "/help#rentals", label: "Rentals & Returns" },
  { href: "/stores", label: "Store Locator" },
];

export function MenuDrawer() {
  const { isOpen, close } = useMenu();

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <>
      <div
        aria-hidden
        onClick={close}
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-md transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={cn(
          "fixed right-0 top-0 z-50 flex h-[100svh] w-full max-w-[480px] flex-col bg-surface shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close menu"
          className="absolute left-6 top-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-ink"
        >
          <IconX />
        </button>

        <div className="flex-1 overflow-y-auto">
          <nav className="flex flex-col px-10 pb-10 pt-24 sm:px-14">
            {/* Sections with their category trees */}
            <div className="flex flex-col gap-8">
              {sections.map((s) => {
                const cats = categories.filter((c) => c.sectionId === s.id);
                return (
                  <div key={s.id} className="flex flex-col">
                    <Link
                      href={`/s/${s.id}`}
                      onClick={close}
                      className="font-sans text-[26px] leading-tight text-ink transition-colors hover:text-brand"
                    >
                      {s.name}
                    </Link>
                    <ul className="mt-3 flex flex-col gap-2">
                      {cats.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={`/c/${c.slug}`}
                            onClick={close}
                            className="text-sm text-ink-muted transition-colors hover:text-ink"
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))}
                      <li className="pt-1">
                        <Link
                          href={`/s/${s.id}`}
                          onClick={close}
                          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand hover:text-brand-dark"
                        >
                          Shop all {s.name} &rarr;
                        </Link>
                      </li>
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Secondary destinations */}
            <ul className="mt-12 flex flex-col">
              {secondaryLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={close}
                    className="block py-2 font-sans text-xl text-ink transition-colors hover:text-brand"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Utility links */}
            <ul className="mt-10 flex flex-col">
              {utilityLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={close}
                    className="block py-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="shrink-0 border-t border-line px-10 py-5 sm:px-14">
          <div className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-3">
              <Link
                href="/account"
                onClick={close}
                className="font-medium text-ink hover:text-brand"
              >
                Sign in
              </Link>
              <span className="text-ink-subtle">&middot;</span>
              <Link
                href="/account"
                onClick={close}
                className="text-ink-muted hover:text-ink"
              >
                Create account
              </Link>
            </div>
            <Link
              href="/account/wishlist"
              onClick={close}
              className="text-ink-muted hover:text-ink"
            >
              Wishlist
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
