"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  TbArrowLeft,
  TbCircleCheckFilled,
  TbDownload,
  TbPackage,
  TbTruckDelivery,
  TbRotateClockwise,
  TbMapPin,
  TbCircleDashed,
} from "react-icons/tb";
import type { Order, OrderStatus, OrderEvent } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { canCancel } from "@/lib/orders/storage";

const DAY = 24 * 60 * 60 * 1000;

const STEP_FLOW: OrderStatus[] = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
];

const STEP_LABEL: Record<OrderStatus, string> = {
  placed: "Order placed",
  confirmed: "Payment confirmed",
  packed: "Packed & QC'd",
  shipped: "Shipped",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
};

export function OrderDetail({
  order,
  onCancel,
}: {
  order: Order;
  onCancel?: () => void;
}) {
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnPhotos, setReturnPhotos] = useState<string[]>([]);
  const [returnSubmitted, setReturnSubmitted] = useState(false);

  const cancelEligible = canCancel(order.status);
  const confirmCancel = () => {
    if (!onCancel) return;
    if (
      window.confirm(
        "Cancel this order? This can't be undone. Any payment will be refunded per policy.",
      )
    ) {
      onCancel();
    }
  };

  const placed = new Date(order.placedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const currentIdx = STEP_FLOW.indexOf(order.status);
  const completedByStatus = new Map(
    order.timeline.map((e) => [e.status, e]),
  );

  // Return window: 5 days from delivery for buy items.
  const deliveredEvent = order.timeline.find((e) => e.status === "delivered");
  const returnEligible =
    order.status === "delivered" &&
    deliveredEvent &&
    Date.now() - new Date(deliveredEvent.at).getTime() < 5 * DAY &&
    order.lines.some((l) => l.kind === "buy");

  const downloadInvoice = () => {
    // Placeholder — in prod this hits the backend /invoices/{orderId}.pdf
    // For the mock, generate a tiny text blob so the download works visibly.
    const content = buildInvoiceText(order);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice-${order.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-muted hover:text-ink"
      >
        <TbArrowLeft size={16} />
        All Orders
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-ink sm:text-3xl">
            Order #{order.id}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">Placed on {placed}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={downloadInvoice}
            className="inline-flex items-center gap-2 border border-ink bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-ink hover:text-white"
          >
            <TbDownload size={14} />
            GST Invoice
          </button>
          {order.tracking?.url && order.status === "shipped" && (
            <a
              href={order.tracking.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-ink px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#3a3a3a]"
            >
              <TbTruckDelivery size={14} />
              Track Shipment
            </a>
          )}
          {cancelEligible && onCancel && (
            <button
              type="button"
              onClick={confirmCancel}
              className="inline-flex items-center gap-2 border border-danger bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-danger transition-colors hover:bg-danger hover:text-white"
              style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)" }}
            >
              Cancel Order
            </button>
          )}
        </div>
      </header>

      {order.status === "cancelled" && (
        <div className="mt-4 border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-ink">
          This order was cancelled. Refunds are processed within 5–7 working days.
        </div>
      )}

      {/* Timeline */}
      <section className="mt-8 border border-line bg-white p-5 sm:p-6">
        <p className="text-sm font-semibold text-ink">Order Timeline</p>
        <ol className="mt-5 space-y-5">
          {STEP_FLOW.map((step, i) => {
            const event = completedByStatus.get(step);
            const done = currentIdx >= i;
            const active = currentIdx === i;
            return (
              <li key={step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                      done
                        ? "border-ink bg-ink text-white"
                        : "border-line-strong text-ink-subtle"
                    } ${active ? "ring-4 ring-brand-tint" : ""}`}
                  >
                    {done ? (
                      <TbCircleCheckFilled size={18} />
                    ) : (
                      <TbCircleDashed size={18} />
                    )}
                  </span>
                  {i < STEP_FLOW.length - 1 && (
                    <span
                      className={`mt-1 h-10 w-px ${
                        currentIdx > i ? "bg-ink" : "bg-line"
                      }`}
                      aria-hidden
                    />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <p
                    className={`text-sm font-semibold ${done ? "text-ink" : "text-ink-subtle"}`}
                  >
                    {STEP_LABEL[step]}
                  </p>
                  {event ? (
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {new Date(event.at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      {event.note && ` · ${event.note}`}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-ink-subtle">Pending</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {order.tracking && (
          <div className="mt-5 flex items-center gap-3 border-t border-line pt-4 text-sm">
            <TbTruckDelivery
              size={20}
              strokeWidth={2.2}
              className="text-ink"
            />
            <div className="flex-1">
              <p className="text-ink-muted">
                {order.tracking.courier}
              </p>
              <p className="font-mono text-xs text-ink">
                AWB · {order.tracking.awb}
              </p>
            </div>
            {order.tracking.url && (
              <a
                href={order.tracking.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-brand-dark underline underline-offset-4 hover:text-ink"
              >
                Track live
              </a>
            )}
          </div>
        )}
      </section>

      {/* Items */}
      <section className="mt-6 border border-line bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">
            Items ({order.lines.length})
          </p>
          {returnEligible && !returnSubmitted && (
            <button
              type="button"
              onClick={() => setReturnOpen(true)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-brand-dark underline underline-offset-4 hover:text-ink"
            >
              <TbRotateClockwise size={14} />
              Request return
            </button>
          )}
          {returnSubmitted && (
            <span
              className="inline-flex items-center gap-2 text-xs font-semibold"
              style={{ color: "var(--color-success)" }}
            >
              <TbCircleCheckFilled size={14} />
              Return requested
            </span>
          )}
        </div>
        <ul className="mt-4 divide-y divide-line">
          {order.lines.map((line, i) => (
            <li
              key={`${line.productId}-${line.variantId}-${i}`}
              className="flex gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-surface">
                <Image
                  src={line.image}
                  alt={line.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium text-ink">{line.name}</p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {line.kind === "rent" ? "Rent · " : ""}
                  Qty {line.qty}
                </p>
                {line.rental && (
                  <p className="mt-1 text-[11px] text-ink-muted">
                    {new Date(line.rental.startDate).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "short" },
                    )}{" "}
                    → {new Date(line.rental.returnDate).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "short" },
                    )}
                    {" · "}
                    Deposit {formatINR(line.rental.deposit)}
                  </p>
                )}
              </div>
              <p className="text-sm font-semibold text-ink">
                {formatINR(line.price * line.qty)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Address + Totals */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="border border-line bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <TbMapPin size={16} />
            Shipping to
          </div>
          <div className="mt-3 text-sm">
            <p className="font-semibold text-ink">{order.address.name}</p>
            <p className="mt-1 text-ink-muted">
              {order.address.line1}
              {order.address.line2 && `, ${order.address.line2}`}
              <br />
              {order.address.city}, {order.address.state}{" "}
              {order.address.pincode}
              <br />
              {order.address.phone}
            </p>
          </div>
        </section>

        <section className="border border-line bg-white p-5 sm:p-6">
          <p className="text-sm font-semibold text-ink">Payment</p>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Subtotal" value={formatINR(order.subtotal)} />
            {order.discount > 0 && (
              <Row
                label="Discount"
                value={`− ${formatINR(order.discount)}`}
                success
              />
            )}
            <Row
              label="Shipping"
              value={order.shipping === 0 ? "Free" : formatINR(order.shipping)}
              success={order.shipping === 0}
            />
            {order.lines.some((l) => l.rental) && (
              <Row
                label="Rental deposit"
                value={formatINR(
                  order.lines.reduce(
                    (s, l) => s + (l.rental?.deposit ?? 0),
                    0,
                  ),
                )}
              />
            )}
            <div className="flex justify-between border-t border-line pt-2 text-base">
              <dt className="font-semibold text-ink">Total paid</dt>
              <dd className="font-serif text-ink">{formatINR(order.total)}</dd>
            </div>
          </dl>
        </section>
      </div>

      {returnOpen && !returnSubmitted && (
        <ReturnDialog
          reason={returnReason}
          setReason={setReturnReason}
          photos={returnPhotos}
          setPhotos={setReturnPhotos}
          onClose={() => setReturnOpen(false)}
          onSubmit={() => {
            setReturnSubmitted(true);
            setReturnOpen(false);
          }}
        />
      )}
    </div>
  );
}

function Row({
  label,
  value,
  success,
}: {
  label: string;
  value: string;
  success?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-muted">{label}</dt>
      <dd
        className={success ? "font-semibold" : "text-ink"}
        style={success ? { color: "var(--color-success)" } : undefined}
      >
        {value}
      </dd>
    </div>
  );
}

/* ─────────────── Return request dialog ─────────────── */

function ReturnDialog({
  reason,
  setReason,
  photos,
  setPhotos,
  onClose,
  onSubmit,
}: {
  reason: string;
  setReason: (r: string) => void;
  photos: string[];
  setPhotos: (p: string[]) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const reasons = [
    "Doesn't fit",
    "Quality not as expected",
    "Wrong item delivered",
    "Damaged on arrival",
    "Changed my mind",
  ];

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files)
      .slice(0, 4 - photos.length)
      .map((f) => URL.createObjectURL(f));
    setPhotos([...photos, ...urls]);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative flex max-h-[85vh] w-full max-w-[520px] flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl">
        <header className="border-b border-line px-6 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-dark">
            Return Request
          </p>
          <h2 className="mt-1 font-serif text-2xl text-ink">
            Tell us what went wrong
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink">
            Reason
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {reasons.map((r) => {
              const active = reason === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    active
                      ? "border-ink bg-ink text-white"
                      : "border-ink text-ink hover:bg-ink hover:text-white"
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-ink">
            Photos{" "}
            <span className="font-normal text-ink-muted">
              (up to 4, helps us process faster)
            </span>
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {photos.map((p, i) => (
              <div
                key={i}
                className="relative h-20 w-20 overflow-hidden rounded-lg border border-line bg-surface"
              >
                <Image src={p} alt={`Return photo ${i + 1}`} fill sizes="80px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/80 text-[10px] font-bold text-white hover:bg-ink"
                  aria-label="Remove photo"
                >
                  ×
                </button>
              </div>
            ))}
            {photos.length < 4 && (
              <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border border-dashed border-line-strong text-xs text-ink-muted transition-colors hover:border-ink hover:text-ink">
                + Add
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </label>
            )}
          </div>

          <p className="mt-5 text-[11px] leading-relaxed text-ink-muted">
            Returns are honoured within 5 days of delivery for buy orders.
            Our team will confirm pickup within one working day and refund
            the amount in 5 working days of receiving the inspected item.
          </p>
        </div>

        <footer className="flex items-center gap-3 border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-ink py-3 text-sm font-semibold text-ink transition-colors hover:bg-bg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!reason}
            className={`flex-1 rounded-full py-3 text-sm font-semibold text-white transition-colors ${
              reason
                ? "bg-ink hover:bg-[#3a3a3a]"
                : "cursor-not-allowed bg-line-strong"
            }`}
          >
            Submit Return
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ─────────────── Invoice text builder ─────────────── */

function buildInvoiceText(order: Order): string {
  const lines = [
    "DEEPS & BERGS",
    "GST Invoice",
    "",
    `Order ID: ${order.id}`,
    `Date: ${new Date(order.placedAt).toLocaleDateString("en-IN")}`,
    "",
    "Shipped to:",
    `  ${order.address.name}`,
    `  ${order.address.line1}${order.address.line2 ? ", " + order.address.line2 : ""}`,
    `  ${order.address.city}, ${order.address.state} ${order.address.pincode}`,
    `  ${order.address.phone}`,
    "",
    "Items:",
    ...order.lines.map(
      (l) =>
        `  ${l.name}  ·  Qty ${l.qty}  ·  ₹${(l.price * l.qty).toLocaleString("en-IN")}`,
    ),
    "",
    `Subtotal:     ₹${order.subtotal.toLocaleString("en-IN")}`,
    `Discount:    -₹${order.discount.toLocaleString("en-IN")}`,
    `Shipping:     ${order.shipping === 0 ? "Free" : "₹" + order.shipping.toLocaleString("en-IN")}`,
    `Total paid:   ₹${order.total.toLocaleString("en-IN")}`,
  ];
  return lines.join("\n");
}
