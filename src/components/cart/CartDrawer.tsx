"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TbX,
  TbTrash,
  TbMinus,
  TbPlus,
  TbChevronRight,
  TbChevronLeft,
  TbTicket,
  TbRosetteDiscountCheck,
  TbCoin,
} from "react-icons/tb";
import { useCart, type CartItem } from "@/lib/cart/CartContext";
import { products as allProducts } from "@/lib/mock-data";
import { jewelryAddons, type Addon } from "@/lib/mock-data/addons";
import { coupons, calculateDiscount } from "@/lib/mock-data/coupons";
import {
  pointsBalance,
  maxRedeemable,
  POINT_VALUE_INR,
} from "@/lib/mock-data/loyalty";
import { formatINR } from "@/lib/utils";

type View = "cart" | "coupons";

export function CartDrawer() {
  const {
    items,
    appliedCoupon,
    pointsRedeemed,
    drawerOpen,
    closeDrawer,
    removeItem,
    updateQty,
    addItem,
    applyCoupon,
    setPointsRedeemed,
  } = useCart();
  const router = useRouter();
  const [view, setView] = useState<View>("cart");
  const [agree, setAgree] = useState(true);

  const productMap = useMemo(
    () => new Map(allProducts.map((p) => [p.id, p])),
    [],
  );

  // Hydrate cart items with their product details for display
  const detailedItems = useMemo(() => {
    return items
      .map((ci) => {
        const p = productMap.get(ci.productId);
        if (!p) return null;
        const unitPrice =
          ci.mode === "rent"
            ? p.rentalPricing?.find((r) => r.durationDays === ci.rentalDuration)
                ?.price ??
              p.rentalPricing?.[0]?.price ??
              0
            : p.price ?? 0;
        return { ...ci, product: p, unitPrice };
      })
      .filter(
        (
          x,
        ): x is CartItem & {
          product: NonNullable<ReturnType<typeof productMap.get>>;
          unitPrice: number;
        } => x !== null,
      );
  }, [items, productMap]);

  // Price breakdown (matches Kalki-style detailed summary):
  //   MRP Total        = Σ (mrp × qty)        for buy items (rent uses actual rent price)
  //   Subtotal         = Σ (selling × qty)    i.e. what customer pays per line
  //   Discount on MRP  = MRP Total − Subtotal (product-level discounts)
  //   Coupon discount  = applied separately
  //   Rental deposit   = refundable, added on top
  //   Estimated total  = Subtotal − coupon + rental deposit
  const mrpTotal = detailedItems.reduce((sum, i) => {
    const mrp =
      i.mode === "buy"
        ? i.product.mrp ?? i.unitPrice
        : i.product.rentalDeposit // rent items don't have an MRP concept
          ? i.unitPrice
          : i.unitPrice;
    return sum + mrp * i.quantity;
  }, 0);
  const subtotal = detailedItems.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0,
  );
  const discountOnMrp = Math.max(0, mrpTotal - subtotal);
  const rentDeposits = detailedItems
    .filter((i) => i.mode === "rent")
    .reduce((sum, i) => sum + (i.product.rentalDeposit ?? 0) * i.quantity, 0);

  const activeCoupon = coupons.find((c) => c.code === appliedCoupon) ?? null;
  const discount = activeCoupon ? calculateDiscount(activeCoupon, subtotal) : 0;

  // Loyalty points (SOW R04) — redeemable up to the cap, capped again against
  // whatever is left after the coupon so we never go below the floor.
  const balance = pointsBalance();
  const maxPts = maxRedeemable(balance, subtotal);
  const pointsApplied = Math.min(pointsRedeemed, maxPts);
  const pointsValue = Math.min(
    pointsApplied * POINT_VALUE_INR,
    Math.max(0, subtotal - discount),
  );

  const estimatedTotal = subtotal - discount - pointsValue + rentDeposits;
  const totalSavings = discountOnMrp + discount + pointsValue;

  if (!drawerOpen) return null;

  const close = () => {
    setView("cart");
    closeDrawer();
  };

  return (
    <div className="fixed inset-0 z-[70] flex">
      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={close}
        aria-hidden
      />
      <aside className="flex h-full w-full max-w-[460px] flex-col bg-white shadow-2xl">
        {view === "cart" ? (
          <CartView
            detailedItems={detailedItems}
            mrpTotal={mrpTotal}
            discountOnMrp={discountOnMrp}
            subtotal={subtotal}
            discount={discount}
            rentDeposits={rentDeposits}
            estimatedTotal={estimatedTotal}
            totalSavings={totalSavings}
            activeCoupon={activeCoupon}
            pointsBalance={balance}
            maxPointsRedeemable={maxPts}
            pointsApplied={pointsApplied}
            pointsValue={pointsValue}
            setPointsRedeemed={setPointsRedeemed}
            agree={agree}
            setAgree={setAgree}
            removeItem={removeItem}
            updateQty={updateQty}
            addAddon={(addon: Addon) =>
              addItem({
                productId: addon.id,
                size: "Free",
                quantity: 1,
                mode: "buy",
              })
            }
            onViewCoupons={() => setView("coupons")}
            onCheckout={() => {
              close();
              router.push("/checkout");
            }}
            onClose={close}
          />
        ) : (
          <CouponsView
            subtotal={subtotal}
            appliedCoupon={appliedCoupon}
            onApply={(code) => {
              applyCoupon(code);
              setView("cart");
            }}
            onBack={() => setView("cart")}
            onClose={close}
          />
        )}
      </aside>
    </div>
  );
}

