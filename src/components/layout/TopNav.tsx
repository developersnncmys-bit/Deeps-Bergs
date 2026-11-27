"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MenuButton } from "./MenuButton";
import { SearchTrigger } from "./SearchTrigger";
import { SearchBar } from "./SearchBar";
import { categories } from "@/lib/mock-data";
import type { SectionId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { openAuth, useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart/CartContext";

type NavLink = {
  label: string;
  href: string;
  sectionId?: SectionId; // present → shows mega-menu dropdown on hover
};

const navLinks: NavLink[] = [
  { label: "Women", href: "/women" },
  { label: "Men", href: "/men" },
  { label: "Wedding", href: "/s/wedding", sectionId: "wedding" },
  { label: "Contemporary", href: "/s/contemporary", sectionId: "contemporary" },
  { label: "Activewear", href: "/s/activewear", sectionId: "activewear" },
  { label: "Rent", href: "/rent" },
  { label: "New In", href: "/new" },
  { label: "Stylist", href: "/stylist" },
  { label: "Membership", href: "/membership" },
];

export function TopNav() {
  const linkCls = "text-ink hover:text-brand transition-colors";
  const router = useRouter();
  const { user } = useAuth();
  const { items: cartItems, openDrawer: openCart } = useCart();
  const cartCount = cartItems.reduce((n, i) => n + i.quantity, 0);
  const onUserIconClick = () => {
    if (user) router.push("/account");
    else openAuth();
  };

  // Hide on scroll-down, show on scroll-up. Always visible near the top.
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  // Mega-menu: which section (if any) is currently hovered.
  const [openSection, setOpenSection] = useState<SectionId | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = (sid: SectionId) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenSection(sid);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenSection(null), 120);
  };
  const keepOpen = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

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
        "sticky top-0 z-40 bg-surface shadow-[0_2px_12px_rgba(23,20,15,0.06)] transition-transform duration-300 ease-out",
        hidden ? "-translate-y-full" : "translate-y-0"
      )}
    >
      {/* MAIN ROW — locale (left) · logo (center) · actions (right) */}
      <div className="relative z-10 grid h-[80px] grid-cols-[1fr_auto_1fr] items-center gap-4 bg-surface px-4 shadow-[0_6px_10px_-8px_rgba(23,20,15,0.12)] sm:gap-6 sm:px-6 lg:px-10">
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
        <Link
          href="/"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="justify-self-center inline-flex items-center"
          aria-label="Deeps & Bergs — home"
        >
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

          {/* Sign In — desktop only. Opens the auth modal for guests,
              navigates to /account dashboard once signed in. */}
          <button
            type="button"
            onClick={onUserIconClick}
            aria-label={user ? "My account" : "Sign in"}
            className={cn("hidden lg:inline-flex", linkCls)}
          >
            <IconUser />
          </button>

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

          {/* Cart with count — opens the slide-in CartDrawer */}
          <button
            type="button"
            onClick={openCart}
            aria-label={`Cart${cartCount > 0 ? ` (${cartCount})` : ""}`}
            className={cn("relative", linkCls)}
          >
            <IconBag />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* CATEGORY ROW — desktop only */}
      <div className="hidden lg:block">
        <div className="flex h-11 items-center gap-6 px-10">
          <nav className="flex flex-1 items-center justify-center gap-7">
            {navLinks.map((link) => {
              const hasMega = Boolean(link.sectionId);
              const active = hasMega && openSection === link.sectionId;
              const isRent = link.href === "/rent";
              return (
                <div
                  key={link.href}
                  onMouseEnter={hasMega ? () => openMenu(link.sectionId!) : undefined}
                  onMouseLeave={hasMega ? scheduleClose : undefined}
                  className="flex h-full items-center"
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "text-[13px] font-bold uppercase tracking-[0.2em] transition-colors",
                      isRent
                        ? "inline-flex h-7 items-center justify-center bg-ink px-4 leading-none text-white hover:bg-brand-dark"
                        : active
                          ? "text-brand"
                          : "text-ink hover:text-brand"
                    )}
                    style={{
                      fontFamily: "var(--font-raleway)",
                      ...(isRent
                        ? {
                            borderRadius: "4px",
                            // Optical centering — compensate for the trailing
                            // letter-spacing on the last character so the word
                            // sits visually centred inside the pill.
                            textIndent: "0.2em",
                          }
                        : {}),
                    }}
                  >
                    {link.label}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ─── MEGA-MENU PANEL (desktop only) ─── */}
      {openSection && (
        <div
          onMouseEnter={keepOpen}
          onMouseLeave={scheduleClose}
          className="absolute left-0 right-0 top-full z-30 hidden border-t border-line bg-surface shadow-[var(--shadow-lg)] lg:block"
        >
          <div className="mx-auto max-w-[var(--container-page)] px-10 py-8">
            {tabbedMegaMenuConfigs[openSection] ? (
              <TabbedMegaMenu
                groups={tabbedMegaMenuConfigs[openSection]!.groups}
                viewAllHref={tabbedMegaMenuConfigs[openSection]!.viewAllHref}
              />
            ) : (
              <MegaMenu sectionId={openSection} />
            )}
          </div>
        </div>
      )}
    </header>
  );
}

