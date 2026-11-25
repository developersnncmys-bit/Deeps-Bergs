export interface Coupon {
  code: string;
  label: string;
  // Flat percent off, capped at maxOff.
  percentOff: number;
  maxOff: number;
  // Only apply when subtotal meets this threshold.
  minSubtotal?: number;
}

export const coupons: Coupon[] = [
  {
    code: "CELEBRATION7",
    label: "Flat 7% off, up to ₹1,000",
    percentOff: 7,
    maxOff: 1000,
  },
  {
    code: "NEW15",
    label: "15% off for new customers, up to ₹2,500",
    percentOff: 15,
    maxOff: 2500,
    minSubtotal: 5000,
  },
  {
    code: "LUXE5",
    label: "Flat 5% off on luxe orders above ₹10,000",
    percentOff: 5,
    maxOff: 1500,
    minSubtotal: 10000,
  },
];

export function calculateDiscount(coupon: Coupon, subtotal: number): number {
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) return 0;
  const raw = Math.round((subtotal * coupon.percentOff) / 100);
  return Math.min(raw, coupon.maxOff);
}
