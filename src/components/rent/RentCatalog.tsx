"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Product, Category } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { LoopingTypewriter } from "@/components/ui/LoopingTypewriter";

type SortKey = "newest" | "price-low" | "price-high";

const sortLabels: Record<SortKey, string> = {
  newest: "Newest",
  "price-low": "Rent: Low to High",
  "price-high": "Rent: High to Low",
};

function minRent(p: Product) {
  const r = p.rentalPricing ?? [];
  if (r.length === 0) return Infinity;
  return Math.min(...r.map((x) => x.price));
}

export function RentCatalog({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [activeCat, setActiveCat] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [rentMode, setRentMode] = useState<"get-it-now" | "specific-dates">(
    "specific-dates",
  );
  const [catsExpanded, setCatsExpanded] = useState(false);
  const VISIBLE_CATS = 10; // 10 category pills + "All" = 11 visible, 12th slot is "Show more"

  // Shared rental date state (used by toolbar chip + drawer "Browse specific dates" + modal)
  const [datesCleared, setDatesCleared] = useState(false);
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

  // Primary / Backup sizes (shown in "Find your look faster" modal)
  const [sizesModalOpen, setSizesModalOpen] = useState(false);

  // If we arrived at /rent?occasion=<slug> (e.g. from the ChapterRent cards),
  // pre-select that occasion in the filter drawer so the grid is already narrowed.
  const searchParams = useSearchParams();
  const occasionSlug = searchParams.get("occasion");
  const occasionTitle = useMemo(() => {
    if (!occasionSlug) return null;
    return occasionSlug
      .split("-")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
      .join(" ");
  }, [occasionSlug]);
  const isOccasionView = Boolean(occasionTitle);

  useEffect(() => {
    if (!occasionSlug) return;
    const normalized = occasionSlug.toLowerCase().replace(/-/g, " ").trim();
    const allOcc = new Set<string>();
    products.forEach((p) => p.occasion?.forEach((o) => allOcc.add(o)));
    const match = Array.from(allOcc).find((o) => {
      const low = o.toLowerCase();
      return normalized.includes(low) || low.includes(normalized);
    });
    if (match) setSelectedOccasions([match]);
  }, [occasionSlug, products]);

  // Unique facets across the rentable catalog
  const allSizes = useMemo(() => {
    const s = new Set<string>();
    products.forEach((p) => p.variants.forEach((v) => s.add(v.size)));
    return Array.from(s);
  }, [products]);
  const allOccasions = useMemo(() => {
    const s = new Set<string>();
    products.forEach((p) => p.occasion?.forEach((o) => s.add(o)));
    return Array.from(s).sort();
  }, [products]);
  const allFabrics = useMemo(() => {
    const s = new Set<string>();
    products.forEach((p) =>
      p.fabric?.split(",").forEach((f) => s.add(f.trim())),
    );
    return Array.from(s).sort();
  }, [products]);
  const allColors = useMemo(() => {
    const m = new Map<string, string>();
    products.forEach((p) =>
      p.variants.forEach((v) => {
        if (!m.has(v.color)) m.set(v.color, v.colorHex || "#999999");
      }),
    );
    return Array.from(m.entries()).map(([name, hex]) => ({ name, hex }));
  }, [products]);
  const allBrands = useMemo(() => {
    const s = new Set<string>();
    products.forEach((p) => p.brand && s.add(p.brand));
    return Array.from(s).sort();
  }, [products]);

  const filtered = useMemo(() => {
    let base =
      activeCat === "all"
        ? products
        : products.filter((p) => p.categoryIds.includes(activeCat));

    // Get it now = immediate rentals, treated here as items with a 3-day tier
    if (rentMode === "get-it-now") {
      base = base.filter((p) =>
        p.rentalPricing?.some((r) => r.durationDays === 3),
      );
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

    const sorted = [...base];
    if (sort === "price-low") sorted.sort((a, b) => minRent(a) - minRent(b));
    else if (sort === "price-high") sorted.sort((a, b) => minRent(b) - minRent(a));
    return sorted;
  }, [
    products,
    activeCat,
    sort,
    rentMode,
    selectedSizes,
    selectedOccasions,
    selectedFabrics,
    selectedColors,
    selectedBrands,
  ]);

  const activeFilterCount =
    selectedSizes.length +
    selectedOccasions.length +
    selectedFabrics.length +
    selectedColors.length +
    selectedBrands.length;

  // Show every category pill, regardless of whether it has rentable stock yet.
  const availableCats = categories;

  return (
    <div className="bg-white pb-20">
      {/* Header */}
      <div className="pb-6 pt-10 text-center sm:pt-14">
        {isOccasionView && (
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-muted">
            Rent · Occasion
          </p>
        )}
        <h1 className="font-serif text-2xl text-ink sm:text-3xl">
          {isOccasionView ? occasionTitle : "Rent the Collection"}
        </h1>
        <p className="mt-2 text-xs text-ink-muted">{filtered.length} items</p>
        {isOccasionView && (
          <Link
            href="/rent"
            className="mt-3 inline-flex text-xs font-medium uppercase tracking-wider text-brand-dark underline underline-offset-4 hover:text-ink"
          >
            View all rentals
          </Link>
        )}
      </div>

      {/* Category pill row — hidden on focused occasion views */}
      {!isOccasionView && (
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
      )}

      {/* Toolbar */}
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-10">
        <DateRangeChip
          cleared={datesCleared}
          start={rentalStart}
          end={rentalEnd}
          onOpen={() => {
            setDatesCleared(false);
            setDateModalOpen(true);
          }}
          onClear={() => setDatesCleared(true)}
        />
        <FindYourLookCard
          sizes={selectedSizes}
          onAddSizes={() => setSizesModalOpen(true)}
        />
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
        <FilterDrawer
          allSizes={allSizes}
          allOccasions={allOccasions}
          allFabrics={allFabrics}
          allColors={allColors}
          allBrands={allBrands}
          sort={sort}
          setSort={setSort}
          rentMode={rentMode}
          setRentMode={setRentMode}
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
          datesCleared={datesCleared}
          rentalStart={rentalStart}
          rentalEnd={rentalEnd}
          onOpenDateModal={() => {
            setDatesCleared(false);
            setDateModalOpen(true);
          }}
          onClearDates={() => setDatesCleared(true)}
          resultCount={filtered.length}
          onClose={() => setFilterOpen(false)}
          onClearAll={() => {
            setSelectedSizes([]);
            setSelectedOccasions([]);
            setSelectedFabrics([]);
            setSelectedColors([]);
            setSelectedBrands([]);
            setSort("newest");
            setRentMode("specific-dates");
          }}
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

      {sizesModalOpen && (
        <AddSizesModal
          allSizes={allSizes}
          initialSizes={selectedSizes}
          onSave={(sizes) => {
            setSelectedSizes(sizes);
            setSizesModalOpen(false);
          }}
          onClose={() => setSizesModalOpen(false)}
        />
      )}

      {/* Grid */}
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
        {filtered.length === 0 ? (
          <p className="py-24 text-center text-sm text-ink-muted">
            No rental pieces in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
            {filtered.map((p, idx) => (
              <Fragment key={p.id}>
                <RentCard product={p} />
                {idx === 7 && <RentPromoBanner />}
              </Fragment>
            ))}
          </div>
        )}
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

export function formatDateRange(start: Date, end: Date) {
  const sMonth = start.toLocaleDateString("en-US", { month: "short" });
  const eMonth = end.toLocaleDateString("en-US", { month: "short" });
  if (sMonth === eMonth) return `${sMonth} ${start.getDate()}-${end.getDate()}`;
  return `${sMonth} ${start.getDate()} – ${eMonth} ${end.getDate()}`;
}

function DateRangeChip({
  cleared,
  start,
  end,
  onOpen,
  onClear,
}: {
  cleared: boolean;
  start: Date;
  end: Date;
  onOpen: () => void;
  onClear: () => void;
}) {
  if (cleared) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="text-sm font-medium text-brand-dark underline-offset-4 hover:underline"
      >
        Choose dates
      </button>
    );
  }
  const range = formatDateRange(start, end);
  return (
    <div className="flex items-center gap-3 text-sm text-ink">
      <span className="text-ink-muted">Browsing:</span>
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-1.5 font-medium text-brand-dark underline underline-offset-4 hover:border-ink"
      >
        {range}
        <span
          role="button"
          aria-label="Clear dates"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="-mr-1 flex h-4 w-4 items-center justify-center text-brand-dark hover:text-ink"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </span>
      </button>
    </div>
  );
}

function RentPromoBanner() {
  return (
    <div className="col-span-2 my-4 grid grid-cols-1 overflow-hidden sm:col-span-3 lg:col-span-4 lg:grid-cols-2">
      {/* Left — image */}
      <div className="relative aspect-[4/3] lg:aspect-auto">
        <Image
          src="/images/rental/reception.png"
          alt="Rent with Deeps & Bergs"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      {/* Right — black text panel */}
      <div className="flex flex-col items-center justify-center gap-6 bg-ink px-8 py-20 text-center text-white lg:px-14 lg:py-32">
        <h3 className="min-h-[1.2em] font-serif text-3xl sm:text-4xl lg:text-5xl">
          <LoopingTypewriter text="Wear it. Return it." />
        </h3>
        <p className="max-w-sm text-sm text-white/80">
          Dry-cleaned, delivered, and picked up. Your deposit is refunded in 3 working days — we handle every step of the rental.
        </p>
        <Link
          href="/how-rentals-work"
          className="mt-2 inline-flex items-center border border-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white hover:text-ink"
        >
          How Rentals Work
        </Link>
      </div>
    </div>
  );
}

function FindYourLookCard({
  sizes,
  onAddSizes,
}: {
  sizes: string[];
  onAddSizes: () => void;
}) {
  const hasSizes = sizes.length > 0;
  return (
    <div className="flex items-center gap-5 border border-line-strong bg-bg px-5 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center text-ink">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="M12 7a2 2 0 1 1 2-2" strokeLinecap="round" />
          <path d="M12 7v1.8L2.6 15.1a1 1 0 0 0 .55 1.83h17.7a1 1 0 0 0 .55-1.83L12 8.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <p className="text-sm text-ink">
        {hasSizes ? (
          <>
            <span className="font-semibold">Your sizes:</span>{" "}
            <span className="text-ink-muted">{sizes.join(", ")}</span>
          </>
        ) : (
          <>
            <span className="font-semibold">Find your look faster.</span>{" "}
            <span className="text-ink-muted">
              Add your sizes to browse available items.
            </span>
          </>
        )}
      </p>
      <button
        type="button"
        onClick={onAddSizes}
        className="shrink-0 bg-ink px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-dark"
      >
        {hasSizes ? "Edit Sizes" : "Add Sizes"}
      </button>
    </div>
  );
}

function AddSizesModal({
  allSizes,
  initialSizes,
  onSave,
  onClose,
}: {
  allSizes: string[];
  initialSizes: string[];
  onSave: (sizes: string[]) => void;
  onClose: () => void;
}) {
  const [primary, setPrimary] = useState<string | null>(initialSizes[0] ?? null);
  const [backup, setBackup] = useState<string | null>(initialSizes[1] ?? null);

  const choosePrimary = (s: string) => {
    if (primary === s) {
      setPrimary(null);
      setBackup(null);
    } else {
      setPrimary(s);
      if (backup === s) setBackup(null);
    }
  };
  const chooseBackup = (s: string) => {
    if (backup === s) setBackup(null);
    else if (s !== primary) setBackup(s);
  };

  const canSave = Boolean(primary);
  const handleSave = () => {
    const out: string[] = [];
    if (primary) out.push(primary);
    if (backup) out.push(backup);
    onSave(out);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative flex max-h-[92vh] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <header className="relative px-8 pt-8 text-center">
          <h2 className="font-serif text-3xl text-ink">
            Personalize your experience
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            Add your sizes so we can show you items available right now.
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-ink hover:bg-bg"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <section className="mb-6">
            <h3 className="mb-3 text-base font-semibold text-ink">Primary size</h3>
            <div className="flex flex-wrap gap-3">
              {allSizes.map((s) => {
                const active = primary === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => choosePrimary(s)}
                    className={`flex h-11 min-w-11 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors ${active ? "border-ink bg-ink text-white" : "border-ink text-ink hover:bg-ink hover:text-white"}`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-base font-semibold text-ink">Backup size</h3>
            <div className="flex flex-wrap gap-3">
              {allSizes.map((s) => {
                const disabled = !primary || s === primary;
                const active = backup === s;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={disabled}
                    onClick={() => chooseBackup(s)}
                    className={`flex h-11 min-w-11 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors ${
                      disabled
                        ? "border-line-strong text-ink-subtle cursor-not-allowed"
                        : active
                          ? "border-ink bg-ink text-white"
                          : "border-ink text-ink hover:bg-ink hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {!primary && (
              <p className="mt-3 text-xs text-ink-muted">
                Pick a primary size first to enable a backup.
              </p>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="border-t border-line bg-white px-8 py-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={`w-full rounded-full py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${canSave ? "bg-ink text-white hover:bg-brand-dark" : "bg-line-strong text-white cursor-not-allowed"}`}
          >
            Choose Your Sizes
          </button>
        </footer>
      </div>
    </div>
  );
}

function FilterDrawer({
  allSizes,
  allOccasions,
  allFabrics,
  allColors,
  allBrands,
  sort,
  setSort,
  rentMode,
  setRentMode,
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
  datesCleared,
  rentalStart,
  rentalEnd,
  onOpenDateModal,
  onClearDates,
  resultCount,
  onClose,
  onClearAll,
}: {
  allSizes: string[];
  allOccasions: string[];
  allFabrics: string[];
  allColors: { name: string; hex: string }[];
  allBrands: string[];
  sort: SortKey;
  setSort: (s: SortKey) => void;
  rentMode: "get-it-now" | "specific-dates";
  setRentMode: (m: "get-it-now" | "specific-dates") => void;
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
  datesCleared: boolean;
  rentalStart: Date;
  rentalEnd: Date;
  onOpenDateModal: () => void;
  onClearDates: () => void;
  resultCount: number;
  onClose: () => void;
  onClearAll: () => void;
}) {
  const toggle = (list: string[], setter: (s: string[]) => void, v: string) =>
    list.includes(v) ? setter(list.filter((x) => x !== v)) : setter([...list, v]);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
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
      <aside className="flex h-full w-full max-w-[460px] animate-fade-in flex-col bg-white shadow-2xl">
        {/* Header */}
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

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* When to rent */}
          <section className="mb-8">
            <h3 className="mb-3 text-base font-semibold text-ink">
              When do you want to rent?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRentMode("get-it-now")}
                className={`rounded-xl px-4 py-4 text-left transition-colors ${rentMode === "get-it-now" ? "border-2 border-ink bg-brand-tint" : "border border-line-strong hover:border-ink"}`}
              >
                <p className="text-sm font-semibold text-ink">Get it now</p>
                <p className="mt-0.5 text-xs text-ink-muted">With membership</p>
              </button>
              <button
                type="button"
                onClick={() => setRentMode("specific-dates")}
                className={`rounded-xl px-4 py-4 text-left transition-colors ${rentMode === "specific-dates" ? "border-2 border-ink bg-brand-tint" : "border border-line-strong hover:border-ink"}`}
              >
                <p className="text-sm font-semibold text-ink">Specific dates</p>
                <p className="mt-0.5 text-xs text-ink-muted">One-off rental</p>
              </button>
            </div>
          </section>

          {/* Browse specific dates */}
          <BrowseDatesSection
            cleared={datesCleared}
            start={rentalStart}
            end={rentalEnd}
            onOpen={onOpenDateModal}
            onClear={onClearDates}
          />

          {/* Shipping pincode */}
          <ShippingPincodeSection />

          {/* Sizes */}
          <section className="mb-8">
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

          {/* Sort by */}
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

          {/* Filters header */}
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

          {/* Occasion accordion */}
          <Accordion
            label="Occasion"
            open={openSections.occasion}
            onToggle={() =>
              setOpenSections((s) => ({ ...s, occasion: !s.occasion }))
            }
          >
            <div className="flex flex-wrap gap-2 pt-3">
              {allOccasions.map((o) => {
                const active = selectedOccasions.includes(o);
                return (
                  <button
                    key={o}
                    type="button"
                    onClick={() =>
                      toggle(selectedOccasions, setSelectedOccasions, o)
                    }
                    className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${active ? "border-ink bg-ink text-white" : "border-ink text-ink hover:bg-ink hover:text-white"}`}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          </Accordion>

          {/* Fabric */}
          <Accordion
            label="Fabric"
            open={!!openSections.fabric}
            onToggle={() =>
              setOpenSections((s) => ({ ...s, fabric: !s.fabric }))
            }
          >
            <div className="flex flex-wrap gap-2 pt-3">
              {allFabrics.map((f) => {
                const active = selectedFabrics.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() =>
                      toggle(selectedFabrics, setSelectedFabrics, f)
                    }
                    className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${active ? "border-ink bg-ink text-white" : "border-ink text-ink hover:bg-ink hover:text-white"}`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </Accordion>

          {/* Color */}
          <Accordion
            label="Color"
            open={!!openSections.color}
            onToggle={() =>
              setOpenSections((s) => ({ ...s, color: !s.color }))
            }
          >
            <div className="flex flex-wrap gap-2 pt-3">
              {allColors.map((c) => {
                const active = selectedColors.includes(c.name);
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() =>
                      toggle(selectedColors, setSelectedColors, c.name)
                    }
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
          </Accordion>

          {/* Designer / Brand */}
          <Accordion
            label="Designer"
            open={!!openSections.designer}
            onToggle={() =>
              setOpenSections((s) => ({ ...s, designer: !s.designer }))
            }
          >
            {allBrands.length === 0 ? (
              <p className="pt-3 text-sm text-ink-muted">
                No designers in this catalog yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-3">
                {allBrands.map((b) => {
                  const active = selectedBrands.includes(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() =>
                        toggle(selectedBrands, setSelectedBrands, b)
                      }
                      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${active ? "border-ink bg-ink text-white" : "border-ink text-ink hover:bg-ink hover:text-white"}`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            )}
          </Accordion>
        </div>

        {/* Footer */}
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

export function BrowseDatesSection({
  cleared,
  start,
  end,
  onOpen,
  onClear,
}: {
  cleared: boolean;
  start: Date;
  end: Date;
  onOpen: () => void;
  onClear: () => void;
}) {
  const range = formatDateRange(start, end);

  return (
    <section className="mb-8 border-t border-line pt-6">
      <h3 className="text-base font-semibold text-ink">Browse specific dates</h3>
      <p className="mt-1 text-sm text-ink-muted">
        {cleared
          ? "Pick dates to see what's available for your window."
          : `Items available to reserve ${range}`}
      </p>
      {!cleared ? (
        <button
          type="button"
          onClick={onOpen}
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-1.5 text-sm font-medium text-brand-dark underline underline-offset-4 hover:border-ink"
        >
          {range}
          <span
            role="button"
            aria-label="Clear dates"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="-mr-1 flex h-4 w-4 items-center justify-center text-brand-dark hover:text-ink"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="mt-3 inline-flex rounded-full border border-ink px-4 py-1.5 text-sm font-medium text-ink hover:bg-ink hover:text-white"
        >
          Choose dates
        </button>
      )}
    </section>
  );
}

export function ReserveInAdvanceModal({
  duration,
  setDuration,
  startDate,
  setStartDate,
  endDate,
  onClose,
  onReset,
}: {
  duration: 3 | 5 | 7;
  setDuration: (d: 3 | 5 | 7) => void;
  startDate: Date;
  setStartDate: (d: Date) => void;
  endDate: Date;
  onClose: () => void;
  onReset: () => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const d = new Date(startDate);
    d.setDate(1);
    return d;
  });

  const monthLabel = viewMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const goMonth = (delta: number) => {
    const d = new Date(viewMonth);
    d.setMonth(d.getMonth() + delta);
    setViewMonth(d);
  };

  const canGoPrev = (() => {
    const d = new Date(viewMonth);
    d.setMonth(d.getMonth() - 1);
    // Don't allow navigating before current month
    return (
      d.getFullYear() > today.getFullYear() ||
      (d.getFullYear() === today.getFullYear() && d.getMonth() >= today.getMonth())
    );
  })();

  // Build 6-week grid starting on Monday
  const cells = useMemo(() => {
    const y = viewMonth.getFullYear();
    const m = viewMonth.getMonth();
    const first = new Date(y, m, 1);
    const firstWeekday = (first.getDay() + 6) % 7; // 0=Mon ... 6=Sun
    const out: { date: Date; inMonth: boolean }[] = [];
    const prevMonthLast = new Date(y, m, 0).getDate();
    for (let i = firstWeekday - 1; i >= 0; i--) {
      out.push({ date: new Date(y, m - 1, prevMonthLast - i), inMonth: false });
    }
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      out.push({ date: new Date(y, m, d), inMonth: true });
    }
    while (out.length < 42) {
      const last = out[out.length - 1].date;
      const next = new Date(last);
      next.setDate(next.getDate() + 1);
      out.push({ date: next, inMonth: next.getMonth() === m });
    }
    return out;
  }, [viewMonth]);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const inRange = (d: Date) => d >= startDate && d <= endDate;

  const clickDate = (d: Date) => {
    if (d < today) return;
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    setStartDate(copy);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative flex max-h-[92vh] w-full max-w-[540px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <header className="relative px-8 pt-8 text-center">
          <h2 className="font-serif text-3xl text-ink">Reserve In Advance</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            Reserve items for specific dates up to four months in advance.
            Includes one free backup size.
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-ink hover:bg-bg"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {/* Rental Period + Dates */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="text-base font-semibold text-ink">Rental Period</h3>
            <div className="inline-flex rounded-full border border-line-strong p-1">
              {([3, 5, 7] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${duration === d ? "bg-brand-dark text-white" : "text-ink hover:bg-bg"}`}
                >
                  {d} Days
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 grid grid-cols-[1fr_1fr_auto] gap-3">
            <div className="rounded-xl border border-line-strong px-4 py-3">
              <p className="text-[11px] uppercase tracking-wider text-ink-muted">
                Arrives By
              </p>
              <p className="mt-1 text-sm font-semibold text-ink">
                {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>
            <div className="rounded-xl border border-line-strong px-4 py-3">
              <p className="text-[11px] uppercase tracking-wider text-ink-muted">
                Return By
              </p>
              <p className="mt-1 text-sm font-semibold text-ink">
                {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>
            <div className="flex flex-col justify-center rounded-xl border border-line-strong px-4 py-3 text-right">
              <p className="text-[11px] uppercase tracking-wider text-ink-muted">
                Ship to
              </p>
              <p className="mt-1 text-sm font-semibold text-ink">500001</p>
            </div>
          </div>

          <p className="mb-5 text-xs text-ink-muted">
            <span className="font-semibold text-ink">Pro Tip:</span> Select an
            arrival date two days before your event.
          </p>

          {/* Calendar */}
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => goMonth(-1)}
              disabled={!canGoPrev}
              aria-label="Previous month"
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h4 className="font-serif text-xl text-ink">{monthLabel}</h4>
            <button
              type="button"
              onClick={() => goMonth(1)}
              aria-label="Next month"
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink transition-colors hover:bg-bg"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] font-medium text-ink-muted">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
            {cells.map(({ date, inMonth }, i) => {
              const isPast = date < today;
              const isStart = sameDay(date, startDate);
              const isEnd = sameDay(date, endDate);
              const isEndpoint = isStart || isEnd;
              const isInside = inRange(date) && !isEndpoint;

              let cellClass =
                "relative mx-auto flex h-10 w-10 items-center justify-center text-sm";
              let btnClass =
                "flex h-9 w-9 items-center justify-center rounded-full transition-colors";

              if (isPast || !inMonth) {
                btnClass += " text-ink-subtle cursor-not-allowed";
              } else if (isEndpoint) {
                btnClass += " bg-brand-dark text-white font-semibold";
              } else if (isInside) {
                btnClass += " bg-brand-tint text-ink";
              } else {
                btnClass += " text-ink hover:bg-bg";
              }

              return (
                <div key={i} className={cellClass}>
                  <button
                    type="button"
                    onClick={() => clickDate(date)}
                    disabled={isPast || !inMonth}
                    className={btnClass}
                  >
                    {date.getDate()}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center gap-3 border-t border-line px-8 py-4">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 rounded-full border border-ink py-3 text-sm font-semibold text-ink transition-colors hover:bg-bg"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full bg-brand-dark py-3 text-sm font-semibold text-white transition-colors hover:bg-brand"
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}

function ShippingPincodeSection() {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [pincode, setPincode] = useState("");
  const hasPincode = pincode.length === 6;

  return (
    <section className="mb-8 border-t border-line pt-6">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between"
      >
        <h3 className="text-base font-semibold text-ink">Shipping pincode</h3>
        <span className="flex items-center gap-3">
          <span className="text-sm text-ink-muted">
            {hasPincode ? pincode : "Enter complete pincode"}
          </span>
          <span className="flex h-6 w-6 items-center justify-center text-ink">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              {expanded ? (
                <path d="M5 12h14" strokeLinecap="round" />
              ) : (
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              )}
            </svg>
          </span>
        </span>
      </button>

      {expanded && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm text-ink-muted">Where are we shipping to?</p>
          {editing ? (
            <input
              type="text"
              value={pincode}
              onChange={(e) =>
                setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
              autoFocus
              maxLength={6}
              inputMode="numeric"
              placeholder="500001"
              className="w-[140px] rounded-full border border-ink bg-white px-5 py-2 text-center text-sm font-medium tracking-wider text-ink outline-none placeholder:text-ink-subtle focus:border-brand-dark"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M3 11l18-8-8 18-2-8-8-2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {hasPincode ? pincode : "Pincode"}
            </button>
          )}
        </div>
      )}
    </section>
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
    <div className="border-b border-line py-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="flex h-6 w-6 items-center justify-center text-ink">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            {open ? (
              <path d="M5 12h14" strokeLinecap="round" />
            ) : (
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            )}
          </svg>
        </span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

function RentCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false);
  const rent = minRent(product);

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
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="font-semibold text-ink">To Rent</span>
          <span className="font-semibold text-ink">
            {rent === Infinity ? "—" : formatINR(rent)}
          </span>
        </div>
        {product.mrp && (
          <div className="mt-1 flex items-center justify-between text-sm text-ink-muted">
            <span>Original Retail</span>
            <span>{formatINR(product.mrp)}</span>
          </div>
        )}
      </Link>
    </div>
  );
}
