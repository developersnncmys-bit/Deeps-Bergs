"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { TbShoppingBag, TbVolume, TbVolumeOff, TbX } from "react-icons/tb";
import { Container } from "@/components/ui/Container";

type TaggedProduct = {
  name: string;
  price: string;
  thumb: string;
  href: string;
};

type VideoCard = {
  id: string;
  poster: string;
  href: string;
  label: string;
  caption: string;
  video?: string;
  source:
    | { kind: "brand" }
    | { kind: "creator"; handle: string; avatar: string };
  taggedProduct: TaggedProduct;
};

const cards: VideoCard[] = [
  {
    id: "v-001",
    poster: "/images/rental/cocktail.png",
    video: "/images/try-on.mp4",
    href: "/videos/party-ready",
    label: "Party ready",
    caption: "That bronze-hour glow ✨ styled this tissue saree three ways — swipe for the drape. #DBFParty",
    source: { kind: "brand" },
    taggedProduct: {
      name: "Bronze tissue saree",
      price: "₹22,500",
      thumb: "/images/rental/cocktail.png",
      href: "/p/bronze-tissue-saree",
    },
  },
  {
    id: "v-002",
    poster: "/images/category/bridal.png",
    video: "/images/try-on.mp4",
    href: "/videos/bridal-trial",
    label: "Bridal trial",
    caption: "Peach, pearls & zardozi — my try-on day for this one took 4 hours and I'd do it again 🤍 #BridalDiaries",
    source: {
      kind: "creator",
      handle: "@ananya.k",
      avatar: "/images/rental/wedding-guest.png",
    },
    taggedProduct: {
      name: "Peach bridal lehenga",
      price: "₹58,000",
      thumb: "/images/category/bridal.png",
      href: "/p/peach-bridal-lehenga",
    },
  },
  {
    id: "v-003",
    poster: "/images/rental/sangeet.png",
    video: "/images/try-on.mp4",
    href: "/videos/rent-the-set",
    label: "Rent the set",
    caption: "Wine sequins for sangeet night — rented for 4 days, no storage, no dry-clean bill. Worth it.",
    source: { kind: "brand" },
    taggedProduct: {
      name: "Wine sequin lehenga — rent",
      price: "₹4,800 / 4d",
      thumb: "/images/rental/sangeet.png",
      href: "/p/wine-sequin-lehenga",
    },
  },
  {
    id: "v-004",
    poster: "/images/him/him1.png",
    video: "/images/try-on.mp4",
    href: "/videos/menswear-drop",
    label: "Menswear drop",
    caption: "The ivory sherwani I'm wearing to my cousin's reception. Clean cut, no overdone bling. #GroomFit",
    source: {
      kind: "creator",
      handle: "@rahul.m",
      avatar: "/images/category/groomswear.png",
    },
    taggedProduct: {
      name: "Ivory sherwani",
      price: "₹42,000",
      thumb: "/images/him/him1.png",
      href: "/p/ivory-sherwani",
    },
  },
  {
    id: "v-005",
    poster: "/images/rental/Mehendi.png",
    video: "/images/try-on.mp4",
    href: "/videos/mehendi-morning",
    label: "Mehendi morning",
    caption: "Marigold organza + fresh gajra = the easiest mehendi look I've styled all season 🌼 tap the tag to shop.",
    source: {
      kind: "creator",
      handle: "@studio.ira",
      avatar: "/images/category/co-ord.png",
    },
    taggedProduct: {
      name: "Marigold organza set",
      price: "₹26,500",
      thumb: "/images/rental/Mehendi.png",
      href: "/p/marigold-organza-set",
    },
  },
  {
    id: "v-006",
    poster: "/images/rental/reception.png",
    video: "/images/try-on.mp4",
    href: "/videos/reception-shine",
    label: "Reception shine",
    caption: "Reception-ready in under a minute — this champagne drape saree comes pre-pinned. No safety pins, promise.",
    source: { kind: "brand" },
    taggedProduct: {
      name: "Champagne drape saree",
      price: "₹38,000",
      thumb: "/images/rental/reception.png",
      href: "/p/champagne-drape-saree",
    },
  },
  {
    id: "v-007",
    poster: "/images/rental/festive.png",
    video: "/images/try-on.mp4",
    href: "/videos/festive-edit",
    label: "Festive edit",
    caption: "Jade kurta set for the pooja, roti & gossip combo. Light, breathable, pocketed. (yes, pockets) 💚",
    source: {
      kind: "creator",
      handle: "@maya.r",
      avatar: "/images/category/kurtas-sets.png",
    },
    taggedProduct: {
      name: "Jade kurta set",
      price: "₹14,800",
      thumb: "/images/category/kurtas-sets.png",
      href: "/p/jade-kurta-set",
    },
  },
  {
    id: "v-008",
    poster: "/images/category/co-ord.png",
    video: "/images/try-on.mp4",
    href: "/videos/daywear-drop",
    label: "Daywear drop",
    caption: "Everyday linen, done deliberately. The co-ord set I'm basically living in this week. #DaywearDrop",
    source: { kind: "brand" },
    taggedProduct: {
      name: "Linen co-ord set",
      price: "₹9,500",
      thumb: "/images/category/co-ord.png",
      href: "/p/linen-coord-set",
    },
  },
];

