import type { Category } from "@/lib/types";

export const categories: Category[] = [
  // Wedding
  { id: "lehenga", sectionId: "wedding", name: "Lehengas", slug: "lehengas", image: "/images/category/Lehengas.png" },
  { id: "bridal-saree", sectionId: "wedding", name: "Bridal Sarees", slug: "bridal-sarees", image: "/images/category/bridal.png" },
  { id: "sherwani", sectionId: "wedding", name: "Sherwanis", slug: "sherwanis", image: "/images/category/sherwanis.png" },
  { id: "groomswear", sectionId: "wedding", name: "Groomswear", slug: "groomswear", image: "/images/category/groomswear.png" },
  { id: "accessories-wedding", sectionId: "wedding", name: "Accessories", slug: "accessories" },

  // Contemporary
  { id: "sarees", sectionId: "contemporary", name: "Sarees", slug: "sarees", image: "/images/category/sarees.png" },
  { id: "kurtas", sectionId: "contemporary", name: "Kurtas & Sets", slug: "kurtas", image: "/images/category/kurtas-sets.png" },
  { id: "co-ords", sectionId: "contemporary", name: "Co-ords", slug: "co-ords", image: "/images/category/co-ord.png" },
  { id: "dresses", sectionId: "contemporary", name: "Dresses", slug: "dresses" },
  { id: "shirts", sectionId: "contemporary", name: "Shirts", slug: "shirts" },

  // Activewear
  { id: "tops", sectionId: "activewear", name: "Tops", slug: "tops" },
  { id: "bottoms", sectionId: "activewear", name: "Bottoms", slug: "bottoms" },
  { id: "lounge", sectionId: "activewear", name: "Lounge", slug: "lounge" },
  { id: "outerwear", sectionId: "activewear", name: "Outerwear", slug: "outerwear" },
];
