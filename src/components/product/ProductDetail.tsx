"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  TbHeart,
  TbHeartFilled,
  TbShare3,
  TbHanger2,
  TbTruckDelivery,
  TbTag,
  TbShieldCheck,
  TbRotate2,
  TbAward,
  TbTruck,
  TbShoppingBag,
  TbBolt,
  TbChevronLeft,
  TbChevronRight,
} from "react-icons/tb";
import type { Product, Category } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { RentalWidget } from "@/components/product/RentalWidget";
import { SizeGuideModal } from "@/components/product/SizeGuideModal";
import { useCart } from "@/lib/cart/CartContext";
import { useWishlist } from "@/lib/wishlist/WishlistContext";

export function ProductDetail({
  product,
  category,
  similar = [],
}: {
  product: Product;
  category: Category | null;
  similar?: Product[];
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [activeSize, setActiveSize] = useState<string | null>(null);
  const [tab, setTab] = useState<"buy" | "rent">(
    product.mode === "rent" ? "rent" : "buy",
  );
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const { addItem, openDrawer } = useCart();
  const { has: isWishlisted, toggle: toggleWishlist } = useWishlist();
  const liked = isWishlisted(product.id);

  // Sticky bottom add-to-bag bar: shown once the ENTIRE hero (gallery + info)
  // scrolls out of view. Observing the CTA button alone would wrongly trigger
  // on taller products where the CTA sits below the fold on first load.
  const heroRef = useRef<HTMLDivElement>(null);
  const [stickyVisible, setStickyVisible] = useState(false);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleAddToBag = () => {
    if (!activeSize) {
      setSizeGuideOpen(true);
      return;
    }
    addItem({
      productId: product.id,
      size: activeSize,
      quantity: 1,
      mode: "buy",
    });
    openDrawer();
  };
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    details: true,
    styleTips: false,
    shipping: false,
    faqs: false,
  });

  const canBuy = product.mode === "buy" || product.mode === "both";
  const canRent = product.mode === "rent" || product.mode === "both";
  const sizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const hasDiscount =
    product.mrp && product.price && product.mrp > product.price;
  const couponPrice = product.price ? Math.round(product.price * 0.93) : null; // 7% off
  // Compute the delivery estimate on the client — Next disallows `new Date()`
  // in a client component's render path because it would freeze during prerender.
  const [dateLabel, setDateLabel] = useState<string>("");
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    setDateLabel(
      d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
    );
  }, []);

  const toggleAccordion = (key: string) =>
    setOpenAccordions((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div className="bg-white pb-20">
      {/* Breadcrumb */}
      <nav className="mx-auto max-w-[1500px] px-4 pt-6 text-[11px] uppercase tracking-[0.2em] text-ink-muted sm:px-6 lg:px-10">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span className="mx-2 text-ink-subtle">/</span>
        <Link href="/shop" className="hover:text-ink">Shop</Link>
        {category && (
          <>
            <span className="mx-2 text-ink-subtle">/</span>
            <Link href={`/c/${category.slug}`} className="hover:text-ink">
              {category.name}
            </Link>
          </>
        )}
        <span className="mx-2 text-ink-subtle">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      {/* Hero */}
      <div ref={heroRef} className="mx-auto mt-6 max-w-[1340px] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
          {/* Gallery — thumbs left, main right (Kalki-style) */}
          <div className="flex gap-4">
            {/* Vertical thumb strip (desktop) / horizontal (mobile) */}
            <div className="order-2 hidden flex-col gap-3 lg:order-1 lg:flex lg:w-20 xl:w-24">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`relative aspect-square overflow-hidden border transition-colors ${i === activeImage ? "border-ink" : "border-line hover:border-ink"}`}
                >
                  <Image src={img} alt="" fill sizes="96px" className="object-cover" />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="relative order-1 aspect-[3/4] flex-1 overflow-hidden bg-surface lg:order-2 lg:max-h-[740px]">
              <Image
                src={product.images[activeImage] ?? product.images[0]}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
                priority
              />
              {/* Try On badge (SOW A01) */}
              <button
                type="button"
                className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm transition-colors hover:bg-[#3a3a3a]"
              >
                <TbHanger2 size={14} />
                Try On
              </button>
              {product.tags?.includes("New") && (
                <span className="absolute right-4 top-4 bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-ink">
                  New
                </span>
              )}
            </div>

            {/* Mobile thumb strip under main */}
            <div className="order-3 flex gap-3 lg:hidden">
              {/* Hidden on desktop via conditional above; left empty on mobile fallback below */}
            </div>
          </div>

          {/* Mobile: horizontal thumb strip */}
          <div className="order-3 flex gap-3 overflow-x-auto lg:hidden">
            {product.images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                className={`relative h-20 w-16 shrink-0 overflow-hidden border ${i === activeImage ? "border-ink" : "border-line"}`}
                aria-label={`View image ${i + 1}`}
              >
                <Image src={img} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>

          {/* Info column */}
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                {product.brand && (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-muted">
                    {product.brand}
                  </p>
                )}
                <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">
                  {product.name}
                </h1>
                {product.rating != null && (
                  <p className="mt-1 text-sm text-ink-muted">
                    ★ {product.rating.toFixed(1)}{" "}
                    <span className="text-ink-subtle">
                      ({product.reviewCount ?? 0} reviews)
                    </span>
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink hover:bg-bg"
                >
                  {liked ? (
                    <TbHeartFilled size={18} style={{ color: "var(--color-brand)" }} />
                  ) : (
                    <TbHeart size={18} />
                  )}
                </button>
                <button
                  type="button"
                  aria-label="Share"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink hover:bg-bg"
                >
                  <TbShare3 size={18} />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              {product.price != null ? (
                <>
                  <span className="font-serif text-2xl text-ink">
                    {formatINR(product.price)}
                  </span>
                  {hasDiscount && product.mrp != null && (
                    <span className="text-sm text-ink-subtle line-through">
                      {formatINR(product.mrp)}
                    </span>
                  )}
                  <span className="text-xs text-ink-muted">Inclusive of all taxes</span>
                </>
              ) : (
                <span className="text-xs text-ink-muted">Rental-only — see Rent panel</span>
              )}
            </div>

            {/* Buy / Rent tabs — only if both are available */}
            {canBuy && canRent && (
              <div className="inline-flex rounded-full border border-ink p-1 self-start">
                <button type="button" onClick={() => setTab("buy")}
                  className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${tab === "buy" ? "bg-ink text-white" : "text-ink hover:bg-bg"}`}>
                  Buy
                </button>
                <button type="button" onClick={() => setTab("rent")}
                  className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${tab === "rent" ? "bg-ink text-white" : "text-ink hover:bg-bg"}`}>
                  Rent
                </button>
              </div>
            )}

            {tab === "buy" && canBuy && (
              <>
                {/* Size grid */}
                {sizes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-ink">Size</p>
                      <button
                        type="button"
                        onClick={() => setSizeGuideOpen(true)}
                        className="text-xs text-ink underline underline-offset-4 hover:text-brand"
                      >
                        Size Guide
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-6 gap-2">
                      {sizes.map((s) => {
                        const inStock = product.variants.some((v) => v.size === s && v.inStock);
                        const active = s === activeSize;
                        return (
                          <button key={s} type="button" disabled={!inStock}
                            onClick={() => setActiveSize(s)}
                            className={`flex h-12 items-center justify-center border text-sm font-semibold transition-colors ${
                              !inStock ? "border-line-strong text-ink-subtle line-through cursor-not-allowed" :
                              active ? "border-ink bg-ink text-white" :
                              "border-ink text-ink hover:bg-ink hover:text-white"
                            }`}>
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Delivered by */}
                <div className="flex items-center gap-3 rounded-lg border border-line bg-bg px-4 py-3 text-sm">
                  <TbTruckDelivery size={22} strokeWidth={2.2} className="shrink-0 text-ink" />
                  <div className="flex flex-1 items-baseline justify-between">
                    <span className="text-ink-muted">Delivered by</span>
                    <span className="font-semibold text-ink">{dateLabel}</span>
                  </div>
                </div>

                {/* Coupon */}
                {couponPrice != null && (
                  <div className="border border-dashed border-brand-dark bg-brand-tint/40 p-4 text-sm">
                    <p className="flex items-center gap-2">
                      <TbTag size={16} className="text-brand-dark" />
                      <span>
                        Get it for{" "}
                        <span className="font-bold text-ink">{formatINR(couponPrice)}</span>
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      Get FLAT 7% OFF, up to ₹1,000. Use code{" "}
                      <span className="font-bold text-brand-dark">CELEBRATION7</span>
                    </p>
                  </div>
                )}

                {/* CTAs */}
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleAddToBag}
                    className="group flex w-full items-center justify-center gap-2 border-2 border-ink bg-white px-6 py-4 text-xs font-bold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-white"
                  >
                    <TbShoppingBag size={16} />
                    Add to Bag · {product.price ? formatINR(product.price) : "—"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddToBag();
                      // handleAddToBag already opens the drawer; from there the
                      // user can proceed to checkout.
                    }}
                    className="flex w-full items-center justify-center gap-2 bg-ink px-6 py-4 text-xs font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#3a3a3a]"
                  >
                    <TbBolt size={16} />
                    Buy It Now
                  </button>
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-4 gap-2 border-y border-line py-5 text-center">
                  {[
                    { Icon: TbShieldCheck, title: "100% Purchase", sub: "Protection" },
                    { Icon: TbRotate2, title: "5 Days Easy", sub: "Returns" },
                    { Icon: TbAward, title: "Assured", sub: "Quality" },
                    { Icon: TbTruck, title: "Free", sub: "Shipping*" },
                  ].map(({ Icon, title, sub }) => (
                    <div key={title} className="flex flex-col items-center gap-1.5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink">
                        <Icon size={18} />
                      </span>
                      <p className="text-[11px] font-semibold leading-tight text-ink">{title}</p>
                      <p className="text-[11px] leading-tight text-ink-muted">{sub}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "rent" && canRent && <RentalWidget product={product} />}
          </div>
        </div>
      </div>

      {/* Accordions below the hero (SOW C01 — product detail: fabric & care, etc.) */}
      <div className="mx-auto mt-12 max-w-[1340px] px-4 sm:px-6 lg:px-10">
        <div className="border-t border-line">
          <Accordion
            label="Product Details"
            open={openAccordions.details}
            onToggle={() => toggleAccordion("details")}
          >
            <p className="pt-3 text-sm leading-relaxed text-ink">
              {product.description}
            </p>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              {product.fabric && (
                <>
                  <dt className="text-ink-muted">Fabric</dt>
                  <dd className="text-ink">{product.fabric}</dd>
                </>
              )}
              {product.care && (
                <>
                  <dt className="text-ink-muted">Care</dt>
                  <dd className="text-ink">{product.care}</dd>
                </>
              )}
              {product.occasion && product.occasion.length > 0 && (
                <>
                  <dt className="text-ink-muted">Occasion</dt>
                  <dd className="text-ink">{product.occasion.join(", ")}</dd>
                </>
              )}
            </dl>
          </Accordion>
          <Accordion
            label="Style & Fit Tips"
            open={openAccordions.styleTips}
            onToggle={() => toggleAccordion("styleTips")}
          >
            <ul className="list-disc space-y-1 pl-5 pt-3 text-sm text-ink-muted">
              <li>Model is 5&apos;8&quot; and wears a size S.</li>
              <li>Pair with heels for reception-ready height, flats for daytime.</li>
              <li>Steam before wear — do not iron directly on embroidery.</li>
            </ul>
          </Accordion>
          <Accordion
            label="Cancellation, Shipping & Returns"
            open={openAccordions.shipping}
            onToggle={() => toggleAccordion("shipping")}
          >
            <p className="pt-3 text-sm text-ink-muted">
              Free shipping on orders over ₹3,000. 5-day easy returns on
              unworn items with tags. Rental deposits refunded in 3 working
              days after return and inspection.
            </p>
          </Accordion>
          <Accordion
            label="FAQs"
            open={openAccordions.faqs}
            onToggle={() => toggleAccordion("faqs")}
          >
            <div className="space-y-5 pt-3">
              {[
                {
                  q: "What if I want to exchange or return my order?",
                  a: "Exchanges and returns are available for products within 5 days of delivery. Items must be in original condition with all tags intact.",
                },
                {
                  q: "Will I receive a quality product by Deeps & Bergs?",
                  a: "Every piece goes through a 5-step quality control process — fabric inspection, stitching review, finishing check, final steam, and QC sign-off — before it ships.",
                },
              ].map((item) => (
                <div key={item.q}>
                  <p className="text-sm font-semibold text-ink">{item.q}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                    {item.a}
                  </p>
                </div>
              ))}
              <Link
                href="/faqs"
                className="inline-flex text-sm font-semibold text-brand-dark underline underline-offset-4 hover:text-ink"
              >
                Read More FAQs
              </Link>
            </div>
          </Accordion>
        </div>
      </div>

      {/* Similar products carousel */}
      {similar.length > 0 && (
        <SimilarProducts items={similar} category={category} />
      )}

      {sizeGuideOpen && (
        <SizeGuideModal
          product={product}
          onClose={() => setSizeGuideOpen(false)}
          onSelectSize={(size) => setActiveSize(size)}
          selectedSize={activeSize}
        />
      )}

      {/* Sticky bottom add-to-bag — reveals after the hero CTAs scroll out */}
      <StickyAddToBagBar
        product={product}
        visible={stickyVisible}
        canBuy={canBuy}
        onAdd={handleAddToBag}
        onOpenSize={() => setSizeGuideOpen(true)}
        activeSize={activeSize}
      />
    </div>
  );
}

function StickyAddToBagBar({
  product,
  visible,
  canBuy,
  onAdd,
  activeSize,
}: {
  product: Product;
  visible: boolean;
  canBuy: boolean;
  onAdd: () => void;
  onOpenSize: () => void;
  activeSize: string | null;
}) {
  // Rent-only items never show a Buy price here; the user needs the hero to
  // configure the rental, so we just hide the bar for pure-rent SKUs.
  if (!canBuy) return null;

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white shadow-[0_-6px_18px_rgba(0,0,0,0.06)] transition-transform duration-300 ${visible ? "translate-y-0" : "translate-y-full"}`}
    >
      <div className="mx-auto flex max-w-[1340px] items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-10">
        <div className="relative h-14 w-12 shrink-0 overflow-hidden bg-surface">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-semibold text-ink">
            {product.name}
          </p>
          <p className="text-xs text-ink">
            {product.price != null && (
              <span className="font-semibold">
                {formatINR(product.price)}
              </span>
            )}
            {activeSize && (
              <span className="ml-2 text-ink-muted">· Size {activeSize}</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex shrink-0 items-center justify-center gap-2 bg-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#3a3a3a] sm:px-8"
        >
          <TbShoppingBag size={14} />
          <span className="hidden sm:inline">Add to Cart</span>
          <span className="sm:hidden">Add</span>
          {product.price != null && (
            <span className="hidden sm:inline">
              · {formatINR(product.price)}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

function SimilarProducts({
  items,
  category,
}: {
  items: Product[];
  category: Category | null;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollByPage = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="mx-auto mt-16 max-w-[1340px]">
      <div className="mb-6 flex items-end justify-between px-4 sm:px-6 lg:px-10">
        <h2 className="font-serif text-2xl text-ink sm:text-3xl">
          You may also like
        </h2>
        <Link
          href={category ? `/c/${category.slug}` : "/shop"}
          className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink underline-offset-[6px] hover:underline"
        >
          View all {category?.name ?? ""} →
        </Link>
      </div>

      {/* .relative wraps the padded scroll container + absolutely-positioned
          arrows. Arrows use the same left/right values as the inner padding
          so they sit flush with the card edges. */}
      <div className="relative">
        <div className="overflow-hidden px-4 sm:px-6 lg:px-10">
          <div
            ref={scrollRef}
            className="no-scrollbar overflow-x-auto scroll-smooth"
          >
            <div className="flex gap-4 pb-2 sm:gap-5 lg:gap-6">
              {items.map((p) => (
                <SimilarCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>

        {/* Prev / Next arrows — attached to the inner-padding edge */}
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          aria-label="Scroll similar products left"
          className="absolute left-4 top-[43%] z-10 hidden h-14 w-10 -translate-y-1/2 items-center justify-center bg-white text-ink shadow-[0_6px_18px_rgba(0,0,0,0.12)] transition-colors hover:bg-white/95 sm:left-6 sm:flex lg:left-10"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          aria-label="Scroll similar products right"
          className="absolute right-4 top-[43%] z-10 hidden h-14 w-10 -translate-y-1/2 items-center justify-center bg-white text-ink shadow-[0_6px_18px_rgba(0,0,0,0.12)] transition-colors hover:bg-white/95 sm:right-6 sm:flex lg:right-10"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
}

function SimilarCard({ product }: { product: Product }) {
  const minRent = product.rentalPricing?.[0]?.price;
  const hasDiscount = product.mrp && product.price && product.mrp > product.price;
  return (
    <Link
      href={`/p/${product.slug}`}
      className="group flex w-[220px] shrink-0 flex-col gap-3 sm:w-[240px] lg:w-[260px]"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-surface">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="260px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {product.tags?.includes("New") && (
          <span className="absolute left-3 top-3 bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
            New
          </span>
        )}
      </div>
      <div className="flex flex-col">
        {product.brand && (
          <p className="text-sm font-semibold text-ink">{product.brand}</p>
        )}
        <h3 className="line-clamp-1 text-sm text-ink group-hover:text-brand">
          {product.name}
        </h3>
        <div className="mt-1 flex items-baseline gap-2 text-sm">
          {product.price != null ? (
            <>
              <span className="font-semibold text-ink">{formatINR(product.price)}</span>
              {hasDiscount && (
                <span className="text-xs text-ink-subtle line-through">
                  {formatINR(product.mrp!)}
                </span>
              )}
            </>
          ) : minRent != null ? (
            <span className="font-semibold text-ink">
              Rent from {formatINR(minRent)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function Accordion({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-semibold uppercase tracking-wider text-ink">
          {label}
        </span>
        <span className="flex h-6 w-6 items-center justify-center text-ink">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            {open ? <path d="M5 12h14" strokeLinecap="round" />
                  : <path d="M12 5v14M5 12h14" strokeLinecap="round" />}
          </svg>
        </span>
      </button>
      {open && <div className="pb-5">{children}</div>}
    </div>
  );
}
