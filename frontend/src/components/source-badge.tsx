import { cn } from "@/lib/cn";

type SourceBadgeVariant = "verified" | "self-reported" | "inferred";

const variants: Record<SourceBadgeVariant, { label: string; icon: string; className: string }> = {
  verified: { label: "Verified", icon: "✓", className: "bg-positive-subtle text-positive" },
  "self-reported": { label: "Self-reported", icon: "◇", className: "bg-primary-subtle text-primary" },
  inferred: { label: "Inferred", icon: "✦", className: "bg-accent-subtle text-accent-darker" },
};

export interface SourceBadgeProps {
  variant: SourceBadgeVariant;
  label?: string;
}

export function SourceBadge({ variant, label }: SourceBadgeProps) {
  const style = variants[variant];

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-caption font-semibold", style.className)}>
      <span aria-hidden="true">{style.icon}</span>
      {label ?? style.label}
    </span>
  );
}
