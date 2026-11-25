import { products, categories } from "@/lib/mock-data";
import { ShopAllCatalog } from "@/components/shop/ShopAllCatalog";

export default function ShopAllPage() {
  return <ShopAllCatalog items={products} categories={categories} />;
}