const AUTO_SCROLL_MS = 1800;

export function ChapterVideos() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [openCard, setOpenCard] = useState<VideoCard | null>(null);

  // Only arm the auto-scroll once the strip is on screen.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (paused || openCard || !inView) return;
    const el = scrollRef.current;
    if (!el) return;

    const id = window.setInterval(() => {
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: el.clientWidth / 4 + 20, behavior: "smooth" });
      }
    }, AUTO_SCROLL_MS);

    return () => window.clearInterval(id);
  }, [paused, openCard, inView]);

  return (
    <section
      id="chapter-videos"
      className="scroll-mt-20 border-t border-line bg-white py-16 sm:py-20 lg:py-24"
    >
      <Container>
        <div className="mb-8 flex flex-col items-center gap-3 text-center sm:mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-muted">
            Shoppable Video
          </p>
          <h2 className="font-sans text-2xl uppercase tracking-[0.15em] text-ink sm:text-3xl lg:text-4xl">
            Shop the Reels
          </h2>
          <p className="mx-auto max-w-md text-sm text-ink-muted">
            Brand drops and creator looks in a vertical feed. Every garment is
            tagged — tap the product to view or hit + to drop it in your bag.
          </p>
        </div>
      </Container>

      <div className="relative">
        <div
          ref={scrollRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
          className="no-scrollbar overflow-x-auto scroll-smooth"
        >
          <div className="flex snap-x snap-mandatory gap-4 px-4 sm:gap-5 sm:px-6 lg:gap-6 lg:px-10">
            {cards.map((c) => (
              <VideoTile key={c.id} card={c} onOpen={() => setOpenCard(c)} />
            ))}
            <div className="w-4 shrink-0 sm:w-6 lg:w-10" aria-hidden />
          </div>
        </div>

        {/* Prev / Next arrows */}
        <button
          type="button"
          onClick={() =>
            scrollRef.current?.scrollBy({
              left: -(scrollRef.current.clientWidth / 4 + 20),
              behavior: "smooth",
            })
          }
          aria-label="Previous reel"
          className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 text-ink shadow-md backdrop-blur transition-colors hover:border-ink hover:bg-white sm:flex lg:left-5"
        >
          <ReelChevron direction="left" />
        </button>
        <button
          type="button"
          onClick={() =>
            scrollRef.current?.scrollBy({
              left: scrollRef.current.clientWidth / 4 + 20,
              behavior: "smooth",
            })
          }
          aria-label="Next reel"
          className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 text-ink shadow-md backdrop-blur transition-colors hover:border-ink hover:bg-white sm:flex lg:right-5"
        >
          <ReelChevron direction="right" />
        </button>
      </div>

      {openCard && (
        <VideoModal card={openCard} onClose={() => setOpenCard(null)} />
      )}
    </section>
  );
}

