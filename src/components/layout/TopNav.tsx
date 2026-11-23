"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MenuButton } from "./MenuButton";
import { SearchTrigger } from "./SearchTrigger";
import { SearchBar } from "./SearchBar";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Wedding", href: "/s/wedding" },
  { label: "Contemporary", href: "/s/contemporary" },
  { label: "Activewear", href: "/s/activewear" },
  { label: "Rent", href: "/rent" },
  { label: "New", href: "/new" },
  { label: "Stylist", href: "/stylist" },
  { label: "Membership", href: "/membership" },
];

export function TopNav() {
  const linkCls = "text-ink hover:text-brand transition-colors";

  // Hide on scroll-down, show on scroll-up. Always visible near the top.
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const dy = y - lastY.current;

      if (y < 80) {
        // Top of page — always visible
        setHidden(false);
      } else if (dy > 4) {
        // Scrolling down past the threshold — hide
        setHidden(true);
      } else if (dy < -4) {
        // Scrolling up — show
        setHidden(false);
      }

      lastY.current = y;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-line bg-surface transition-transform duration-300 ease-out",
        hidden ? "-translate-y-full" : "translate-y-0"
      )}
    >
      {/* MAIN ROW — locale (left) · logo (center) · actions (right) */}
      <div className="grid h-[80px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:gap-6 sm:px-6 lg:px-10">
        {/* Left — hamburger on mobile, empty on desktop (keeps logo centered via 1fr grid) */}
        <div className="flex items-center justify-start">
          <MenuButton
            ariaLabel="Open menu"
            className={cn("lg:hidden", linkCls)}
          >
            <IconMenu />
          </MenuButton>
        </div>

        {/* Center logo */}
        <Link href="/" className="justify-self-center inline-flex items-center" aria-label="Deeps & Bergs — home">
          <Image
            src="/logov6.png"
            alt="Deeps & Bergs"
            width={2145}
            height={733}
            priority
            className="h-12 w-auto sm:h-14 lg:h-16"
          />
        </Link>

        {/* Right actions */}
        <div className="flex items-center justify-end gap-3 sm:gap-5">
          {/* Inline search — underline style, sits just left of Sign In on desktop */}
          <div className="hidden w-56 lg:block xl:w-64">
            <SearchBar tone="light" />
          </div>

          {/* Sign In — desktop only */}
          <Link
            href="/account"
            aria-label="Sign in / account"
            className={cn("hidden lg:inline-flex", linkCls)}
          >
            <IconUser />
          </Link>

          {/* Search icon — mobile only; desktop has the inline SearchBar */}
          <SearchTrigger className={cn("lg:hidden", linkCls)} />

          {/* Wishlist — hidden on very small screens */}
          <Link
            href="/account/wishlist"
            aria-label="Wishlist"
            className={cn("hidden sm:inline-flex", linkCls)}
          >
            <IconHeart />
          </Link>

          {/* Cart with count */}
          <Link
            href="/cart"
            aria-label="Cart"
            className={cn("relative", linkCls)}
          >
            <IconBag />
            <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
              2
            </span>
          </Link>
        </div>
      </div>

      {/* CATEGORY ROW — desktop only */}
      <div className="hidden border-t border-line lg:block">
        <div className="flex h-11 items-center gap-6 px-10">
          <nav className="flex flex-1 items-center justify-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] font-bold uppercase tracking-[0.2em] text-ink hover:text-brand transition-colors"
                style={{ fontFamily: "var(--font-raleway)" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

        </div>
      </div>
    </header>
  );
}

// ─────────── Icons ───────────

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" strokeLinecap="round" />
    </svg>
  );
}
function IconHeart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" strokeLinejoin="round" />
    </svg>
  );
}
function IconBag() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 8h14l-1 12H6L5 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
    </svg>
  );
}
