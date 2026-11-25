"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TbTruckDelivery,
  TbMapPin,
  TbCreditCard,
  TbLock,
  TbCircleCheckFilled,
} from "react-icons/tb";
import { useCart } from "@/lib/cart/CartContext";
import { products as allProducts } from "@/lib/mock-data";
import { coupons, calculateDiscount } from "@/lib/mock-data/coupons";
import { formatINR } from "@/lib/utils";
import { validatePincode } from "@/lib/pincode";
import { addOrder } from "@/lib/orders/storage";
import type { Order, OrderLine } from "@/lib/types";

// Shared store with /account/addresses so checkout addresses show up in the account.
const ADDRESS_STORAGE_KEY = "dbf.addresses.v2";

type StoredAddress = {
  id: string;
  type: "home" | "work" | "other";
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
};

function persistAddress(a: {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(ADDRESS_STORAGE_KEY);
    const existing: StoredAddress[] = raw ? JSON.parse(raw) : [];
    // Dedupe by line1 + pincode (same shipping point).
    const key = (x: { line1: string; pincode: string }) =>
      `${x.line1.trim().toLowerCase()}|${x.pincode.trim()}`;
    if (existing.some((e) => key(e) === key(a))) return;
    const next: StoredAddress[] = [
      ...existing,
      {
        id: `addr-${Date.now()}`,
        type: "home",
        name: a.name.trim(),
        phone: a.phone.trim(),
        line1: a.line1.trim(),
        line2: a.line2?.trim() || undefined,
        city: a.city.trim(),
        state: a.state.trim(),
        pincode: a.pincode.trim(),
        isDefault: existing.length === 0, // first saved address becomes default
      },
    ];
    window.localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore — localStorage full or disabled */
  }
}

type Step = "address" | "payment" | "review" | "placed";

