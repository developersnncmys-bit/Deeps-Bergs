"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product, Category } from "@/lib/types";
import {
  ShopCard,
  ShopFilterDrawer,
  type ModeFilter,
  type SortKey,
} from "@/components/shop/ShopCategory";
import { ReserveInAdvanceModal } from "@/components/rent/RentCatalog";
import { LoopingTypewriter } from "@/components/ui/LoopingTypewriter";

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

export function ShopAllCatalog({
  items,
  categories,
}: {
  items: Product[];
  categories: Category[];
}) {
  const [activeCat, setActiveCat] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [mode, setMode] = useState<ModeFilter>("all");
  const [catsExpanded, setCatsExpanded] = useState(false);
  const VISIBLE_CATS = 12;

  // Rental date window — shared with the drawer and the Reserve-In-Advance modal.
  const [datesCleared, setDatesCleared] = useState(true);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [rentalDuration, setRentalDuration] = useState<3 | 5 | 7>(3);
  // Init to epoch, hydrate on mount — Cache Components disallows `new Date()`
  // in a Client Component's initial state.
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

  const priceBounds = useMemo(() => {
    const prices = items.map((p) => p.price).filter((n): n is number => n != null);
    if (prices.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [items]);
  const [priceMax, setPriceMax] = useState<number>(priceBounds.max);

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
  const allGenders = useMemo(() => {
    // Only Men and Women — unisex items are excluded from the chip options.
    return ["Men", "Women"];
  }, []);

  // Only pills that actually have items in them
  const availableCats = useMemo(() => {
    const ids = new Set<string>();
    items.forEach((p) => p.categoryIds.forEach((id) => ids.add(id)));
    return categories.filter((c) => ids.has(c.id));
  }, [items, categories]);

  const filtered = useMemo(() => {
    let base =
      activeCat === "all"
        ? items
        : items.filter((p) => p.categoryIds.includes(activeCat));

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
    const price = (p: Product) => p.price ?? Infinity;
    if (sort === "price-low") out.sort((a, b) => price(a) - price(b));
    else if (sort === "price-high") out.sort((a, b) => price(b) - price(a));
    return out;
  }, [
    items,
    activeCat,
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
      {/* Header */}
      <div className="pb-6 pt-10 text-center sm:pt-14">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-dark">
          The Edit
        </p>
        <h1 className="font-serif text-2xl text-ink sm:text-3xl">
          Shop All
        </h1>
        <p className="mt-2 text-xs text-ink-muted">
          {filtered.length} {filtered.length === 1 ? "piece" : "pieces"} across
          every category
        </p>
      </div>

      {/* Category pills */}
      <div className="px-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1500px] flex-wrap justify-center gap-2 py-4">
          <CatPill
            label="All"
            active={activeCat === "all"}
            onClick={() => setActiveCat("all")}
          />
          {(catsExpanded ? availableCats : availableCats.slice(0, VISIBLE_CATS)).map((c) => (
            <CatPill
              key={c.id}
              label={c.name}
              active={activeCat === c.id}
              onClick={() => setActiveCat(c.id)}
            />
          ))}
          {availableCats.length > VISIBLE_CATS && (
            <button
              type="button"
              onClick={() => setCatsExpanded((v) => !v)}
              className="shrink-0 rounded-full border border-dashed border-ink px-5 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-white"
            >
              {catsExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-10">
        <p className="text-sm text-ink-muted">
          Showing <span className="font-semibold text-ink">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "piece" : "pieces"}
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
          resultCount={filtered.length}
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
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm text-ink-muted">
              Nothing matches these filters.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-4 inline-flex text-xs font-medium uppercase tracking-wider text-brand-dark underline underline-offset-4 hover:text-ink"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
            {filtered.map((p, idx) => (
              <Fragment key={p.id}>
                <ShopCard product={p} />
                {idx === 7 && <ShopAllBanner />}
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ShopAllBanner() {
  return (
    <div className="col-span-2 my-4 flex flex-col overflow-hidden sm:col-span-3 lg:col-span-4 lg:flex-row">
      {/* Left — image */}
      <div className="relative aspect-[4/3] w-full lg:aspect-auto lg:w-1/2">
        <Image
          src="/images/rental/reception.png"
          alt="Shop every category at Deeps & Bergs"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      {/* Right — black text panel */}
      <div className="flex w-full flex-col items-center justify-center gap-6 bg-ink px-8 py-20 text-center text-white lg:w-1/2 lg:px-14 lg:py-32">
        <h3 className="min-h-[1.2em] font-serif text-3xl sm:text-4xl lg:text-5xl">
          <LoopingTypewriter text="The whole house. One place." />
        </h3>
        <p className="max-w-sm text-sm text-white/80">
          From wedding couture to activewear — every piece from every category,
          filtered the way you want.
        </p>
        <Link
          href="/membership"
          className="mt-2 inline-flex items-center border border-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white hover:text-ink"
        >
          Join the Circle
        </Link>
      </div>
    </div>
  );
}

function CatPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-ink bg-ink text-white"
          : "border-ink text-ink hover:bg-ink hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
