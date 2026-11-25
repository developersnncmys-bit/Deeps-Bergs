// SOW R04 — Loyalty & Referral Programme (CUSTOMER surface)
//
// - Points on purchases and rentals; points ledger
// - Redeem at checkout on eligible orders
// - Referral link and code; reward on the referred customer's first
//   completed order

export type LedgerKind =
  | "earned-purchase"
  | "earned-rental"
  | "earned-referral"
  | "redeemed"
  | "reversed";

export interface LedgerEntry {
  id: string;
  at: string; // ISO
  kind: LedgerKind;
  points: number; // positive for earn, negative for redeem
  note: string;
  orderId?: string;
}

const DAY = 24 * 60 * 60 * 1000;
const iso = (d: number) => new Date(d).toISOString();
const t = Date.now();

export const loyaltyLedger: LedgerEntry[] = [
  {
    id: "lp-1",
    at: iso(t - 7 * DAY),
    kind: "earned-purchase",
    points: 324,
    note: "Blush Organza Saree + Pastel Chikankari Kurta Set",
    orderId: "DBF24010834",
  },
  {
    id: "lp-2",
    at: iso(t - 6 * DAY),
    kind: "earned-rental",
    points: 90,
    note: "Midnight Zardozi Sherwani (5-day rental)",
    orderId: "DBF24011622",
  },
  {
    id: "lp-3",
    at: iso(t - 4 * DAY),
    kind: "earned-referral",
    points: 500,
    note: "Reference signup — Riya K completed first order",
  },
  {
    id: "lp-4",
    at: iso(t - 1 * DAY),
    kind: "earned-purchase",
    points: 1562,
    note: "Rosewood Bridal Lehenga",
    orderId: "DBF24011701",
  },
];

// A single rupee per point for display simplicity (admin-configurable later).
export const POINT_VALUE_INR = 1;

// Cap how many points can be redeemed against a given subtotal (e.g. 10%).
export const MAX_REDEEM_PERCENT = 10;

export function pointsBalance(): number {
  return loyaltyLedger.reduce((sum, e) => sum + e.points, 0);
}

export function maxRedeemable(
  balance: number,
  subtotal: number,
): number {
  const cap = Math.floor((subtotal * MAX_REDEEM_PERCENT) / 100 / POINT_VALUE_INR);
  return Math.max(0, Math.min(balance, cap));
}

export const referral = {
  code: "DIVYA500",
  url: "https://deepsandbergs.com/r/DIVYA500",
  rewardPoints: 500,
  referredRewardInr: 500,
};
