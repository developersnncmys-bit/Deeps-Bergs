import { products, categories } from "@/lib/mock-data";
import { NewArrivalsCatalog } from "@/components/shop/NewArrivalsCatalog";

export default function NewArrivalsPage() {
  // Everything tagged "New" — spans Wedding, Contemporary, Activewear.
  const items = products.filter((p) => p.tags?.includes("New"));
  return <NewArrivalsCatalog items={items} categories={categories} />;
}
