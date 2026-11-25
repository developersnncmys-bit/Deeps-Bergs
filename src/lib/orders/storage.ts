"use client";

import type { Order, OrderStatus } from "@/lib/types";

/**
 * Local source of truth for orders placed from this browser.
 * Backend-less for now: checkout writes here, /account/orders reads from here,
 * /account/orders/[id] looks the order up by id, cancel action mutates it.
 *
 * When the real order service lands, replace these three functions with API
 * calls — the component layer doesn't need to change.
 */

const ORDERS_KEY = "dbf.orders.v1";

export function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Order[];
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
    /* ignore — quota exceeded or storage disabled */
  }
}

export function addOrder(order: Order) {
  const next = [order, ...loadOrders()];
  saveOrders(next);
}

export function getOrder(id: string): Order | undefined {
  return loadOrders().find((o) => o.id === id);
}

/**
 * Cancel-eligible per common e-commerce policy (reflecting the SOW's
 * order-timeline state machine): cancellation is allowed only while the order
 * is still "placed" or "confirmed" (before the piece is packed / shipped).
 * Delivered or shipped orders go through the return flow instead.
 */
export function canCancel(status: OrderStatus): boolean {
  return status === "placed" || status === "confirmed";
}

export function cancelOrder(id: string): Order | undefined {
  const all = loadOrders();
  const idx = all.findIndex((o) => o.id === id);
  if (idx === -1) return undefined;
  const target = all[idx];
  if (!canCancel(target.status)) return target;

  const now = new Date().toISOString();
  const cancelled: Order = {
    ...target,
    status: "cancelled",
    timeline: [
      ...target.timeline,
      { at: now, status: "cancelled", note: "Cancelled by customer" },
    ],
  };
  const next = [...all];
  next[idx] = cancelled;
  saveOrders(next);
  return cancelled;
}
