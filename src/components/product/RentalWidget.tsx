"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { ReserveInAdvanceModal } from "@/components/rent/RentCatalog";
import { SizeGuideModal } from "@/components/product/SizeGuideModal";
import { useCart } from "@/lib/cart/CartContext";

/**
 * SOW C05 — Rental engine (CUSTOMER surface).
 *
 * Choose start date + duration, see live rental charge, deposit and return
 * date. Return date accounts for product.bufferDays so "Done when: buffer
 * days are always enforced between bookings" is visible to the customer.
 */
export function RentalWidget({ product }: { product: Product }) {
  const tiers = product.rentalPricing ?? [];
  const sizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const [activeSize, setActiveSize] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(
    tiers[0]?.durationDays ?? 3,
  );
  // Initialise to epoch and hydrate on mount — Next's prerender disallows
  // `new Date()` in a Client Component's initial state.
  const [startDate, setStartDate] = useState<Date>(() => new Date(0));
  useEffect(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    // SOW A pro tip: arrive 2 days before event — default to 2 days from now.
    d.setDate(d.getDate() + 2);
    setStartDate(d);
  }, []);
  const [modalOpen, setModalOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const { addItem, openDrawer } = useCart();

  const handleReserve = () => {
    if (sizes.length > 0 && !activeSize) return;
    addItem({
      productId: product.id,
      size: activeSize ?? "Free",
      quantity: 1,
      mode: "rent",
      rentalDuration: (duration === 3 || duration === 5 || duration === 7
        ? duration
        : 3) as 3 | 5 | 7,
      rentalStartISO: startDate.toISOString(),
    });
    openDrawer();
  };

  const currentTier = tiers.find((t) => t.durationDays === duration) ?? tiers[0];
  const rentalCharge = currentTier?.price ?? 0;
  const deposit = product.rentalDeposit ?? 0;
  const bufferDays = product.bufferDays ?? 0;

  const returnDate = useMemo(() => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + duration);
    return d;
  }, [startDate, duration]);

  const nextBookingAvailable = useMemo(() => {
    // Return + buffer = when the piece is bookable again. Shown so the user
    // understands why some dates on the calendar may be locked.
    const d = new Date(returnDate);
    d.setDate(d.getDate() + bufferDays);
    return d;
  }, [returnDate, bufferDays]);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  if (tiers.length === 0) return null;

  // Modal needs the strict 3|5|7 union — map our tier set onto that if possible,
  // otherwise fall back to whichever duration is currently selected.
  const modalDuration: 3 | 5 | 7 =
    duration === 3 || duration === 5 || duration === 7 ? duration : 3;

  return (
    <div className="border border-line-strong p-5 sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-dark">
        Rent this piece
      </p>
      <p className="mt-1 text-sm text-ink-muted">
        Wear it once · return it clean · deposit refunded in 3 working days.
      </p>

      {/* Size — SOW C05 pieces are variant-level, so the customer must pick a size */}
      {sizes.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink">
              Size
            </p>
            <button
              type="button"
              onClick={() => setSizeGuideOpen(true)}
              className="text-xs text-ink underline underline-offset-4 hover:text-brand"
            >
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const inStock = product.variants.some(
                (v) => v.size === s && v.inStock,
              );
              const active = s === activeSize;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={!inStock}
                  onClick={() => setActiveSize(s)}
                  className={`flex h-11 min-w-11 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors ${
                    !inStock
                      ? "cursor-not-allowed border-line-strong text-ink-subtle line-through"
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
          {activeSize == null && (
            <p className="mt-2 text-[11px] text-ink-muted">
              Pick a size to see available dates for that piece.
            </p>
          )}
        </div>
      )}

      {/* Duration tiers */}
      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink">
          Rental duration
        </p>
        <div className="flex flex-wrap gap-2">
          {tiers.map((t) => {
            const active = t.durationDays === duration;
            return (
              <button
                key={t.durationDays}
                type="button"
                onClick={() => setDuration(t.durationDays)}
                className={`flex flex-col items-start rounded-xl border px-4 py-3 text-left transition-colors ${active ? "border-ink bg-brand-tint" : "border-line-strong hover:border-ink"}`}
              >
                <span className="text-sm font-semibold text-ink">
                  {t.durationDays} days
                </span>
                <span className="mt-0.5 text-xs text-ink-muted">
                  {formatINR(t.price)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date chooser */}
      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink">
          Choose start date
        </p>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex w-full items-center justify-between border border-ink px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-white"
        >
          <span>{fmt(startDate)}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="3" y="5" width="18" height="16" rx="1" strokeLinecap="round" />
            <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Summary */}
      <dl className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-muted">Rental charge</dt>
          <dd className="font-semibold text-ink">{formatINR(rentalCharge)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-muted">Refundable deposit</dt>
          <dd className="font-semibold text-ink">{formatINR(deposit)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-2">
          <dt className="text-ink-muted">You pay today</dt>
          <dd className="font-semibold text-ink">
            {formatINR(rentalCharge + deposit)}
          </dd>
        </div>
        <div className="flex justify-between text-xs text-ink-muted">
          <dt>Return by</dt>
          <dd>{fmt(returnDate)}</dd>
        </div>
        {bufferDays > 0 && (
          <div className="flex justify-between text-[11px] text-ink-subtle">
            <dt>Next bookable after</dt>
            <dd>{fmt(nextBookingAvailable)} · {bufferDays}-day buffer</dd>
          </div>
        )}
      </dl>

      <button
        type="button"
        disabled={sizes.length > 0 && !activeSize}
        onClick={handleReserve}
        className={`mt-5 w-full px-6 py-3.5 text-xs font-bold uppercase tracking-[0.22em] text-white transition-colors ${
          sizes.length > 0 && !activeSize
            ? "cursor-not-allowed bg-line-strong"
            : "bg-ink hover:bg-[#3a3a3a]"
        }`}
      >
        {sizes.length > 0 && !activeSize
          ? "Select a size to reserve"
          : `Reserve ${activeSize ? `size ${activeSize} ` : ""}for ${fmt(startDate)}`}
      </button>

      <p className="mt-3 text-[11px] text-ink-muted">
        Cancellation per policy · extend if the piece is free · damages
        assessed against deposit.
      </p>

      {modalOpen && (
        <ReserveInAdvanceModal
          duration={modalDuration}
          setDuration={(d) => setDuration(d)}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={returnDate}
          onClose={() => setModalOpen(false)}
          onReset={() => {
            const t = new Date();
            t.setHours(0, 0, 0, 0);
            t.setDate(t.getDate() + 2);
            setStartDate(t);
            setDuration(tiers[0]?.durationDays ?? 3);
          }}
        />
      )}

      {sizeGuideOpen && (
        <SizeGuideModal
          product={product}
          onClose={() => setSizeGuideOpen(false)}
          onSelectSize={(size) => setActiveSize(size)}
          selectedSize={activeSize}
        />
      )}
    </div>
  );
}
