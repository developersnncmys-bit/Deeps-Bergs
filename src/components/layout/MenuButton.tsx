"use client";

import { useMenu } from "./menu-context";
import { cn } from "@/lib/utils";

export function MenuButton({
  children,
  className,
  ariaLabel = "Open menu",
}: {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const { open } = useMenu();
  return (
    <button
      type="button"
      onClick={open}
      aria-label={ariaLabel}
      className={cn("inline-flex items-center gap-2", className)}
    >
      {children}
    </button>
  );
}
