"use client";

import Image from "next/image";
import Link from "next/link";
import type { Collection, Product } from "@/lib/types";
import { ShopCard } from "@/components/shop/ShopCategory";

export function CollectionPage({
  collection,
  items,
}: {
  collection: Collection;
  items: Product[];
}) {
  return (
    <div className="bg-white pb-20">
      {/* Breadcrumb */}
      <nav className="mx-auto max-w-[1500px] px-4 pt-8 text-[11px] uppercase tracking-[0.2em] text-ink-muted sm:px-6 lg:px-10">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span className="mx-2 text-ink-subtle">/</span>
        <Link href="/shop" className="hover:text-ink">
          Shop
        </Link>
        <span className="mx-2 text-ink-subtle">/</span>
        <span className="text-ink">{collection.name}</span>
      </nav>

      {/* Editorial hero */}
      <div className="mx-auto mt-6 max-w-[1500px] px-4 sm:px-6 lg:px-10">
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl bg-surface">
          {collection.heroImage && (
            <Image
              src={collection.heroImage}
              alt={collection.name}
              fill
              sizes="(min-width: 1500px) 1500px, 100vw"
              className="object-cover"
              priority
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-white sm:p-12 lg:p-16">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/80">
              The Collection
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl">
              {collection.name}
            </h1>
            {collection.tagline && (
              <p className="mt-3 max-w-xl text-sm text-white/85 sm:text-base">
                {collection.tagline}
              </p>
            )}
            <p className="mt-4 text-xs text-white/70">
              {items.length} {items.length === 1 ? "piece" : "pieces"}
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto mt-10 max-w-[1500px] px-4 sm:px-6 lg:px-10">
        {items.length === 0 ? (
          <p className="py-24 text-center text-sm text-ink-muted">
            This collection is being curated.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
            {items.map((p) => (
              <ShopCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
