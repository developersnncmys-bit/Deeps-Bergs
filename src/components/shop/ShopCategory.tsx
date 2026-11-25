"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product, Category } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import {
  BrowseDatesSection,
  ReserveInAdvanceModal,
} from "@/components/rent/RentCatalog";

// Per SOW C01: sort by relevance, price, newest, popularity.
export type SortKey =
  | "relevance"
  | "popularity"
  | "newest"
  | "price-low"
  | "price-high";

export const sortLabels: Record<SortKey, string> = {
  relevance: "Relevance",
  popularity: "Popularity",
  newest: "Newest",
  "price-low": "Price: Low to High",
  "price-high": "Price: High to Low",
};

// Per SOW C01: Buy or rent filter.
export type ModeFilter = "all" | "buy" | "rent";

const MENS_CATS = new Set(["sherwani", "groomswear"]);
const WOMENS_CATS = new Set([
  "lehenga",
  "bridal-saree",
  "sarees",
  "kurtas",
  "co-ords",
  "dresses",
]);

function getProductGender(p: Product): "Men" | "Women" | "Unisex" {
  const isMen = p.categoryIds.some((id) => MENS_CATS.has(id));
  const isWomen = p.categoryIds.some((id) => WOMENS_CATS.has(id));
  if (isMen && !isWomen) return "Men";
  if (isWomen && !isMen) return "Women";
  return "Unisex";
}