/* ─────────────── Cart View ─────────────── */

function CartView({
  detailedItems,
  mrpTotal,
  discountOnMrp,
  subtotal,
  discount,
  rentDeposits,
  estimatedTotal,
  totalSavings,
  activeCoupon,
  pointsBalance: balance,
  maxPointsRedeemable,
  pointsApplied,
  pointsValue,
  setPointsRedeemed,
  agree,
  setAgree,
  removeItem,
  updateQty,
  addAddon,
  onViewCoupons,
  onCheckout,
  onClose,
}: {
  detailedItems: ReturnType<typeof useCart> extends never ? never : any[];
  mrpTotal: number;
  discountOnMrp: number;
  subtotal: number;
  discount: number;
  rentDeposits: number;
  estimatedTotal: number;
  totalSavings: number;
  activeCoupon: { code: string; label: string } | null;
  pointsBalance: number;
  maxPointsRedeemable: number;
  pointsApplied: number;
  pointsValue: number;
  setPointsRedeemed: (n: number) => void;
  agree: boolean;
  setAgree: (v: boolean) => void;
  removeItem: (id: string, size: string, mode: "buy" | "rent") => void;
  updateQty: (
    id: string,
    size: string,
    mode: "buy" | "rent",
    qty: number,
  ) => void;
  addAddon: (addon: Addon) => void;
  onViewCoupons: () => void;
  onCheckout: () => void;
  onClose: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollByPage = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const itemCount = detailedItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between border-b border-line px-6 py-5">
        <h2 className="font-serif text-xl text-ink">
          Your Cart{" "}
          <span className="text-ink-muted">
            ({itemCount} {itemCount === 1 ? "Item" : "Items"})
          </span>
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close cart"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-bg"
        >
          <TbX size={18} />
        </button>
      </header>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {detailedItems.length === 0 ? (
          <EmptyState onClose={onClose} />
        ) : (
          <>
            {/* Line items */}
            <ul className="divide-y divide-line">
              {detailedItems.map((item) => (
                <li
                  key={`${item.productId}-${item.size}-${item.mode}`}
                  className="px-6 py-5"
                >
                  <CartLineItem
                    item={item}
                    onRemove={() =>
                      removeItem(item.productId, item.size, item.mode)
                    }
                    onQty={(q) =>
                      updateQty(item.productId, item.size, item.mode, q)
                    }
                  />
                </li>
              ))}
            </ul>

            {/* Add-ons */}
            <section className="border-t-8 border-bg px-6 py-6">
              <div className="mb-4">
                <p className="text-sm font-semibold text-ink">
                  The Perfect Finishing Touch
                </p>
                <p className="text-xs text-brand-dark">
                  Jewellery at 25% OFF
                </p>
              </div>
              <div className="relative">
                <div
                  ref={scrollRef}
                  className="no-scrollbar overflow-x-auto scroll-smooth"
                >
                  <div className="flex gap-3 pb-1">
                    {jewelryAddons.map((a) => (
                      <AddonCard
                        key={a.id}
                        addon={a}
                        onAdd={() => addAddon(a)}
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => scrollByPage(-1)}
                  aria-label="Scroll left"
                  className="absolute left-0 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink shadow-md sm:flex"
                >
                  <TbChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByPage(1)}
                  aria-label="Scroll right"
                  className="absolute right-0 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink shadow-md sm:flex"
                >
                  <TbChevronRight size={14} />
                </button>
              </div>
            </section>

            {/* Coupons */}
            <section className="border-t-8 border-bg px-6 py-5">
              {activeCoupon ? (
                <div className="flex items-center justify-between rounded-lg border border-success/40 bg-success/5 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <TbRosetteDiscountCheck
                      size={22}
                      style={{ color: "var(--color-success)" }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {activeCoupon.code} applied
                      </p>
                      <p className="text-xs text-ink-muted">
                        You save {formatINR(discount)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onViewCoupons}
                    className="text-xs font-semibold text-brand-dark underline underline-offset-4"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onViewCoupons}
                  className="flex w-full items-center justify-between py-1"
                >
                  <span className="flex items-center gap-3">
                    <TbTicket size={20} className="text-ink" />
                    <span>
                      <span className="block text-sm font-semibold text-ink">
                        Available Coupons
                      </span>
                      <span className="block text-xs text-ink-muted">
                        {coupons.length} offers available
                      </span>
                    </span>
                  </span>
                  <span className="text-xs font-semibold text-brand-dark underline underline-offset-4">
                    View Coupons &rarr;
                  </span>
                </button>
              )}
            </section>

            {/* Loyalty — Redeem Points (SOW R04) */}
            {maxPointsRedeemable > 0 && (
              <section className="border-t-8 border-bg px-6 py-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand-dark">
                    <TbCoin size={18} />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">
                      Redeem Loyalty Points
                    </p>
                    <p className="text-xs text-ink-muted">
                      {balance.toLocaleString("en-IN")} pts available ·
                      Use up to {maxPointsRedeemable.toLocaleString("en-IN")}{" "}
                      on this order
                    </p>
                  </div>
                  {pointsApplied > 0 && (
                    <button
                      type="button"
                      onClick={() => setPointsRedeemed(0)}
                      className="shrink-0 text-xs font-semibold text-brand-dark underline underline-offset-4"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={maxPointsRedeemable}
                    step={10}
                    value={pointsApplied}
                    onChange={(e) =>
                      setPointsRedeemed(Number(e.target.value))
                    }
                    className="w-full accent-ink"
                  />
                  <div className="w-24 shrink-0 text-right">
                    <p className="text-sm font-semibold text-ink">
                      {pointsApplied.toLocaleString("en-IN")} pts
                    </p>
                    {pointsValue > 0 && (
                      <p
                        className="text-[11px] font-semibold"
                        style={{ color: "var(--color-success)" }}
                      >
                        − {formatINR(pointsValue)}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Order summary — detailed price breakdown */}
            <section className="border-t-8 border-bg px-6 py-5">
              <p className="mb-3 text-sm font-semibold text-ink">
                Order Summary
              </p>
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-muted">MRP Total</dt>
                  <dd className="text-ink">{formatINR(mrpTotal)}</dd>
                </div>
                {discountOnMrp > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-ink-muted">Discount on MRP</dt>
                    <dd
                      className="font-semibold"
                      style={{ color: "var(--color-success)" }}
                    >
                      − {formatINR(discountOnMrp)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-line pt-2.5">
                  <dt className="text-ink-muted">Subtotal</dt>
                  <dd className="text-ink">{formatINR(subtotal)}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-ink-muted">
                      Coupon ({activeCoupon?.code})
                    </dt>
                    <dd
                      className="font-semibold"
                      style={{ color: "var(--color-success)" }}
                    >
                      − {formatINR(discount)}
                    </dd>
                  </div>
                )}
                {pointsValue > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-ink-muted">
                      Loyalty points ({pointsApplied.toLocaleString("en-IN")} pts)
                    </dt>
                    <dd
                      className="font-semibold"
                      style={{ color: "var(--color-success)" }}
                    >
                      − {formatINR(pointsValue)}
                    </dd>
                  </div>
                )}
                {rentDeposits > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-ink-muted">Refundable rental deposit</dt>
                    <dd className="text-ink">{formatINR(rentDeposits)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Shipping</dt>
                  <dd
                    className="font-semibold"
                    style={{ color: "var(--color-success)" }}
                  >
                    Free
                  </dd>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-lg bg-brand-tint/50 px-3 py-2.5 text-base">
                  <dt className="font-semibold text-ink">Estimated total</dt>
                  <dd className="font-serif text-ink">
                    {formatINR(estimatedTotal)}
                  </dd>
                </div>
              </dl>

              {totalSavings > 0 && (
                <p
                  className="mt-3 rounded-md bg-success/5 px-3 py-2 text-center text-xs font-semibold"
                  style={{ color: "var(--color-success)" }}
                >
                  Congrats! You saved {formatINR(totalSavings)} on this order
                </p>
              )}

              <p className="mt-3 text-center text-[11px] uppercase tracking-wider text-ink-muted">
                5 Days Easy Return
              </p>
            </section>

            {/* Payment methods */}
            <section className="border-t-8 border-bg px-6 py-5 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink">
                We Accept
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-wider">
                {["Visa", "Mastercard", "Amex", "COD", "UPI", "RuPay"].map(
                  (p) => (
                    <span
                      key={p}
                      className="rounded-md border border-line bg-white px-3 py-1.5 text-ink"
                    >
                      {p}
                    </span>
                  ),
                )}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Footer */}
      {detailedItems.length > 0 && (
        <footer className="border-t border-line bg-white px-6 py-4">
          <button
            type="button"
            disabled={!agree}
            onClick={onCheckout}
            className={`w-full py-3.5 text-sm font-bold uppercase tracking-[0.22em] text-white transition-colors ${
              agree
                ? "bg-ink hover:bg-[#3a3a3a]"
                : "cursor-not-allowed bg-line-strong"
            }`}
          >
            Checkout · {formatINR(estimatedTotal)}
          </button>
          <label className="mt-3 flex items-start gap-2 text-[11px] text-ink-muted">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 accent-ink"
            />
            <span>
              By clicking on Checkout, you are agreeing to all our policies.
            </span>
          </label>
        </footer>
      )}
    </>
  );
}

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <p className="font-serif text-xl text-ink">Your cart is empty</p>
      <p className="text-sm text-ink-muted">
        Browse the catalogue and add a piece to get started.
      </p>
      <Link
        href="/shop"
        onClick={onClose}
        className="mt-2 inline-flex bg-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#3a3a3a]"
      >
        Shop the Collection
      </Link>
    </div>
  );
}

/* ─────────────── Cart line item ─────────────── */

function CartLineItem({
  item,
  onRemove,
  onQty,
}: {
  item: {
    product: {
      slug: string;
      name: string;
      images: string[];
      mrp?: number;
      price?: number;
    };
    size: string;
    quantity: number;
    mode: "buy" | "rent";
    rentalDuration?: number;
    rentalStartISO?: string;
    unitPrice: number;
  };
  onRemove: () => void;
  onQty: (qty: number) => void;
}) {
  const { product } = item;
  const hasDiscount =
    product.mrp && product.price && product.mrp > product.price;

  return (
    <div className="flex gap-4">
      <Link
        href={`/p/${product.slug}`}
        className="relative h-28 w-24 shrink-0 overflow-hidden bg-surface"
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="96px"
          className="object-cover"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/p/${product.slug}`}
            className="line-clamp-2 text-sm font-semibold text-ink hover:text-brand"
          >
            {product.name}
          </Link>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove item"
            className="text-ink-muted transition-colors hover:text-brand"
          >
            <TbTrash size={16} />
          </button>
        </div>

        <p className="mt-1 text-xs text-ink-muted">
          Size: <span className="font-medium text-ink">{item.size}</span>
          {item.mode === "rent" && item.rentalDuration && (
            <>
              {" · "}
              <span className="font-medium text-ink">
                Rent {item.rentalDuration} days
              </span>
            </>
          )}
        </p>

        <div className="mt-3 flex items-center justify-between">
          {/* Qty */}
          <div className="inline-flex items-center rounded-full border border-line">
            <button
              type="button"
              onClick={() => onQty(item.quantity - 1)}
              aria-label="Decrease quantity"
              className="flex h-8 w-8 items-center justify-center text-ink hover:text-brand"
            >
              <TbMinus size={14} />
            </button>
            <span className="w-7 text-center text-sm font-semibold text-ink">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onQty(item.quantity + 1)}
              aria-label="Increase quantity"
              className="flex h-8 w-8 items-center justify-center text-ink hover:text-brand"
            >
              <TbPlus size={14} />
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-sm font-semibold text-ink">
              {formatINR(item.unitPrice * item.quantity)}
            </p>
            {hasDiscount && item.mode === "buy" && product.mrp && (
              <p className="text-xs text-ink-subtle line-through">
                {formatINR(product.mrp * item.quantity)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Addon card ─────────────── */

function AddonCard({ addon, onAdd }: { addon: Addon; onAdd: () => void }) {
  return (
    <div className="flex w-[140px] shrink-0 flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        <Image
          src={addon.image}
          alt={addon.name}
          fill
          sizes="140px"
          className="object-cover"
        />
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-ink">{addon.name}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-xs font-semibold text-ink">
          {formatINR(addon.price)}
        </span>
        <span className="text-[10px] text-ink-subtle line-through">
          {formatINR(addon.mrp)}
        </span>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-2 border border-ink bg-white py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-white"
      >
        Add
      </button>
    </div>
  );
}

/* ─────────────── Coupons sub-view ─────────────── */

function CouponsView({
  subtotal,
  appliedCoupon,
  onApply,
  onBack,
  onClose,
}: {
  subtotal: number;
  appliedCoupon: string | null;
  onApply: (code: string | null) => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleApply = (code: string) => {
    const normalized = code.trim().toUpperCase();
    const match = coupons.find((c) => c.code === normalized);
    if (!match) {
      setError("That coupon code isn't valid.");
      return;
    }
    if (match.minSubtotal && subtotal < match.minSubtotal) {
      setError(
        `Spend ${formatINR(match.minSubtotal)} to unlock ${match.code}.`,
      );
      return;
    }
    setError(null);
    onApply(normalized);
  };

  return (
    <>
      <header className="flex items-center justify-between border-b border-line px-4 py-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to cart"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-bg"
        >
          <TbChevronLeft size={18} />
        </button>
        <h2 className="font-serif text-xl text-ink">
          Your Coupons{" "}
          <span className="text-ink-muted">({coupons.length})</span>
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-bg"
        >
          <TbX size={18} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Manual entry */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="Enter Coupon"
            className="flex-1 border border-line-strong bg-white px-4 py-3 text-sm uppercase tracking-wider text-ink outline-none placeholder:text-ink-subtle placeholder:tracking-normal focus:border-ink"
            style={{ outline: "none", boxShadow: "none" }}
          />
          <button
            type="button"
            onClick={() => handleApply(input)}
            disabled={!input.trim()}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white transition-colors ${
              input.trim()
                ? "bg-ink hover:bg-[#3a3a3a]"
                : "cursor-not-allowed bg-line-strong"
            }`}
          >
            Apply
          </button>
        </div>
        {error && (
          <p className="mt-2 text-xs text-danger" style={{ color: "var(--color-danger)" }}>
            {error}
          </p>
        )}

        {/* Available offers */}
        <p className="mb-3 mt-8 text-sm font-semibold text-ink">
          Available Offers
        </p>
        <div className="space-y-3">
          {coupons.map((c) => {
            const applied = appliedCoupon === c.code;
            const discount = calculateDiscount(c, subtotal);
            const eligible =
              !c.minSubtotal || subtotal >= c.minSubtotal;
            return (
              <div
                key={c.code}
                className="border border-line bg-bg px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-dashed border-brand-dark bg-brand-tint px-3 py-1 text-xs font-bold tracking-wider text-brand-dark">
                      {c.code}
                    </span>
                  </div>
                  {applied ? (
                    <button
                      type="button"
                      onClick={() => onApply(null)}
                      className="text-xs font-semibold text-brand-dark underline underline-offset-4"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApply(c.code)}
                      disabled={!eligible}
                      className={`px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors ${
                        eligible
                          ? "bg-ink hover:bg-[#3a3a3a]"
                          : "cursor-not-allowed bg-line-strong"
                      }`}
                    >
                      Apply
                    </button>
                  )}
                </div>
                {eligible && discount > 0 && (
                  <p
                    className="mt-2 text-sm font-semibold"
                    style={{ color: "var(--color-success)" }}
                  >
                    You save {formatINR(discount)}{" "}
                    <span className="text-xs font-normal text-ink-muted">
                      (up to {formatINR(c.maxOff)})
                    </span>
                  </p>
                )}
                <p className="mt-1 text-xs text-ink-muted">{c.label}</p>
                {!eligible && c.minSubtotal && (
                  <p className="mt-1 text-[11px] text-ink-subtle">
                    Spend {formatINR(c.minSubtotal)} to unlock
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
