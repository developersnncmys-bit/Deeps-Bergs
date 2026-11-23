import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/utils";

export function Price({
  amount,
  mrp,
  size = "md",
  className,
}: {
  amount: number;
  mrp?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const hasDiscount = mrp && mrp > amount;
  const sizes = {
    sm: { main: "text-sm", strike: "text-xs", off: "text-[11px]" },
    md: { main: "text-base", strike: "text-sm", off: "text-xs" },
    lg: { main: "text-xl", strike: "text-base", off: "text-xs" },
  }[size];

  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className={cn("font-medium text-ink", sizes.main)}>{formatINR(amount)}</span>
      {hasDiscount && (
        <>
          <span className={cn("text-ink-subtle line-through", sizes.strike)}>
            {formatINR(mrp!)}
          </span>
          <span className={cn("font-semibold text-success", sizes.off)}>
            {Math.round((1 - amount / mrp!) * 100)}% off
          </span>
        </>
      )}
    </span>
  );
}
