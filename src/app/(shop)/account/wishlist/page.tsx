import { products } from "@/lib/mock-data";
import { WishlistPanel } from "@/components/account/WishlistPanel";

export default function WishlistPage() {
  return <WishlistPanel allProducts={products} />;
}