/* ─────────── Tabbed mega-menu (Kalki-style) + per-section configs ─────────── */

type MegaTile = { label: string; image: string; href: string };
type TabbedGroup = { label: string; tiles: MegaTile[] };
type TabbedConfig = { groups: Record<string, TabbedGroup>; viewAllHref: string };

const tabbedMegaMenuConfigs: Partial<Record<SectionId, TabbedConfig>> = {
  wedding: {
    viewAllHref: "/s/wedding",
    groups: {
      category: {
        label: "Category",
        tiles: [
          { label: "Wedding Lehenga", image: "/images/category/Lehengas.png", href: "/c/lehenga" },
          { label: "Bridal Saree", image: "/images/category/sarees.png", href: "/c/bridal-saree" },
          { label: "Sherwani", image: "/images/category/sherwanis.png", href: "/c/sherwani" },
          { label: "Groomswear", image: "/images/category/groomswear.png", href: "/c/groomswear" },
        ],
      },
      occasion: {
        label: "Occasion",
        tiles: [
          { label: "Engagement", image: "/images/rental/festive.png", href: "/rent?occasion=engagement" },
          { label: "Mehendi", image: "/images/rental/Mehendi.png", href: "/rent?occasion=mehendi" },
          { label: "Sangeet", image: "/images/rental/sangeet.png", href: "/rent?occasion=sangeet" },
          { label: "Cocktail", image: "/images/rental/cocktail.png", href: "/rent?occasion=cocktail" },
          { label: "Wedding", image: "/images/category/bridal.png", href: "/rent?occasion=wedding" },
          { label: "Reception", image: "/images/rental/reception.png", href: "/rent?occasion=reception" },
        ],
      },
      shopper: {
        label: "Shopper",
        tiles: [
          { label: "Bride", image: "/images/category/bridal.png", href: "/s/wedding?shopper=bride" },
          { label: "Groom", image: "/images/him/him1.png", href: "/s/wedding?shopper=groom" },
          { label: "Bridesmaid", image: "/images/rental/wedding-guest.png", href: "/s/wedding?shopper=bridesmaid" },
          { label: "Groomsman", image: "/images/category/sherwanis.png", href: "/s/wedding?shopper=groomsman" },
          { label: "Wedding Guest", image: "/images/rental/festive.png", href: "/s/wedding?shopper=guest" },
        ],
      },
    },
  },
  contemporary: {
    viewAllHref: "/s/contemporary",
    groups: {
      category: {
        label: "Category",
        tiles: [
          { label: "Sarees", image: "/images/category/sarees.png", href: "/c/sarees" },
          { label: "Kurtas & Sets", image: "/images/category/kurtas-sets.png", href: "/c/kurtas" },
          { label: "Co-ords", image: "/images/category/co-ord.png", href: "/c/co-ords" },
          { label: "Dresses", image: "/images/category/dresses.png", href: "/c/dresses" },
          { label: "Shirts", image: "/images/category/shirts.png", href: "/c/shirts" },
        ],
      },
      occasion: {
        label: "Occasion",
        tiles: [
          { label: "Daywear", image: "/images/category/co-ord.png", href: "/s/contemporary?occasion=daywear" },
          { label: "Festive", image: "/images/rental/festive.png", href: "/s/contemporary?occasion=festive" },
          { label: "Workwear", image: "/images/category/shirts.png", href: "/s/contemporary?occasion=workwear" },
          { label: "Brunch", image: "/images/category/kurtas-sets.png", href: "/s/contemporary?occasion=brunch" },
          { label: "Evening", image: "/images/category/dresses.png", href: "/s/contemporary?occasion=evening" },
        ],
      },
      collection: {
        label: "Collection",
        tiles: [
          { label: "Chikankari Edit", image: "/images/category/kurtas-sets.png", href: "/collections/chikankari-edit" },
          { label: "Linen Capsule", image: "/images/category/co-ord.png", href: "/collections/linen-capsule" },
          { label: "Workwear Edit", image: "/images/category/shirts.png", href: "/collections/workwear-edit" },
          { label: "Festive 2026", image: "/images/rental/festive.png", href: "/collections/festive-2026" },
        ],
      },
    },
  },
  activewear: {
    viewAllHref: "/s/activewear",
    groups: {
      category: {
        label: "Category",
        tiles: [
          { label: "Tops", image: "/images/activewear/tops.png", href: "/c/tops" },
          { label: "Bottoms", image: "/images/activewear/bottom3.png", href: "/c/bottoms" },
          { label: "Lounge", image: "/images/activewear/lounge1.png", href: "/c/lounge" },
          { label: "Outerwear", image: "/images/activewear/outerwear1.png", href: "/c/outerwear" },
        ],
      },
      activity: {
        label: "Activity",
        tiles: [
          { label: "Yoga", image: "/images/3d/products/p-v5.png", href: "/s/activewear?activity=yoga" },
          { label: "Run", image: "/images/3d/products/p-v6.png", href: "/s/activewear?activity=run" },
          { label: "Lounge", image: "/images/3d/products/p-v7.png", href: "/s/activewear?activity=lounge" },
          { label: "Workout", image: "/images/3d/products/p-v8.png", href: "/s/activewear?activity=workout" },
        ],
      },
      collection: {
        label: "Collection",
        tiles: [
          { label: "Studio Essentials", image: "/images/3d/products/p-v1.png", href: "/collections/studio-essentials" },
          { label: "Everyday Fleece", image: "/images/3d/products/p-v4.png", href: "/collections/everyday-fleece" },
          { label: "Seamless Edit", image: "/images/3d/products/p-v2.png", href: "/collections/seamless-edit" },
        ],
      },
    },
  },
};

