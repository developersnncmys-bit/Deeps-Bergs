import { cn } from "@/lib/utils";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
} & Omit<React.HTMLAttributes<HTMLElement>, "className" | "children">;

export function Container({
  children,
  className,
  as: As = "div",
  ...rest
}: ContainerProps) {
  return (
    <As
      className={cn("mx-auto w-full max-w-[var(--container-page)] px-4 sm:px-6 lg:px-10", className)}
      {...rest}
    >
      {children}
    </As>
  );
}