type AddressState = {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

export function Checkout() {
  const { items, appliedCoupon, clearCart } = useCart();
  const router = useRouter();
  const [step, setStep] = useState<Step>("address");
  const [orderId, setOrderId] = useState<string | null>(null);

  const [address, setAddress] = useState<AddressState>({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [payment, setPayment] = useState<"card" | "upi" | "cod">("card");

  const productMap = useMemo(
    () => new Map(allProducts.map((p) => [p.id, p])),
    [],
  );
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
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [items, productMap]);

  const subtotal = detailedItems.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0,
  );
  const rentDeposits = detailedItems
    .filter((i) => i.mode === "rent")
    .reduce((sum, i) => sum + (i.product.rentalDeposit ?? 0) * i.quantity, 0);
  const activeCoupon = coupons.find((c) => c.code === appliedCoupon) ?? null;
  const discount = activeCoupon ? calculateDiscount(activeCoupon, subtotal) : 0;
  const total = subtotal - discount + rentDeposits;

  const pincodeCheck = validatePincode(
    address.pincode,
    address.state,
    address.city,
  );
  const addressValid =
    address.name.trim() &&
    address.phone.trim().length >= 10 &&
    address.line1.trim() &&
    address.city.trim() &&
    address.state.trim() &&
    pincodeCheck.ok;

  const placeOrder = () => {
    const id = `DBF${Date.now().toString().slice(-8)}`;
    const now = new Date().toISOString();
    const lines: OrderLine[] = detailedItems.map((i) => {
      const start = i.rentalStartISO ?? now;
      const days = i.rentalDuration ?? 3;
      const end = new Date(
        new Date(start).getTime() + days * 24 * 60 * 60 * 1000,
      ).toISOString();
      return {
        productId: i.productId,
        variantId: i.size || "default",
        name: i.product.name,
        image: i.product.images[0],
        qty: i.quantity,
        price: i.unitPrice,
        kind: i.mode === "rent" ? "rent" : "buy",
        rental:
          i.mode === "rent"
            ? {
                startDate: start,
                durationDays: days,
                deposit: i.product.rentalDeposit ?? 0,
                returnDate: end,
              }
            : undefined,
      };
    });

    const order: Order = {
      id,
      placedAt: now,
      status: "placed",
      lines,
      address: {
        id: `addr-${Date.now()}`,
        name: address.name,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2 || undefined,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      },
      subtotal,
      shipping: 0,
      discount,
      tax: 0,
      total,
      timeline: [{ at: now, status: "placed", note: "Order placed" }],
    };
    addOrder(order);

    setOrderId(id);
    setStep("placed");
    clearCart();
  };

  // Empty cart guard
  if (step !== "placed" && detailedItems.length === 0) {
    return (
      <div className="mx-auto max-w-[680px] px-6 py-24 text-center">
        <p className="font-serif text-2xl text-ink">Your cart is empty</p>
        <p className="mt-2 text-sm text-ink-muted">
          Add a piece from the shop to begin checkout.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex bg-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#3a3a3a]"
        >
          Browse the Collection
        </Link>
      </div>
    );
  }

  // Order placed state
  if (step === "placed") {
    return (
      <div className="mx-auto max-w-[520px] px-6 py-20 text-center">
        <TbCircleCheckFilled
          size={56}
          style={{ color: "var(--color-success)" }}
          className="mx-auto"
        />
        <h1 className="mt-5 font-serif text-3xl text-ink sm:text-4xl">
          Order placed
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Thank you. Your order{" "}
          <span className="font-semibold text-ink">#{orderId}</span> has been
          received and is now being prepared.
        </p>
        <p className="mt-6 text-xs uppercase tracking-wider text-ink-muted">
          A confirmation and GST invoice will be emailed to you shortly.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/account/orders"
            className="inline-flex justify-center bg-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#3a3a3a]"
          >
            View Order
          </Link>
          <Link
            href="/shop"
            className="inline-flex justify-center border border-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-20 pt-8 sm:px-6 lg:px-10">
      {/* Breadcrumb */}
      <nav className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">
        <button
          type="button"
          onClick={() => router.back()}
          className="hover:text-ink"
        >
          Cart
        </button>
        <span className="mx-2 text-ink-subtle">/</span>
        <span className="text-ink">Checkout</span>
      </nav>

      <h1 className="mt-6 font-serif text-3xl text-ink sm:text-4xl">
        Checkout
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        {/* Left — stepper + content */}
        <div>
          <Stepper step={step} setStep={setStep} addressValid={!!addressValid} />

          <div className="mt-8">
            {step === "address" && (
              <AddressForm
                address={address}
                setAddress={setAddress}
                onContinue={() => {
                  if (!addressValid) return;
                  persistAddress(address);
                  setStep("payment");
                }}
                valid={!!addressValid}
                pincodeError={
                  address.pincode.length > 0 && !pincodeCheck.ok
                    ? pincodeCheck.reason
                    : undefined
                }
              />
            )}
            {step === "payment" && (
              <PaymentForm
                payment={payment}
                setPayment={setPayment}
                onBack={() => setStep("address")}
                onContinue={() => setStep("review")}
              />
            )}
            {step === "review" && (
              <ReviewStep
                address={address}
                payment={payment}
                items={detailedItems}
                onBack={() => setStep("payment")}
                onPlace={placeOrder}
                total={total}
              />
            )}
          </div>
        </div>

        {/* Right — sticky summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary
            items={detailedItems}
            subtotal={subtotal}
            discount={discount}
            rentDeposits={rentDeposits}
            total={total}
            activeCoupon={activeCoupon?.code ?? null}
          />
        </aside>
      </div>
    </div>
  );
}

/* ─────────────── Stepper ─────────────── */

function Stepper({
  step,
  setStep,
  addressValid,
}: {
  step: Step;
  setStep: (s: Step) => void;
  addressValid: boolean;
}) {
  const steps: { key: Step; label: string; Icon: typeof TbMapPin }[] = [
    { key: "address", label: "Address", Icon: TbMapPin },
    { key: "payment", label: "Payment", Icon: TbCreditCard },
    { key: "review", label: "Review", Icon: TbLock },
  ];
  const idx = steps.findIndex((s) => s.key === step);
  return (
    <ol className="flex items-center gap-3">
      {steps.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        const canJump = i <= idx || (i === 1 && addressValid);
        return (
          <li key={s.key} className="flex flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => canJump && setStep(s.key)}
              disabled={!canJump}
              className={`flex items-center gap-2 text-left ${canJump ? "cursor-pointer" : "cursor-not-allowed"}`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
                  active
                    ? "border-ink bg-ink text-white"
                    : done
                      ? "border-ink text-ink"
                      : "border-line-strong text-ink-muted"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${active ? "text-ink" : "text-ink-muted"}`}
              >
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span
                className={`h-px flex-1 ${done ? "bg-ink" : "bg-line"}`}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ─────────────── Address form ─────────────── */

function AddressForm({
  address,
  setAddress,
  onContinue,
  valid,
  pincodeError,
}: {
  address: AddressState;
  setAddress: React.Dispatch<React.SetStateAction<AddressState>>;
  onContinue: () => void;
  valid: boolean;
  pincodeError?: string;
}) {
  const update = (k: keyof AddressState, v: string) =>
    setAddress({ ...address, [k]: v });

  return (
    <section>
      <h2 className="font-serif text-xl text-ink">Delivery address</h2>
      <p className="mt-1 text-sm text-ink-muted">
        We&apos;ll use this for shipping and your invoice.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Full name" value={address.name} onChange={(v) => update("name", v)} />
        <Field
          label="Mobile"
          type="tel"
          value={address.phone}
          onChange={(v) => update("phone", v.replace(/\D/g, "").slice(0, 10))}
        />
        <div className="sm:col-span-2">
          <Field
            label="Address line 1"
            value={address.line1}
            onChange={(v) => update("line1", v)}
          />
        </div>
        <div className="sm:col-span-2">
          <Field
            label="Address line 2 (optional)"
            value={address.line2}
            onChange={(v) => update("line2", v)}
          />
        </div>
        <Field label="City" value={address.city} onChange={(v) => update("city", v)} />
        <Field label="State" value={address.state} onChange={(v) => update("state", v)} />
        <Field
          label="Pincode"
          value={address.pincode}
          onChange={(v) => update("pincode", v.replace(/\D/g, "").slice(0, 6))}
          error={pincodeError}
        />
      </div>

      <div className="mt-6 flex items-center gap-3 border border-line bg-bg px-4 py-3 text-sm">
        <TbTruckDelivery size={22} strokeWidth={2.2} className="text-ink" />
        <span className="text-ink-muted">
          Free shipping on orders above ₹3,000. Estimated delivery in 3–5
          working days.
        </span>
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!valid}
        className={`mt-6 w-full py-3.5 text-xs font-bold uppercase tracking-[0.22em] text-white transition-colors sm:w-auto sm:px-10 ${
          valid
            ? "bg-ink hover:bg-[#3a3a3a]"
            : "cursor-not-allowed bg-line-strong"
        }`}
      >
        Continue to Payment
      </button>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className={
          "w-full border bg-white px-4 py-2.5 text-sm text-ink outline-none " +
          (error
            ? "border-danger focus:border-danger"
            : "border-line-strong focus:border-ink")
        }
        style={{ outline: "none", boxShadow: "none" }}
      />
      {error && (
        <span className="mt-1 block text-[11px] font-medium text-danger">
          {error}
        </span>
      )}
    </label>
  );
}

/* ─────────────── Payment form ─────────────── */

function PaymentForm({
  payment,
  setPayment,
  onBack,
  onContinue,
}: {
  payment: "card" | "upi" | "cod";
  setPayment: (p: "card" | "upi" | "cod") => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const options = [
    { key: "card" as const, title: "Credit / Debit Card", sub: "Visa, Mastercard, Amex" },
    { key: "upi" as const, title: "UPI", sub: "Pay via any UPI app" },
    { key: "cod" as const, title: "Cash on Delivery", sub: "Pay when you receive" },
  ];
  return (
    <section>
      <h2 className="font-serif text-xl text-ink">Payment method</h2>
      <p className="mt-1 text-sm text-ink-muted">
        You&apos;ll be redirected to Razorpay to complete the transaction.
      </p>

      <div className="mt-6 space-y-3">
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => setPayment(o.key)}
            className={`flex w-full items-start gap-3 border px-4 py-4 text-left transition-colors ${
              payment === o.key
                ? "border-ink bg-brand-tint/40"
                : "border-line-strong hover:border-ink"
            }`}
          >
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                payment === o.key ? "border-ink" : "border-line-strong"
              }`}
            >
              {payment === o.key && (
                <span className="h-2.5 w-2.5 rounded-full bg-ink" />
              )}
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-ink">
                {o.title}
              </span>
              <span className="block text-xs text-ink-muted">{o.sub}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold uppercase tracking-wider text-ink underline-offset-4 hover:underline"
        >
          ← Back to Address
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="bg-ink px-10 py-3.5 text-xs font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#3a3a3a]"
        >
          Review Order
        </button>
      </div>
    </section>
  );
}

/* ─────────────── Review step ─────────────── */

function ReviewStep({
  address,
  payment,
  items,
  total,
  onBack,
  onPlace,
}: {
  address: AddressState;
  payment: string;
  items: ReturnType<typeof Array.isArray> extends never ? never : any[];
  total: number;
  onBack: () => void;
  onPlace: () => void;
}) {
  return (
    <section>
      <h2 className="font-serif text-xl text-ink">Review & place order</h2>

      <div className="mt-6 space-y-4">
        <ReviewRow title="Shipping to">
          <p className="text-sm font-semibold text-ink">{address.name}</p>
          <p className="text-sm text-ink-muted">
            {address.line1}
            {address.line2 && `, ${address.line2}`}
            <br />
            {address.city}, {address.state} {address.pincode}
            <br />
            {address.phone}
          </p>
        </ReviewRow>
        <ReviewRow title="Payment method">
          <p className="text-sm text-ink">
            {payment === "card"
              ? "Credit / Debit Card"
              : payment === "upi"
                ? "UPI"
                : "Cash on Delivery"}
          </p>
        </ReviewRow>
        <ReviewRow title={`Items (${items.length})`}>
          <ul className="space-y-3">
            {items.map((i) => (
              <li
                key={`${i.productId}-${i.size}-${i.mode}`}
                className="flex gap-3"
              >
                <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-surface">
                  <Image
                    src={i.product.images[0]}
                    alt={i.product.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 text-sm">
                  <p className="line-clamp-1 font-medium text-ink">
                    {i.product.name}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {i.mode === "rent" ? "Rent · " : ""}
                    Size {i.size} · Qty {i.quantity}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </ReviewRow>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold uppercase tracking-wider text-ink underline-offset-4 hover:underline"
        >
          ← Back to Payment
        </button>
        <button
          type="button"
          onClick={onPlace}
          className="bg-ink px-10 py-3.5 text-xs font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#3a3a3a]"
        >
          Place Order · {formatINR(total)}
        </button>
      </div>
    </section>
  );
}

function ReviewRow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-line p-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
        {title}
      </p>
      {children}
    </div>
  );
}

/* ─────────────── Sticky order summary ─────────────── */

function OrderSummary({
  items,
  subtotal,
  discount,
  rentDeposits,
  total,
  activeCoupon,
}: {
  items: ReturnType<typeof Array.isArray> extends never ? never : any[];
  subtotal: number;
  discount: number;
  rentDeposits: number;
  total: number;
  activeCoupon: string | null;
}) {
  return (
    <div className="border border-line bg-white p-5 sm:p-6">
      <p className="text-sm font-semibold text-ink">Order Summary</p>

      <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
        {items.map((i) => (
          <li key={`${i.productId}-${i.size}-${i.mode}`} className="flex gap-3">
            <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-surface">
              <Image
                src={i.product.images[0]}
                alt={i.product.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 text-sm">
              <p className="line-clamp-1 text-ink">{i.product.name}</p>
              <p className="text-xs text-ink-muted">
                {i.mode === "rent" ? "Rent · " : ""}
                {i.size} · Qty {i.quantity}
              </p>
            </div>
            <p className="text-sm font-semibold text-ink">
              {formatINR(i.unitPrice * i.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-muted">Subtotal</dt>
          <dd className="text-ink">{formatINR(subtotal)}</dd>
        </div>
        {rentDeposits > 0 && (
          <div className="flex justify-between">
            <dt className="text-ink-muted">Rental deposit</dt>
            <dd className="text-ink">{formatINR(rentDeposits)}</dd>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-ink-muted">
              Discount {activeCoupon && `(${activeCoupon})`}
            </dt>
            <dd
              className="font-semibold"
              style={{ color: "var(--color-success)" }}
            >
              − {formatINR(discount)}
            </dd>
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
        <div className="flex justify-between border-t border-line pt-3 text-base">
          <dt className="font-semibold text-ink">Total</dt>
          <dd className="font-serif text-ink">{formatINR(total)}</dd>
        </div>
      </dl>
    </div>
  );
}
