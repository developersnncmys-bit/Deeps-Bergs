import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const minRental = product.rentalPricing?.[0];
  return (
    <Link
      href={`/p/${product.slug}`}
      className={cn("group relative block aspect-[4/5] overflow-hidden bg-surface", className)}
    >
      <Image
        src={product.images[0]}
        alt={product.name}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Badges — top-right so they don't collide with the hover overlay */}
      <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
        {product.mode === "rent" && <Badge tone="brand">Rent only</Badge>}
        {product.mode === "both" && <Badge tone="info">Buy or Rent</Badge>}
        {product.tags?.includes("Bestseller") && <Badge tone="warning">Bestseller</Badge>}
        {product.tags?.includes("New") && <Badge tone="success">New</Badge>}
      </div>

      {/* Hover overlay — brand / name / price at top-left */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-transparent" />
        <div className="absolute left-5 right-5 top-5 flex flex-col gap-1 text-white">
          {product.brand && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
              {product.brand}
            </p>
          )}
          <h3 className="font-sans text-lg leading-tight">{product.name}</h3>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
            {product.price != null && (
              <>
                <span className="font-medium">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <span className="text-xs text-white/60 line-through">
                    ₹{product.mrp.toLocaleString("en-IN")}
                  </span>
                )}
              </>
            )}
            {minRental && (
              <span className="text-xs text-white/85">
                {product.price != null ? "or " : ""}rent from ₹{minRental.price.toLocaleString("en-IN")}/{minRental.durationDays}d
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
