"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Order } from "@/lib/types";
import { OrderDetail } from "@/components/account/OrderDetail";
import { cancelOrder, getOrder } from "@/lib/orders/storage";

export function OrderDetailClient({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    setOrder(getOrder(id) ?? null);
  }, [id]);

  const handleCancel = () => {
    const updated = cancelOrder(id);
    if (updated) setOrder(updated);
  };

  if (order === undefined) {
    return (
      <div className="px-6 py-16">
        <div className="h-6 w-40 animate-pulse rounded bg-line" />
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="font-serif text-2xl text-ink">Order not found</p>
        <p className="mt-2 text-sm text-ink-muted">
          It may have been removed, or the link is incorrect.
        </p>
        <Link
          href="/account/orders"
          className="mt-5 inline-flex bg-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white hover:bg-[#3a3a3a]"
        >
          Back to orders
        </Link>
      </div>
    );
  }

  return <OrderDetail order={order} onCancel={handleCancel} />;
}
