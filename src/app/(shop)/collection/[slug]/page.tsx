import { notFound } from "next/navigation";
import { collections, products } from "@/lib/mock-data";
import { CollectionPage } from "@/components/shop/CollectionPage";

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export default async function CollectionRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = collections.find((c) => c.slug === slug);
  if (!collection) notFound();

  // Preserve the curator's order
  const byId = new Map(products.map((p) => [p.id, p]));
  const items = collection.productIds
    .map((id) => byId.get(id))
    .filter((p): p is (typeof products)[number] => Boolean(p));

  return <CollectionPage collection={collection} items={items} />;
}
