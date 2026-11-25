"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/lib/types";
import { OrdersList } from "@/components/account/OrdersList";
import { loadOrders } from "@/lib/orders/storage";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(loadOrders());
  }, []);

  return <OrdersList orders={orders} />;
}