function TabbedMegaMenu({
  groups,
  viewAllHref,
}: {
  groups: Record<string, TabbedGroup>;
  viewAllHref: string;
}) {
  const keys = Object.keys(groups);
  const [group, setGroup] = useState<string>(keys[0]);
  const tiles = groups[group]?.tiles ?? [];

  return (
    <div className="animate-fade-in grid grid-cols-[180px_1fr] gap-8">
      {/* Left tabs — blush backdrop with a ::before that bleeds 100vw to the left
          so the blush runs continuously from the viewport edge up to the tiles. */}
      <aside className="relative flex h-full min-h-[280px] flex-col gap-1 bg-brand-tint p-3 before:absolute before:bottom-0 before:right-full before:top-0 before:w-screen before:bg-brand-tint before:content-['']">
        {keys.map((k) => {
          const active = k === group;
          return (
            <button
              key={k}
              type="button"
              onMouseEnter={() => setGroup(k)}
              onFocus={() => setGroup(k)}
              onClick={() => setGroup(k)}
              style={{ fontFamily: "var(--font-raleway)" }}
              className={cn(
                "px-3 py-2 text-left text-[12px] uppercase tracking-[0.2em] transition-colors",
                active
                  ? "font-black text-brand-dark"
                  : "font-bold text-ink hover:text-brand-dark",
              )}
            >
              {groups[k].label}
            </button>
          );
        })}
        <Link
          href={viewAllHref}
          className="mt-4 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-ink underline-offset-[6px] hover:text-brand hover:underline"
          style={{ fontFamily: "var(--font-raleway)" }}
        >
          View all &rarr;
        </Link>
      </aside>

      {/* Right grid — fixed height across tabs so the dropdown doesn't jump when
          switching; scrollbar stays visible so users notice there's more below. */}
      <div className="mega-scroll h-[280px] overflow-y-scroll pr-3">
        <div className="grid grid-cols-5 gap-5 pb-2">
          {tiles.map((tile) => (
            <Link key={tile.href + tile.label} href={tile.href} className="group flex flex-col gap-3">
              <div className="relative aspect-[4/5] overflow-hidden bg-bg">
                <Image
                  src={tile.image}
                  alt={tile.label}
                  fill
                  sizes="(min-width: 1024px) 15vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <p
                className="text-center text-[12px] font-bold uppercase tracking-[0.18em] text-ink group-hover:text-brand"
                style={{ fontFamily: "var(--font-raleway)" }}
              >
                {tile.label}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────── Mega-menu ─────────── */

function MegaMenu({ sectionId }: { sectionId: SectionId }) {
  // Only show top-level categories in the mega-menu — sub-categories live inside
  // each category page via the sub-category pill row, so surfacing them here as
  // image-less "B / R / M" tiles just clutters the dropdown.
  const items = categories.filter(
    (c) => c.sectionId === sectionId && !c.parentId,
  );
  return (
    <div className="animate-fade-in">
      <div className="mega-scroll h-[280px] overflow-y-scroll pr-3">
      <div className="grid grid-cols-6 gap-4 pb-2">
        {items.map((cat) => (
          <Link
            key={cat.id}
            href={`/c/${cat.slug}`}
            className="group flex flex-col gap-2"
          >
            <div className="relative aspect-square overflow-hidden bg-bg">
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(min-width: 1024px) 15vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-bg">
                  <span className="text-5xl font-black text-ink-subtle/30">
                    {cat.name[0]}
                  </span>
                </div>
              )}
            </div>
            <p
              className="text-center text-[12px] font-bold uppercase tracking-[0.18em] text-ink group-hover:text-brand"
              style={{ fontFamily: "var(--font-raleway)" }}
            >
              {cat.name}
            </p>
          </Link>
        ))}
      </div>
      </div>
    </div>
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
