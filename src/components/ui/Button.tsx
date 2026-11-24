import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-bold transition-colors rounded-[var(--radius-md)] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-bg hover:bg-[#2a2a2a]",
  secondary: "bg-brand text-white hover:bg-brand-dark",
  ghost: "bg-transparent text-ink hover:bg-[#f0ebe4]",
  outline: "border border-line-strong text-ink hover:bg-surface",
  danger: "bg-danger text-white hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-6 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

// Every CTA renders in Raleway by default. Callers can still pass a `style`
// override and it will win because we spread `style` last.
const ctaFont = { fontFamily: "var(--font-raleway)" } as const;

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  style,
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      style={{ ...ctaFont, ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  style,
  ...rest
}: CommonProps & React.ComponentProps<typeof Link>) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      style={{ ...ctaFont, ...style }}
      {...rest}
    >
      {children}
    </Link>
  );
}
