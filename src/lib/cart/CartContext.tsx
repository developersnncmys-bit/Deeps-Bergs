"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartMode = "buy" | "rent";

export interface CartItem {
  productId: string;
  size: string;
  quantity: number;
  mode: CartMode;
  // Rent-specific metadata; buy ignores these.
  rentalDuration?: 3 | 5 | 7;
  rentalStartISO?: string;
}

interface CartState {
  items: CartItem[];
  appliedCoupon: string | null;
  pointsRedeemed: number; // SOW R04 — loyalty points applied to this cart
  drawerOpen: boolean;
}

interface CartActions {
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, mode: CartMode) => void;
  updateQty: (
    productId: string,
    size: string,
    mode: CartMode,
    qty: number,
  ) => void;
  clearCart: () => void;
  applyCoupon: (code: string | null) => void;
  setPointsRedeemed: (points: number) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

type CartContextValue = CartState & CartActions;

const STORAGE_KEY = "dbf-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [pointsRedeemed, setPointsRedeemedState] = useState<number>(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          items?: CartItem[];
          appliedCoupon?: string | null;
          pointsRedeemed?: number;
        };
        if (Array.isArray(parsed.items)) setItems(parsed.items);
        if (parsed.appliedCoupon !== undefined)
          setAppliedCoupon(parsed.appliedCoupon);
        if (typeof parsed.pointsRedeemed === "number")
          setPointsRedeemedState(parsed.pointsRedeemed);
      }
    } catch {
      // Corrupt localStorage — ignore and start fresh.
    }
    setHydrated(true);
  }, []);

  // Persist on change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ items, appliedCoupon, pointsRedeemed }),
      );
    } catch {
      // Storage quota or private mode — silently ignore.
    }
  }, [items, appliedCoupon, pointsRedeemed, hydrated]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const match = prev.find(
        (p) =>
          p.productId === item.productId &&
          p.size === item.size &&
          p.mode === item.mode,
      );
      if (match) {
        return prev.map((p) =>
          p === match ? { ...p, quantity: p.quantity + item.quantity } : p,
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback(
    (productId: string, size: string, mode: CartMode) => {
      setItems((prev) =>
        prev.filter(
          (p) =>
            !(p.productId === productId && p.size === size && p.mode === mode),
        ),
      );
    },
    [],
  );

  const updateQty = useCallback(
    (productId: string, size: string, mode: CartMode, qty: number) => {
      setItems((prev) =>
        prev
          .map((p) =>
            p.productId === productId && p.size === size && p.mode === mode
              ? { ...p, quantity: Math.max(1, qty) }
              : p,
          )
          .filter((p) => p.quantity > 0),
      );
    },
    [],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
    setPointsRedeemedState(0);
  }, []);

  const applyCoupon = useCallback((code: string | null) => {
    setAppliedCoupon(code);
  }, []);

  const setPointsRedeemed = useCallback((points: number) => {
    setPointsRedeemedState(Math.max(0, Math.floor(points)));
  }, []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      appliedCoupon,
      pointsRedeemed,
      drawerOpen,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      applyCoupon,
      setPointsRedeemed,
      openDrawer,
      closeDrawer,
    }),
    [
      items,
      appliedCoupon,
      pointsRedeemed,
      drawerOpen,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      applyCoupon,
      setPointsRedeemed,
      openDrawer,
      closeDrawer,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
