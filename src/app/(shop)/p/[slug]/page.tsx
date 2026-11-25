import { notFound } from "next/navigation";
import { categories, products } from "@/lib/mock-data";
import { ProductDetail } from "@/components/product/ProductDetail";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  // Prefer a top-level category for the breadcrumb + the "View all" link
  // on the similar-products carousel (skip sub-categories).
  const primaryCat =
    categories.find(
      (c) => product.categoryIds.includes(c.id) && !c.parentId,
    ) ??
    categories.find((c) => product.categoryIds.includes(c.id)) ??
    null;

  // Similar products: strictly same-category — "View all" below the carousel
  // takes the user to the full category page for the rest.
  const similar = products
    .filter(
      (p) =>
        p.id !== product.id &&
        p.categoryIds.some((c) => product.categoryIds.includes(c)),
    )
    .slice(0, 12);

  return (
    <ProductDetail
      product={product}
      category={primaryCat}
      similar={similar}
    />
  );
}
