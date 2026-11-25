// Jewellery add-ons surfaced inside the cart drawer under
// "The Perfect Finishing Touch — Jewellery at 25% OFF".
// Standalone from the main products list — these are complementary items
// that should always be available regardless of category.

export interface Addon {
  id: string;
  slug: string;
  name: string;
  image: string;
  mrp: number;
  price: number; // discounted price
}

export const jewelryAddons: Addon[] = [
  {
    id: "a-1",
    slug: "white-stone-floral-cluster-studs",
    name: "White Stone Floral Cluster Studs",
    image: "https://picsum.photos/seed/addon-1/500/600",
    mrp: 2500,
    price: 1875,
  },
  {
    id: "a-2",
    slug: "silver-tone-oval-stone-solitaire-ring",
    name: "Silver Tone Oval Stone Ring",
    image: "https://picsum.photos/seed/addon-2/500/600",
    mrp: 2000,
    price: 1500,
  },
  {
    id: "a-3",
    slug: "aqua-enamel-zirconia-bangle",
    name: "Aqua Enamel Zirconia Bangle",
    image: "https://picsum.photos/seed/addon-3/500/600",
    mrp: 2700,
    price: 2025,
  },
  {
    id: "a-4",
    slug: "pearl-drop-jhumkas",
    name: "Pearl Drop Jhumkas",
    image: "https://picsum.photos/seed/addon-4/500/600",
    mrp: 3200,
    price: 2400,
  },
  {
    id: "a-5",
    slug: "gold-tone-temple-choker",
    name: "Gold Tone Temple Choker",
    image: "https://picsum.photos/seed/addon-5/500/600",
    mrp: 6000,
    price: 4500,
  },
  {
    id: "a-6",
    slug: "emerald-bead-maang-tikka",
    name: "Emerald Bead Maang Tikka",
    image: "https://picsum.photos/seed/addon-6/500/600",
    mrp: 3400,
    price: 2550,
  },
];
