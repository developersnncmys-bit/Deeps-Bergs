import { Suspense } from "react";
import { products, categories } from "@/lib/mock-data";
import { RentCatalog } from "@/components/rent/RentCatalog";

export default function RentPage() {
  // Everything that can be rented — no occasion filter.
  const rentable = products.filter(
    (p) => p.mode === "rent" || p.mode === "both",
  );
  return (
    <Suspense fallback={null}>
      <RentCatalog products={rentable} categories={categories} />
    </Suspense>
  );
}
