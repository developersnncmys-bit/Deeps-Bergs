"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TbSparkles, TbX } from "react-icons/tb";
import {
  ShopCard,
  ShopFilterDrawer,
  type SortKey,
} from "@/components/shop/ShopCategory";
import { products } from "@/lib/mock-data";
import type { Product } from "@/lib/types";
import { parseQuery, rankProducts, type ParsedFacet } from "@/lib/search/parseQuery";

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchInner />
    </Suspense>
  );
}

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") ?? "";
  const mode = (params.get("mode") ?? "text") as "text" | "voice" | "visual";

  const parsed = useMemo(() => parseQuery(q), [q]);
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  // Visual-search reference image is stashed by VisualSearchSheet in sessionStorage.
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  useEffect(() => {
    if (mode !== "visual") return;
    try {
      const url = sessionStorage.getItem("dbf.visualSearch.image");
      if (url) setReferenceImage(url);
    } catch {
      /* ignore */
    }
  }, [mode]);

  const activeFacets = parsed.facets.filter(
    (f) => !removed.has(`${f.type}:${f.value}`),
  );
  const budgetActive =
    parsed.budget != null && !removed.has(`budget:${parsed.budget}`);

  // AI-ranked results — the input to the regular sort+filter drawer below.
  const matches = useMemo(() => {
    if (mode === "visual") return products.slice(0, 12);
    if (!q.trim()) return [];
    const ranked = rankProducts(
      products,
      activeFacets,
      budgetActive ? parsed.budget : null,
    );
    return ranked.length ? ranked : products.slice(0, 24);
  }, [mode, q, activeFacets, parsed.budget, budgetActive]);

  // Standard sort + filter state, same shape as ShopCategory.
  const [sort, setSort] = useState<SortKey>("relevance");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);

  const priceBounds = useMemo(() => {
    const prices = matches.map((p) => p.price).filter((n): n is number => n != null);
    if (prices.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [matches]);
  const [priceMax, setPriceMax] = useState<number>(priceBounds.max);
  // Reset the price cap whenever the match pool changes so the slider lines up.
  useEffect(() => {
    setPriceMax(priceBounds.max);
  }, [priceBounds.max]);

  // Facet lists derived from the AI matches.
  const allSizes = useMemo(() => {
    const s = new Set<string>();
    matches.forEach((p) => p.variants.forEach((v) => s.add(v.size)));
    return Array.from(s);
  }, [matches]);
  const allOccasions = useMemo(() => {
    const s = new Set<string>();
    matches.forEach((p) => p.occasion?.forEach((o) => s.add(o)));
    return Array.from(s).sort();
  }, [matches]);
  const allFabrics = useMemo(() => {
    const s = new Set<string>();
    matches.forEach((p) => p.fabric?.split(",").forEach((f) => s.add(f.trim())));
    return Array.from(s).sort();
  }, [matches]);
  const allColors = useMemo(() => {
    const m = new Map<string, string>();
    matches.forEach((p) =>
      p.variants.forEach((v) => {
        if (!m.has(v.color)) m.set(v.color, v.colorHex || "#999999");
      }),
    );
    return Array.from(m.entries()).map(([name, hex]) => ({ name, hex }));
  }, [matches]);
  const allBrands = useMemo(() => {
    const s = new Set<string>();
    matches.forEach((p) => p.brand && s.add(p.brand));
    return Array.from(s).sort();
  }, [matches]);
  const allGenders = useMemo<string[]>(() => [], []);

  const sorted = useMemo(() => {
    let base = matches;

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
    if (priceMax < priceBounds.max) {
      base = base.filter((p) => (p.price ?? Infinity) <= priceMax);
    }

    const out = [...base];
    const price = (p: Product) => p.price ?? Infinity;
    if (sort === "price-low") out.sort((a, b) => price(a) - price(b));
    else if (sort === "price-high") out.sort((a, b) => price(b) - price(a));
    else if (sort === "newest")
      out.sort(
        (a, b) =>
          (b.tags?.includes("New") ? 1 : 0) - (a.tags?.includes("New") ? 1 : 0),
      );
    return out;
  }, [
    matches,
    sort,
    selectedSizes,
    selectedOccasions,
    selectedFabrics,
    selectedColors,
    selectedBrands,
    priceMax,
    priceBounds.max,
  ]);

  const activeFilterCount =
    selectedSizes.length +
    selectedOccasions.length +
    selectedFabrics.length +
    selectedColors.length +
    selectedBrands.length +
    (priceMax < priceBounds.max ? 1 : 0);

  const clearAll = () => {
    setSelectedSizes([]);
    setSelectedOccasions([]);
    setSelectedFabrics([]);
    setSelectedColors([]);
    setSelectedBrands([]);
    setPriceMax(priceBounds.max);
    setSort("relevance");
  };

  const eyebrow =
    mode === "voice"
      ? "Voice search"
      : mode === "visual"
        ? "Visual search"
        : "Smart search";

  const title =
    q.trim() ||
    (mode === "visual" ? "Similar to your photo" : "Search the store");

  const removeFacet = (f: ParsedFacet) => {
    setRemoved((prev) => {
      const next = new Set(prev);
      next.add(`${f.type}:${f.value}`);
      return next;
    });
  };

  const clearBudget = () =>
    parsed.budget != null &&
    setRemoved((prev) => {
      const next = new Set(prev);
      next.add(`budget:${parsed.budget}`);
      return next;
    });

  return (
    <div className="bg-white pb-20">
      {/* Breadcrumb */}
      <nav className="mx-auto max-w-[1500px] px-4 pt-8 text-[11px] uppercase tracking-[0.2em] text-ink-muted sm:px-6 lg:px-10">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span className="mx-2 text-ink-subtle">/</span>
        <span className="text-ink">Search</span>
      </nav>

      {/* Header — matches category page */}
      <div className="pb-6 pt-8 text-center">
        <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-muted">
          <TbSparkles size={13} className="text-brand-dark" />
          {eyebrow}
        </p>
        <h1 className="font-serif text-3xl text-ink sm:text-4xl">
          {q.trim() ? `“${title}”` : title}
        </h1>
        <p className="mt-2 text-xs text-ink-muted">{sorted.length} items</p>
      </div>

      {/* Visual reference card */}
      {mode === "visual" && referenceImage && (
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
          <div className="mx-auto mt-2 flex max-w-xl items-center gap-4 rounded-2xl border border-line bg-surface p-3">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={referenceImage}
                alt="Visual search reference"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-col">
              <p className="text-sm font-semibold text-ink">Your reference</p>
              <p className="text-xs text-ink-muted">
                Showing nearest matches from the catalogue.
              </p>
              <button
                type="button"
                onClick={() => {
                  try {
                    sessionStorage.removeItem("dbf.visualSearch.image");
                  } catch {
                    /* ignore */
                  }
                  router.push("/search");
                }}
                className="mt-2 self-start text-[11px] font-semibold uppercase tracking-[0.2em] text-brand underline-offset-[4px] hover:underline"
              >
                Remove reference
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI-parsed facet chips */}
      {(activeFacets.length > 0 || budgetActive) && (
        <div className="px-4 sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-center gap-2 py-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
              Picked up
            </span>
            {activeFacets.map((f) => (
              <SearchChip key={`${f.type}:${f.value}`} onClear={() => removeFacet(f)}>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
                  {f.type}
                </span>
                <span className="ml-1 text-ink">{f.label}</span>
              </SearchChip>
            ))}
            {budgetActive && parsed.budget != null && (
              <SearchChip onClear={clearBudget}>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
                  Budget
                </span>
                <span className="ml-1 text-ink">
                  Under ₹{parsed.budget.toLocaleString("en-IN")}
                </span>
              </SearchChip>
            )}
          </div>
        </div>
      )}

      {/* Toolbar — same Sort + Filter button as category page */}
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
          priceBounds={priceBounds}
          priceMax={priceMax}
          setPriceMax={setPriceMax}
          resultCount={sorted.length}
          onClose={() => setFilterOpen(false)}
          onClearAll={clearAll}
        />
      )}

      {/* Grid — identical to category page */}
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
        {sorted.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm text-ink-muted">
              No pieces matched your search yet.
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

function SearchChip({
  children,
  onClear,
}: {
  children: React.ReactNode;
  onClear: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-ink bg-white px-4 py-1.5 text-sm">
      {children}
      <button
        type="button"
        onClick={onClear}
        aria-label="Remove filter"
        className="flex h-4 w-4 items-center justify-center text-ink-muted transition-colors hover:text-ink"
      >
        <TbX size={12} strokeWidth={2.4} />
      </button>
    </span>
  );
}

function SearchSkeleton() {
  return (
    <div className="bg-white pb-20 pt-8">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
        <div className="h-4 w-40 animate-pulse rounded bg-line" />
        <div className="mx-auto mt-6 h-8 w-80 animate-pulse rounded bg-line" />
      </div>
    </div>
  );
}
