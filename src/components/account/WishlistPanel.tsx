"use client";

import Image from "next/image";
import Link from "next/link";
import { TbHeart, TbShoppingBag, TbTrash } from "react-icons/tb";
import type { Product } from "@/lib/types";
import { useWishlist } from "@/lib/wishlist/WishlistContext";
import { useCart } from "@/lib/cart/CartContext";
import { formatINR } from "@/lib/utils";

export function WishlistPanel({ allProducts }: { allProducts: Product[] }) {
  const { ids, remove } = useWishlist();
  const { addItem, openDrawer } = useCart();

  const byId = new Map(allProducts.map((p) => [p.id, p]));
  const items = ids
    .map((id) => byId.get(id))
    .filter((p): p is Product => Boolean(p));

  return (
    <div>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">Wishlist</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Pieces you&apos;ve saved. Synced across the devices you&apos;re
            signed in on.
          </p>
        </div>
        {items.length > 0 && (
          <p className="text-xs text-ink-muted">
            {items.length} {items.length === 1 ? "piece" : "pieces"}
          </p>
        )}
      </header>

      {items.length === 0 ? (
        <div className="border border-dashed border-line-strong p-10 text-center">
          <TbHeart size={32} className="mx-auto text-ink-muted" />
          <p className="mt-3 font-serif text-xl text-ink">
            Your wishlist is empty
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Tap the heart on any piece to save it here for later.
          </p>
          <Link
            href="/shop"
            className="mt-5 inline-flex bg-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#3a3a3a]"
          >
            Browse the Collection
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <li key={p.id}>
              <WishlistCard
                product={p}
                onRemove={() => remove(p.id)}
                onAdd={() => {
                  const size = p.variants.find((v) => v.inStock)?.size ?? "Free";
                  addItem({
                    productId: p.id,
                    size,
                    quantity: 1,
                    mode: p.mode === "rent" ? "rent" : "buy",
                    rentalDuration:
                      p.mode === "rent"
                        ? ((p.rentalPricing?.[0]?.durationDays ?? 3) as 3 | 5 | 7)
                        : undefined,
                  });
                  openDrawer();
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function WishlistCard({
  product,
  onRemove,
  onAdd,
}: {
  product: Product;
  onRemove: () => void;
  onAdd: () => void;
}) {
  const minRent = product.rentalPricing?.[0]?.price;
  const hasDiscount =
    product.mrp && product.price && product.mrp > product.price;

  return (
    <div className="group flex flex-col gap-3">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-surface">
        <Link href={`/p/${product.slug}`} className="absolute inset-0">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 23vw, (min-width: 640px) 32vw, 48vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </Link>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove from wishlist"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-ink shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-brand"
        >
          <TbTrash size={16} />
        </button>
      </div>

      <div className="flex flex-col">
        <Link href={`/p/${product.slug}`} className="flex flex-col">
          {product.brand && (
            <p className="text-sm font-semibold text-ink">{product.brand}</p>
          )}
          <h3 className="line-clamp-1 text-sm text-ink group-hover:text-brand">
            {product.name}
          </h3>
          <div className="mt-1 flex items-baseline gap-2 text-sm">
            {product.price != null ? (
              <>
                <span className="font-semibold text-ink">
                  {formatINR(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-ink-subtle line-through">
                    {formatINR(product.mrp!)}
                  </span>
                )}
              </>
            ) : minRent != null ? (
              <span className="font-semibold text-ink">
                Rent from {formatINR(minRent)}
              </span>
            ) : null}
          </div>
        </Link>
        <button
          type="button"
          onClick={onAdd}
          className="mt-3 inline-flex items-center justify-center gap-2 border border-ink bg-white py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-white"
        >
          <TbShoppingBag size={14} />
          {product.mode === "rent" ? "Reserve" : "Add to Bag"}
        </button>
      </div>
    </div>
  );
}
