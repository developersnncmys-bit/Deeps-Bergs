"use client";

import { useState } from "react";
import Image from "next/image";
import { TbX } from "react-icons/tb";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/utils";

type Tab = "size" | "measure";
type Unit = "in" | "cm";

// Standard Deeps & Bergs women's size chart (inches).
// Admin-editable later; kept inline for now.
const SIZE_ROWS = [
  { size: "XS", us: "US 2", bust: 34, waist: 28, hip: 38.5, armhole: 15.5, uk: 6 },
  { size: "S", us: "US 6", bust: 36, waist: 30, hip: 40, armhole: 16.5, uk: 10 },
  { size: "M", us: "US 10", bust: 38, waist: 32, hip: 44, armhole: 18, uk: 14 },
  { size: "L", us: "US 12", bust: 39.5, waist: 33.5, hip: 45, armhole: 18.5, uk: 16 },
  { size: "XL", us: "US 16", bust: 42, waist: 36, hip: 48, armhole: 20, uk: 20 },
  { size: "2XL", us: "US 18", bust: 44, waist: 39, hip: 50, armhole: 21, uk: 24 },
];

const toCm = (inches: number) => Math.round(inches * 2.54 * 10) / 10;

export function SizeGuideModal({
  product,
  onClose,
  onSelectSize,
  selectedSize,
}: {
  product: Product;
  onClose: () => void;
  // Optional — when provided, each in-stock size pill becomes selectable and
  // choosing one applies it to the product page before closing the modal.
  onSelectSize?: (size: string) => void;
  selectedSize?: string | null;
}) {
  const [tab, setTab] = useState<Tab>("size");
  const [unit, setUnit] = useState<Unit>("in");
  const availableSizes = new Set(
    product.variants.filter((v) => v.inStock).map((v) => v.size),
  );
  const price =
    product.price ?? product.rentalPricing?.[0]?.price ?? 0;

  const pickSize = (size: string) => {
    onSelectSize?.(size);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative flex h-[82vh] max-h-[720px] w-full max-w-[720px] flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl">
        {/* Header with tabs + close */}
        <header className="relative flex border-b border-line">
          <button
            type="button"
            onClick={() => setTab("size")}
            className={`flex-1 py-5 text-sm font-semibold uppercase tracking-[0.18em] transition-colors ${tab === "size" ? "border-b-2 border-ink text-ink" : "text-ink-muted hover:text-ink"}`}
          >
            Size Guide
          </button>
          <button
            type="button"
            onClick={() => setTab("measure")}
            className={`flex-1 py-5 text-sm font-semibold uppercase tracking-[0.18em] transition-colors ${tab === "measure" ? "border-b-2 border-ink text-ink" : "text-ink-muted hover:text-ink"}`}
          >
            How to Measure
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink hover:bg-bg"
          >
            <TbX size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {tab === "size" ? (
            <SizeTab
              product={product}
              price={price}
              availableSizes={availableSizes}
              unit={unit}
              setUnit={setUnit}
              onPickSize={onSelectSize ? pickSize : undefined}
              selectedSize={selectedSize ?? null}
            />
          ) : (
            <MeasureTab />
          )}
        </div>
      </div>
    </div>
  );
}

