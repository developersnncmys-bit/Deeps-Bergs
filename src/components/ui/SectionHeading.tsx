import Link from "next/link";
import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  eyebrow,
  description,
  action,
  align = "left",
  className,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  action?: { label: string; href: string };
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "text-center sm:flex-col sm:items-center",
        className
      )}
    >
      <div className={cn("flex flex-col gap-2", align === "center" && "items-center")}>
        {eyebrow && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            {eyebrow}
          </span>
        )}
        <h2 className="text-2xl sm:text-3xl text-ink">{title}</h2>
        {description && (
          <p className="max-w-xl text-ink-muted">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="text-sm font-medium text-ink underline-offset-4 hover:underline"
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}
