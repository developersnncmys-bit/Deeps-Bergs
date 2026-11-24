import { notFound } from "next/navigation";
import { categories, products } from "@/lib/mock-data";
import { ShopCategory } from "@/components/shop/ShopCategory";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  // Sibling categories (same section — e.g. all Wedding categories together)
  const siblings = categories.filter((c) => c.sectionId === category.sectionId);

  // Products assigned to this category that can be bought
  const items = products.filter(
    (p) =>
      p.categoryIds.includes(category.id) &&
      (p.mode === "buy" || p.mode === "both"),
  );

  return (
    <ShopCategory category={category} items={items} siblings={siblings} />
  );
}
