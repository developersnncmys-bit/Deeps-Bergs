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

  // Hierarchy: a category is either top-level (no parentId) or a sub-category.
  // Siblings are top-level categories in the same section, so the pill row
  // always shows the parents and never mixes sub-cats across siblings.
  const siblings = categories.filter(
    (c) => c.sectionId === category.sectionId && !c.parentId,
  );

  // Sub-categories to surface:
  //   - viewing a parent  → its own children
  //   - viewing a child   → its parent's children (so the user can jump around)
  const parent = category.parentId
    ? (categories.find((c) => c.id === category.parentId) ?? null)
    : null;
  const subCatParentId = parent?.id ?? category.id;
  const subCategories = categories.filter((c) => c.parentId === subCatParentId);

  // Products assigned to this category — regardless of mode.
  const items = products.filter((p) => p.categoryIds.includes(category.id));

  return (
    <ShopCategory
      category={category}
      items={items}
      siblings={siblings}
      subCategories={subCategories}
      parent={parent}
    />
  );
}
