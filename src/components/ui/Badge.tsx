import { cn } from "@/lib/utils";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-[#efeae2] text-ink",
  brand: "bg-brand-tint text-brand-dark",
  success: "bg-[#e3f0e5] text-success",
  warning: "bg-[#fbe8d2] text-warning",
  danger: "bg-[#f6dcdc] text-danger",
  info: "bg-[#dce7f3] text-info",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
