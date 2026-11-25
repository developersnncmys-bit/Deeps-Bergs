"use client";

import Image from "next/image";
import Link from "next/link";
import { TbPackage, TbChevronRight } from "react-icons/tb";
import type { Order, OrderStatus } from "@/lib/types";
import { formatINR } from "@/lib/utils";

const STATUS_COPY: Record<OrderStatus, { label: string; tone: string }> = {
  placed: { label: "Placed", tone: "text-ink" },
  confirmed: { label: "Confirmed", tone: "text-ink" },
  packed: { label: "Packed", tone: "text-ink" },
  shipped: { label: "In Transit", tone: "text-info" },
  delivered: { label: "Delivered", tone: "text-success" },
  returned: { label: "Returned", tone: "text-ink-muted" },
  cancelled: { label: "Cancelled", tone: "text-danger" },
};

export function OrdersList({ orders }: { orders: Order[] }) {
  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-3xl text-ink sm:text-4xl">My Orders</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Track shipments, download invoices, and request returns.
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="border border-dashed border-line-strong p-10 text-center">
          <TbPackage size={32} className="mx-auto text-ink-muted" />
          <p className="mt-3 font-serif text-xl text-ink">No orders yet</p>
          <p className="mt-1 text-sm text-ink-muted">
            When you place an order, it will show up here.
          </p>
          <Link
            href="/shop"
            className="mt-5 inline-flex bg-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#3a3a3a]"
          >
            Browse the Collection
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id}>
              <OrderRow order={o} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const placed = new Date(order.placedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const status = STATUS_COPY[order.status];
  const preview = order.lines.slice(0, 3);

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="group block border border-line bg-white p-5 transition-colors hover:border-ink"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            Order #{order.id}
          </p>
          <p className="mt-1 text-sm text-ink">Placed on {placed}</p>
        </div>
        <span
          className={`text-xs font-bold uppercase tracking-wider ${status.tone}`}
          style={
            status.tone === "text-success"
              ? { color: "var(--color-success)" }
              : status.tone === "text-info"
                ? { color: "var(--color-info)" }
                : status.tone === "text-danger"
                  ? { color: "var(--color-danger)" }
                  : undefined
          }
        >
          {status.label}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex -space-x-3">
          {preview.map((l, i) => (
            <div
              key={`${l.productId}-${i}`}
              className="relative h-16 w-14 overflow-hidden border-2 border-white bg-surface"
            >
              <Image
                src={l.image}
                alt={l.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
          ))}
          {order.lines.length > 3 && (
            <div className="relative flex h-16 w-14 items-center justify-center border-2 border-white bg-bg text-xs font-semibold text-ink">
              +{order.lines.length - 3}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 text-sm">
          <p className="line-clamp-1 text-ink">
            {order.lines.map((l) => l.name).join(" · ")}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {order.lines.length}{" "}
            {order.lines.length === 1 ? "item" : "items"} ·{" "}
            <span className="font-semibold text-ink">
              {formatINR(order.total)}
            </span>
          </p>
        </div>
        <TbChevronRight
          size={20}
          className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}