function SizeTab({
  product,
  price,
  availableSizes,
  unit,
  setUnit,
  onPickSize,
  selectedSize,
}: {
  product: Product;
  price: number;
  availableSizes: Set<string>;
  unit: Unit;
  setUnit: (u: Unit) => void;
  onPickSize?: (size: string) => void;
  selectedSize: string | null;
}) {
  return (
    <div className="px-6 py-7 sm:px-8">
      {/* Product preview — editorial card */}
      <div className="flex items-center gap-5 rounded-xl bg-bg p-4 sm:p-5">
        <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-surface">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          {product.brand && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
              {product.brand}
            </p>
          )}
          <p className="mt-0.5 line-clamp-1 font-serif text-base text-ink sm:text-lg">
            {product.name}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            MRP <span className="font-semibold text-ink">{formatINR(price)}</span>{" "}
            <span className="text-ink-subtle">· Incl. of all taxes</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SIZE_ROWS.map((row) => {
              const inStock = availableSizes.has(row.size);
              const isActive = selectedSize === row.size;
              const cls = isActive
                ? "border-ink bg-ink text-white"
                : inStock
                  ? "border-ink bg-white text-ink hover:bg-ink hover:text-white"
                  : "border-line-strong bg-white text-ink-subtle line-through";
              if (onPickSize && inStock) {
                return (
                  <button
                    key={row.size}
                    type="button"
                    onClick={() => onPickSize(row.size)}
                    aria-pressed={isActive}
                    className={`flex h-7 min-w-10 items-center justify-center rounded-full border px-2.5 text-[11px] font-semibold transition-colors ${cls}`}
                  >
                    {row.size}
                  </button>
                );
              }
              return (
                <span
                  key={row.size}
                  className={`flex h-7 min-w-10 items-center justify-center rounded-full border px-2.5 text-[11px] font-semibold ${cls}`}
                >
                  {row.size}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chart header + unit toggle */}
      <div className="mt-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-dark">
            Reference Chart
          </p>
          <h3 className="mt-1 font-serif text-xl text-ink sm:text-2xl">
            Women&apos;s Size Guide
          </h3>
        </div>
        <div className="inline-flex shrink-0 rounded-full border border-ink p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setUnit("in")}
            className={`rounded-full px-4 py-1.5 transition-colors ${unit === "in" ? "bg-ink text-white" : "text-ink hover:bg-bg"}`}
          >
            Inches
          </button>
          <button
            type="button"
            onClick={() => setUnit("cm")}
            className={`rounded-full px-4 py-1.5 transition-colors ${unit === "cm" ? "bg-ink text-white" : "text-ink hover:bg-bg"}`}
          >
            cm
          </button>
        </div>
      </div>

      {/* Size table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-bg">
            <tr className="text-[10px] uppercase tracking-[0.15em] text-ink-muted">
              <th className="px-4 py-3 text-left font-semibold">Size</th>
              <th className="px-4 py-3 text-left font-semibold">US</th>
              <th className="px-4 py-3 text-right font-semibold">Bust</th>
              <th className="px-4 py-3 text-right font-semibold">Waist</th>
              <th className="px-4 py-3 text-right font-semibold">Hip</th>
              <th className="px-4 py-3 text-right font-semibold">Armhole</th>
              <th className="px-4 py-3 text-right font-semibold">UK</th>
            </tr>
          </thead>
          <tbody>
            {SIZE_ROWS.map((row, i) => {
              const inStock = availableSizes.has(row.size);
              const base = inStock ? "text-ink" : "text-ink-subtle";
              const show = (n: number) =>
                unit === "in" ? n : toCm(n).toFixed(0);
              return (
                <tr
                  key={row.size}
                  className={`border-t border-line ${i % 2 === 1 ? "bg-bg/40" : ""} transition-colors hover:bg-brand-tint/40`}
                >
                  <td className={`px-4 py-3 ${base}`}>
                    <span
                      className={`inline-flex min-w-9 items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${inStock ? "border-ink" : "border-line-strong"}`}
                    >
                      {row.size}
                    </span>
                  </td>
                  <td className={`px-4 py-3 ${base}`}>{row.us}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${base}`}>
                    {show(row.bust)}
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums ${base}`}>
                    {show(row.waist)}
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums ${base}`}>
                    {show(row.hip)}
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums ${base}`}>
                    {show(row.armhole)}
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums ${base}`}>
                    {row.uk}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-ink-muted">
        A standard size guide for basic body measurements. Some variations may
        apply by garment category. Talk to our stylists at{" "}
        <span className="font-medium text-ink">care@deepsandbergs.com</span> or{" "}
        <span className="font-medium text-ink">+91 99005 66466</span>.
      </p>
    </div>
  );
}

function MeasureTab() {
  return (
    <div className="flex items-center justify-center px-4 py-6 sm:px-6">
      <div className="relative w-full max-w-[640px]">
        <Image
          src="/images/size-chart.png"
          alt="How to measure — chest/bust, waist, hip, height guide"
          width={1280}
          height={880}
          className="h-auto w-full object-contain"
          priority={false}
        />
      </div>
    </div>
  );
}