export function ShopCategory({
  category,
  items,
  siblings,
  subCategories = [],
  parent = null,
}: {
  category: Category;
  items: Product[];
  siblings: Category[];
  subCategories?: Category[];
  parent?: Category | null;
}) {
  const [sort, setSort] = useState<SortKey>("relevance");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [mode, setMode] = useState<ModeFilter>("all");

  // Rental date window (SOW C01 — "rental date availability" filter). Lives here
  // so the drawer chip and the Reserve-In-Advance modal share the same state.
  const [datesCleared, setDatesCleared] = useState(true);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [rentalDuration, setRentalDuration] = useState<3 | 5 | 7>(3);
  // Initialise with epoch and hydrate on mount — Next.js disallows `new Date()`
  // in a Client Component's initial state because it would freeze into the
  // prerender output. Picking the real "today" happens client-side instead.
  const [rentalStart, setRentalStart] = useState<Date>(() => new Date(0));
  useEffect(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setRentalStart(d);
  }, []);
  const rentalEnd = useMemo(() => {
    const d = new Date(rentalStart);
    d.setDate(d.getDate() + rentalDuration);
    return d;
  }, [rentalStart, rentalDuration]);

  // Compute price bounds from this category's items
  const priceBounds = useMemo(() => {
    const prices = items.map((p) => p.price).filter((n): n is number => n != null);
    if (prices.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [items]);
  const [priceMax, setPriceMax] = useState<number>(priceBounds.max);

  // Facet lists derived from this category's items
  const allSizes = useMemo(() => {
    const s = new Set<string>();
    items.forEach((p) => p.variants.forEach((v) => s.add(v.size)));
    return Array.from(s);
  }, [items]);
  const allOccasions = useMemo(() => {
    const s = new Set<string>();
    items.forEach((p) => p.occasion?.forEach((o) => s.add(o)));
    return Array.from(s).sort();
  }, [items]);
  const allFabrics = useMemo(() => {
    const s = new Set<string>();
    items.forEach((p) =>
      p.fabric?.split(",").forEach((f) => s.add(f.trim())),
    );
    return Array.from(s).sort();
  }, [items]);
  const allColors = useMemo(() => {
    const m = new Map<string, string>();
    items.forEach((p) =>
      p.variants.forEach((v) => {
        if (!m.has(v.color)) m.set(v.color, v.colorHex || "#999999");
      }),
    );
    return Array.from(m.entries()).map(([name, hex]) => ({ name, hex }));
  }, [items]);
  const allBrands = useMemo(() => {
    const s = new Set<string>();
    items.forEach((p) => p.brand && s.add(p.brand));
    return Array.from(s).sort();
  }, [items]);
  // Hide the Gender filter entirely when the current category is already
  // gender-specific (e.g. Lehengas, Sherwanis, or any of their sub-categories) —
  // the filter would be a no-op there. Returning [] makes the drawer skip the section.
  const allGenders = useMemo(() => {
    const idToCheck = category.parentId ?? category.id;
    if (MENS_CATS.has(idToCheck) || WOMENS_CATS.has(idToCheck)) return [];
    return ["Men", "Women"];
  }, [category.id, category.parentId]);

  const sorted = useMemo(() => {
    let base = items;

    // Buy or Rent mode filter (SOW C01)
    if (mode === "buy") {
      base = base.filter((p) => p.mode === "buy" || p.mode === "both");
    } else if (mode === "rent") {
      base = base.filter((p) => p.mode === "rent" || p.mode === "both");
    }

    if (selectedSizes.length > 0) {
      base = base.filter((p) =>
        p.variants.some((v) => selectedSizes.includes(v.size)),
      );
    }
    if (selectedOccasions.length > 0) {
      base = base.filter((p) =>
        p.occasion?.some((o) => selectedOccasions.includes(o)),
      );
    }
    if (selectedFabrics.length > 0) {
      base = base.filter((p) =>
        p.fabric
          ?.split(",")
          .map((f) => f.trim())
          .some((f) => selectedFabrics.includes(f)),
      );
    }
    if (selectedColors.length > 0) {
      base = base.filter((p) =>
        p.variants.some((v) => selectedColors.includes(v.color)),
      );
    }
    if (selectedBrands.length > 0) {
      base = base.filter((p) => p.brand && selectedBrands.includes(p.brand));
    }
    if (selectedGenders.length > 0) {
      base = base.filter((p) => selectedGenders.includes(getProductGender(p)));
    }
    if (priceMax < priceBounds.max) {
      base = base.filter((p) => (p.price ?? Infinity) <= priceMax);
    }

    const out = [...base];
    const price = (p: Product) => p.price ?? p.rentalPricing?.[0]?.price ?? Infinity;
    if (sort === "price-low") out.sort((a, b) => price(a) - price(b));
    else if (sort === "price-high") out.sort((a, b) => price(b) - price(a));
    else if (sort === "newest") {
      out.sort(
        (a, b) =>
          (b.tags?.includes("New") ? 1 : 0) - (a.tags?.includes("New") ? 1 : 0),
      );
    } else if (sort === "popularity") {
      // Popularity = rating × reviewCount as a simple proxy until real analytics land.
      const score = (p: Product) => (p.rating ?? 0) * (p.reviewCount ?? 0);
      out.sort((a, b) => score(b) - score(a));
    }
    // "relevance" is the catalogue's natural order (no re-sort).
    return out;
  }, [
    items,
    sort,
    mode,
    selectedSizes,
    selectedOccasions,
    selectedFabrics,
    selectedColors,
    selectedBrands,
    selectedGenders,
    priceMax,
    priceBounds.max,
  ]);

  const activeFilterCount =
    selectedSizes.length +
    selectedOccasions.length +
    selectedFabrics.length +
    selectedColors.length +
    selectedBrands.length +
    selectedGenders.length +
    (mode !== "all" ? 1 : 0) +
    (priceMax < priceBounds.max ? 1 : 0);

  const clearAll = () => {
    setSelectedSizes([]);
    setSelectedOccasions([]);
    setSelectedFabrics([]);
    setSelectedColors([]);
    setSelectedBrands([]);
    setSelectedGenders([]);
    setMode("all");
    setPriceMax(priceBounds.max);
    setSort("relevance");
  };

  return (
    <div className="bg-white pb-20">
      {/* Breadcrumb — adds Women/Men context so users have a path back to the
          gender landing instead of hunting through the top nav. */}
      <nav className="mx-auto max-w-[1500px] px-4 pt-8 text-[11px] uppercase tracking-[0.2em] text-ink-muted sm:px-6 lg:px-10">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span className="mx-2 text-ink-subtle">/</span>
        <Link href="/shop" className="hover:text-ink">
          Shop
        </Link>
        {(() => {
          const ids = [category.id, parent?.id].filter(Boolean) as string[];
          const isMen = ids.some((id) => MENS_CATS.has(id));
          const isWomen = ids.some((id) => WOMENS_CATS.has(id));
          if (isMen && !isWomen) {
            return (
              <>
                <span className="mx-2 text-ink-subtle">/</span>
                <Link href="/men" className="hover:text-ink">
                  Men
                </Link>
              </>
            );
          }
          if (isWomen && !isMen) {
            return (
              <>
                <span className="mx-2 text-ink-subtle">/</span>
                <Link href="/women" className="hover:text-ink">
                  Women
                </Link>
              </>
            );
          }
          return null;
        })()}
        {parent && (
          <>
            <span className="mx-2 text-ink-subtle">/</span>
            <Link href={`/c/${parent.slug}`} className="hover:text-ink">
              {parent.name}
            </Link>
          </>
        )}
        <span className="mx-2 text-ink-subtle">/</span>
        <span className="text-ink">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="pb-6 pt-8 text-center">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-muted">
          Shop · Category
        </p>
        <h1 className="font-serif text-3xl text-ink sm:text-4xl">
          {category.name}
        </h1>
        <p className="mt-2 text-xs text-ink-muted">{sorted.length} items</p>
      </div>

      {/* Top-level sibling pills intentionally removed — they mixed genders
          (Lehengas next to Sherwanis) and duplicated the top nav. The breadcrumb
          above now carries gender context, and sub-category pills below handle
          in-category narrowing. */}

      {/* Sub-category pills — secondary row (SOW C01 — sub-categories) */}
      {subCategories.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-[1500px] flex-wrap justify-center gap-2 pb-4">
            <Link
              href={`/c/${(parent ?? category).slug}`}
              className={`shrink-0 rounded-full border px-4 py-1 text-xs font-medium transition-colors ${!parent && category.id === (parent ?? category).id ? "border-brand-dark bg-brand-tint text-brand-dark" : "border-line-strong text-ink-muted hover:border-ink hover:text-ink"}`}
            >
              All {(parent ?? category).name}
            </Link>
            {subCategories.map((s) => {
              const active = s.id === category.id;
              return (
                <Link
                  key={s.id}
                  href={`/c/${s.slug}`}
                  className={`shrink-0 rounded-full border px-4 py-1 text-xs font-medium transition-colors ${active ? "border-brand-dark bg-brand-tint text-brand-dark" : "border-line-strong text-ink-muted hover:border-ink hover:text-ink"}`}
                >
                  {s.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-10">
        <p className="text-sm text-ink-muted">
          Showing <span className="font-semibold text-ink">{sorted.length}</span>{" "}
          {sorted.length === 1 ? "piece" : "pieces"}
        </p>
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <line x1="4" y1="7" x2="20" y2="7" strokeLinecap="round" />
            <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round" />
            <line x1="4" y1="17" x2="20" y2="17" strokeLinecap="round" />
            <circle cx="9" cy="7" r="2" fill="var(--color-ink)" />
            <circle cx="15" cy="12" r="2" fill="var(--color-ink)" />
            <circle cx="9" cy="17" r="2" fill="var(--color-ink)" />
          </svg>
          Sort + Filter
          {activeFilterCount > 0 && (
            <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-bold text-ink">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {filterOpen && (
        <ShopFilterDrawer
          sort={sort}
          setSort={setSort}
          allSizes={allSizes}
          allOccasions={allOccasions}
          allFabrics={allFabrics}
          allColors={allColors}
          allBrands={allBrands}
          selectedSizes={selectedSizes}
          setSelectedSizes={setSelectedSizes}
          selectedOccasions={selectedOccasions}
          setSelectedOccasions={setSelectedOccasions}
          selectedFabrics={selectedFabrics}
          setSelectedFabrics={setSelectedFabrics}
          selectedColors={selectedColors}
          setSelectedColors={setSelectedColors}
          selectedBrands={selectedBrands}
          setSelectedBrands={setSelectedBrands}
          allGenders={allGenders}
          selectedGenders={selectedGenders}
          setSelectedGenders={setSelectedGenders}
          mode={mode}
          setMode={setMode}
          datesCleared={datesCleared}
          rentalStart={rentalStart}
          rentalEnd={rentalEnd}
          onOpenDateModal={() => {
            setDatesCleared(false);
            setDateModalOpen(true);
          }}
          onClearDates={() => setDatesCleared(true)}
          priceBounds={priceBounds}
          priceMax={priceMax}
          setPriceMax={setPriceMax}
          resultCount={sorted.length}
          onClose={() => setFilterOpen(false)}
          onClearAll={clearAll}
        />
      )}

      {dateModalOpen && (
        <ReserveInAdvanceModal
          duration={rentalDuration}
          setDuration={setRentalDuration}
          startDate={rentalStart}
          setStartDate={setRentalStart}
          endDate={rentalEnd}
          onClose={() => setDateModalOpen(false)}
          onReset={() => {
            const t = new Date();
            t.setHours(0, 0, 0, 0);
            setRentalStart(t);
            setRentalDuration(3);
          }}
        />
      )}

      {/* Grid */}
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
        {sorted.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm text-ink-muted">
              No pieces in {category.name} yet.
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-flex text-xs font-medium uppercase tracking-wider text-brand-dark underline underline-offset-4 hover:text-ink"
            >
              Browse the full shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
            {sorted.map((p) => (
              <ShopCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ShopCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false);
  const canRent = product.mode === "rent" || product.mode === "both";
  const minRent = product.rentalPricing?.[0]?.price;
  const hasDiscount = product.mrp && product.price && product.mrp > product.price;

  return (
    <div className="group flex flex-col gap-3">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-surface">
        <Link href={`/p/${product.slug}`} className="absolute inset-0">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 23vw, (min-width: 640px) 32vw, 48vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </Link>

        {product.tags?.includes("New") && (
          <span className="absolute left-3 top-3 bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
            New
          </span>
        )}

        {canRent && (
          <span className="absolute left-3 bottom-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-ink">
            Also rentable
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setLiked((v) => !v);
          }}
          aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition-colors hover:bg-white"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
            style={{ color: liked ? "var(--color-brand)" : "inherit" }}
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <Link href={`/p/${product.slug}`} className="flex flex-col">
        {product.brand && (
          <p className="text-base font-semibold text-ink">{product.brand}</p>
        )}
        <h3 className="line-clamp-1 text-base text-ink group-hover:text-brand">
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-3 text-sm">
          {product.price != null ? (
            <>
              <span className="font-semibold text-ink">
                {formatINR(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-ink-subtle line-through">
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
      </Link>
    </div>
  );
}

export function ShopFilterDrawer({
  sort,
  setSort,
  allSizes,
  allOccasions,
  allFabrics,
  allColors,
  allBrands,
  selectedSizes,
  setSelectedSizes,
  selectedOccasions,
  setSelectedOccasions,
  selectedFabrics,
  setSelectedFabrics,
  selectedColors,
  setSelectedColors,
  selectedBrands,
  setSelectedBrands,
  allGenders,
  selectedGenders,
  setSelectedGenders,
  mode,
  setMode,
  datesCleared,
  rentalStart,
  rentalEnd,
  onOpenDateModal,
  onClearDates,
  priceBounds,
  priceMax,
  setPriceMax,
  resultCount,
  onClose,
  onClearAll,
}: {
  sort: SortKey;
  setSort: (s: SortKey) => void;
  allSizes: string[];
  allOccasions: string[];
  allFabrics: string[];
  allColors: { name: string; hex: string }[];
  allBrands: string[];
  selectedSizes: string[];
  setSelectedSizes: (s: string[]) => void;
  selectedOccasions: string[];
  setSelectedOccasions: (s: string[]) => void;
  selectedFabrics: string[];
  setSelectedFabrics: (s: string[]) => void;
  selectedColors: string[];
  setSelectedColors: (s: string[]) => void;
  selectedBrands: string[];
  setSelectedBrands: (s: string[]) => void;
  allGenders: string[];
  selectedGenders: string[];
  setSelectedGenders: (s: string[]) => void;
  mode?: ModeFilter;
  setMode?: (m: ModeFilter) => void;
  datesCleared?: boolean;
  rentalStart?: Date;
  rentalEnd?: Date;
  onOpenDateModal?: () => void;
  onClearDates?: () => void;
  priceBounds: { min: number; max: number };
  priceMax: number;
  setPriceMax: (n: number) => void;
  resultCount: number;
  onClose: () => void;
  onClearAll: () => void;
}) {
  const toggle = (list: string[], setter: (s: string[]) => void, v: string) =>
    list.includes(v) ? setter(list.filter((x) => x !== v)) : setter([...list, v]);

  const [open, setOpen] = useState<Record<string, boolean>>({
    occasion: true,
    fabric: false,
    color: false,
    designer: false,
  });

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside className="flex h-full w-full max-w-[460px] flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <h2 className="font-serif text-2xl text-ink">Sort and Filter</h2>
            <p className="mt-1 text-sm text-ink-muted">{resultCount} results</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-bg"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Sort */}
          <section className="mb-8">
            <h3 className="mb-3 text-base font-semibold text-ink">Sort by:</h3>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(sortLabels) as SortKey[]).map((k) => {
                const active = sort === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setSort(k)}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${active ? "border-ink bg-brand-tint text-ink" : "border-ink text-ink hover:bg-ink hover:text-white"}`}
                  >
                    {sortLabels[k]}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Buy or Rent (SOW C01) */}
          {mode !== undefined && setMode && (
            <section className="mb-8 border-t border-line pt-6">
              <h3 className="mb-3 text-base font-semibold text-ink">
                Buy or Rent
              </h3>
              <div className="inline-flex rounded-full border border-ink p-1">
                {(["all", "buy", "rent"] as ModeFilter[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`rounded-full px-5 py-1.5 text-sm font-semibold capitalize transition-colors ${mode === m ? "bg-ink text-white" : "text-ink hover:bg-bg"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Browse specific rental dates — only when user is browsing Rent (SOW C01) */}
          {rentalStart && rentalEnd && onOpenDateModal && onClearDates && mode === "rent" && (
            <BrowseDatesSection
              cleared={datesCleared ?? true}
              start={rentalStart}
              end={rentalEnd}
              onOpen={onOpenDateModal}
              onClear={onClearDates}
            />
          )}

          {/* Price range */}
          {priceBounds.max > priceBounds.min && (
            <section className="mb-8 border-t border-line pt-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-base font-semibold text-ink">Max price</h3>
                <span className="text-sm font-medium text-ink">
                  {formatINR(priceMax)}
                </span>
              </div>
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                step={Math.max(100, Math.round((priceBounds.max - priceBounds.min) / 50))}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-ink"
              />
              <div className="mt-1 flex justify-between text-[11px] text-ink-muted">
                <span>{formatINR(priceBounds.min)}</span>
                <span>{formatINR(priceBounds.max)}</span>
              </div>
            </section>
          )}

          {/* Gender */}
          {allGenders.length > 0 && (
            <section className="mb-8 border-t border-line pt-6">
              <h3 className="mb-3 text-base font-semibold text-ink">Gender</h3>
              <div className="flex flex-wrap gap-2">
                {allGenders.map((g) => {
                  const active = selectedGenders.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggle(selectedGenders, setSelectedGenders, g)}
                      className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${active ? "border-ink bg-ink text-white" : "border-ink text-ink hover:bg-ink hover:text-white"}`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Sizes */}
          {allSizes.length > 0 && (
            <section className="mb-8 border-t border-line pt-6">
              <h3 className="mb-3 text-base font-semibold text-ink">Sizes</h3>
              <div className="flex flex-wrap gap-2">
                {allSizes.map((s) => {
                  const active = selectedSizes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggle(selectedSizes, setSelectedSizes, s)}
                      className={`min-w-12 rounded-full border px-4 py-2 text-sm transition-colors ${active ? "border-ink bg-ink text-white" : "border-ink text-ink hover:bg-ink hover:text-white"}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink">Filters:</h3>
            <button
              type="button"
              onClick={onClearAll}
              className="text-sm text-ink-muted underline underline-offset-4 hover:text-ink"
            >
              Clear
            </button>
          </div>

          {/* Occasion */}
          {allOccasions.length > 0 && (
            <ShopAccordion
              label="Occasion"
              isOpen={open.occasion}
              onToggle={() => setOpen((o) => ({ ...o, occasion: !o.occasion }))}
            >
              <div className="flex flex-wrap gap-2 pt-3">
                {allOccasions.map((o) => {
                  const active = selectedOccasions.includes(o);
                  return (
                    <button
                      key={o}
                      type="button"
                      onClick={() => toggle(selectedOccasions, setSelectedOccasions, o)}
                      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${active ? "border-ink bg-ink text-white" : "border-ink text-ink hover:bg-ink hover:text-white"}`}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
            </ShopAccordion>
          )}

          {/* Fabric */}
          {allFabrics.length > 0 && (
            <ShopAccordion
              label="Fabric"
              isOpen={open.fabric}
              onToggle={() => setOpen((o) => ({ ...o, fabric: !o.fabric }))}
            >
              <div className="flex flex-wrap gap-2 pt-3">
                {allFabrics.map((f) => {
                  const active = selectedFabrics.includes(f);
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggle(selectedFabrics, setSelectedFabrics, f)}
                      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${active ? "border-ink bg-ink text-white" : "border-ink text-ink hover:bg-ink hover:text-white"}`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </ShopAccordion>
          )}

          {/* Color */}
          {allColors.length > 0 && (
            <ShopAccordion
              label="Color"
              isOpen={open.color}
              onToggle={() => setOpen((o) => ({ ...o, color: !o.color }))}
            >
              <div className="flex flex-wrap gap-2 pt-3">
                {allColors.map((c) => {
                  const active = selectedColors.includes(c.name);
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => toggle(selectedColors, setSelectedColors, c.name)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${active ? "border-ink bg-ink text-white" : "border-ink text-ink hover:bg-ink hover:text-white"}`}
                    >
                      <span
                        className="inline-block h-4 w-4 rounded-full border border-line-strong"
                        style={{ backgroundColor: c.hex }}
                        aria-hidden
                      />
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </ShopAccordion>
          )}

          {/* Designer */}
          {allBrands.length > 0 && (
            <ShopAccordion
              label="Designer"
              isOpen={open.designer}
              onToggle={() => setOpen((o) => ({ ...o, designer: !o.designer }))}
            >
              <div className="flex flex-wrap gap-2 pt-3">
                {allBrands.map((b) => {
                  const active = selectedBrands.includes(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => toggle(selectedBrands, setSelectedBrands, b)}
                      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${active ? "border-ink bg-ink text-white" : "border-ink text-ink hover:bg-ink hover:text-white"}`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </ShopAccordion>
          )}
        </div>

        <footer className="flex items-center gap-3 border-t border-line bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClearAll}
            className="flex-1 rounded-full border border-ink py-3 text-sm font-semibold text-ink transition-colors hover:bg-bg"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full bg-brand-dark py-3 text-sm font-semibold text-white transition-colors hover:bg-brand"
          >
            Show Results
          </button>
        </footer>
      </aside>
    </div>
  );
}

function ShopAccordion({
  label,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-line py-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="flex h-6 w-6 items-center justify-center text-ink">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            {isOpen ? (
              <path d="M5 12h14" strokeLinecap="round" />
            ) : (
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            )}
          </svg>
        </span>
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}
