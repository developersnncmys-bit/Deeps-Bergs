// Shared domain types for the DBF website.
// These mirror the backend contracts loosely — when the real API arrives,
// re-export the generated types from here so the rest of the app doesn't shift.

export type SectionId = "wedding" | "contemporary" | "activewear";

export interface Section {
  id: SectionId;
  name: string;
  tagline: string;
  heroImage?: string;
}

export interface Category {
  id: string;
  sectionId: SectionId;
  name: string;
  slug: string;
  parentId?: string;
  image?: string;
}

export type ProductMode = "buy" | "rent" | "both";

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex?: string;
  sku: string;
  inStock: boolean;
  stockCount?: number;
}

export interface RentalPiece {
  id: string;
  productId: string;
  state: "ready" | "returned" | "inspection" | "cleaning" | "repair";
}

export interface RentalPricing {
  durationDays: number;
  price: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  sectionId: SectionId;
  categoryIds: string[];
  mode: ProductMode;
  images: string[];
  description: string;
  fabric?: string;
  care?: string;
  occasion?: string[];
  variants: ProductVariant[];
  // Purchase
  price?: number;
  mrp?: number;
  // Rental
  rentalPricing?: RentalPricing[];
  rentalDeposit?: number;
  bufferDays?: number;
  // Meta
  tags?: string[];
  rating?: number;
  reviewCount?: number;
}

// Curated cross-category edits (SOW C01 — "collections").
// A collection is a hand-picked list of products that may span sections and
// categories (e.g. "Festive Edit 2026", "Modern Bride"). Distinct from a Look,
// which represents a single styled outfit.
export interface Collection {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  heroImage?: string;
  productIds: string[];
}

export interface Look {
  id: string;
  slug: string;
  name: string;
  coverImage: string;
  sectionId: SectionId;
  productIds: string[];
  tags?: string[];
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "returned"
  | "cancelled";

export interface OrderEvent {
  at: string;
  status: OrderStatus;
  note?: string;
}

export interface OrderLine {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  qty: number;
  price: number;
  kind: "buy" | "rent";
  rental?: {
    startDate: string;
    durationDays: number;
    deposit: number;
    returnDate: string;
  };
}

export interface Order {
  id: string;
  placedAt: string;
  status: OrderStatus;
  lines: OrderLine[];
  address: Address;
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  timeline: OrderEvent[];
  tracking?: { courier: string; awb: string; url?: string };
}

export type MembershipTier = "silver" | "gold" | "platinum";

export interface Membership {
  tier: MembershipTier;
  cycle: "monthly" | "annual";
  renewsAt: string;
  tryOnCreditsLeft: number;
  benefits: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
  membership?: Membership;
  loyaltyPoints: number;
}

export interface Creator {
  id: string;
  handle: string;
  name: string;
  bio: string;
  avatar: string;
  cover: string;
  video?: string;
  productIds: string[];
}