function VideoTile({ card, onOpen }: { card: VideoCard; onOpen: () => void }) {
  return (
    <article className="group relative aspect-[2/3] w-[82vw] shrink-0 snap-start overflow-hidden rounded-[var(--radius-xl)] bg-surface sm:w-[52vw] lg:w-[22vw]">
      <Image
        src={card.poster}
        alt={card.label}
        fill
        sizes="(min-width: 1024px) 22vw, (min-width: 640px) 52vw, 82vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20" />

      <SourceChip source={card.source} />
      <PlayGlyph />

      {/* Click target for the video — opens the modal */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Watch ${card.label}`}
        className="absolute inset-x-0 top-0 bottom-[150px] z-10"
      />

      {/* Reel-style caption — sits just above the product tag */}
      <ReelCaption caption={card.caption} />

      {/* Product tag — always visible */}
      <ProductTag product={card.taggedProduct} />
    </article>
  );
}

function ReelCaption({ caption }: { caption: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="pointer-events-auto absolute inset-x-3 bottom-[70px] z-10 text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
      <p
        className={
          "text-[12.5px] leading-[1.4] text-white/95 " +
          (expanded ? "" : "line-clamp-2")
        }
      >
        {caption}
      </p>
      {caption.length > 70 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="mt-0.5 text-[11px] font-semibold text-white/70 hover:text-white"
        >
          {expanded ? "less" : "more"}
        </button>
      )}
    </div>
  );
}

function VideoModal({ card, onClose }: { card: VideoCard; onClose: () => void }) {
  const [muted, setMuted] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Lock scroll and listen for Esc
  useEffect(() => {
    setMounted(true);
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
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={card.label}
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative aspect-[9/16] w-full max-w-[380px] overflow-hidden rounded-[var(--radius-xl)] bg-black shadow-2xl"
      >
        {card.video ? (
          <video
            key={card.id}
            src={card.video}
            autoPlay
            loop
            muted={muted}
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <Image src={card.poster} alt={card.label} fill sizes="380px" className="object-cover" />
        )}

        {/* Subtle gradient so chips/tags read on busy footage */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />

        {/* Source chip + reel caption */}
        <SourceChip source={card.source} />
        <ReelCaption caption={card.caption} />

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
        >
          <TbX size={18} />
        </button>

        {/* Mute toggle */}
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
          className="absolute right-3 top-14 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
        >
          {muted ? <TbVolumeOff size={18} /> : <TbVolume size={18} />}
        </button>

        {/* Product tag at bottom */}
        <ProductTag product={card.taggedProduct} />
      </div>
    </div>,
    document.body,
  );
}

function ProductTag({ product }: { product: TaggedProduct }) {
  const [added, setAdded] = useState(false);

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="absolute inset-x-3 bottom-3 z-20 flex items-center gap-2 rounded-[6px] bg-white/95 py-1.5 pl-1.5 pr-2 shadow-lg backdrop-blur">
      <Link
        href={product.href}
        className="group/link flex min-w-0 flex-1 items-center gap-2.5"
      >
        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-[4px] ring-1 ring-black/5">
          <Image
            src={product.thumb}
            alt=""
            fill
            sizes="36px"
            className="object-cover"
          />
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[12px] font-semibold text-ink transition-colors group-hover/link:text-brand">
            {product.name}
          </span>
          <span className="text-[11px] text-ink-muted">{product.price}</span>
        </span>
      </Link>

      <button
        type="button"
        onClick={addToCart}
        aria-label={added ? `${product.name} added to bag` : `Add ${product.name} to bag`}
        className={
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] text-white transition-colors " +
          (added ? "bg-success" : "bg-ink hover:bg-brand")
        }
      >
        {added ? <CheckIcon /> : <TbShoppingBag size={16} strokeWidth={1.8} />}
      </button>
    </div>
  );
}

function SourceChip({ source }: { source: VideoCard["source"] }) {
  if (source.kind === "brand") {
    return (
      <span className="absolute left-3 top-3 z-10 rounded-[4px] bg-ink px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
        Brand
      </span>
    );
  }
  return (
    <span className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-[4px] border border-white bg-transparent py-1 pl-1 pr-3 text-[11px] font-semibold text-white">
      <span className="relative h-5 w-5 overflow-hidden rounded-[3px]">
        <Image src={source.avatar} alt="" fill sizes="20px" className="object-cover" />
      </span>
      {source.handle}
    </span>
  );
}

function PlayGlyph() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        <path d="M4 2.5v11l10-5.5-10-5.5z" />
      </svg>
    </span>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
      <path d="M5 12l5 5 9-11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ReelChevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
