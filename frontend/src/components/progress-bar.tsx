export interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label = "Onboarding progress" }: ProgressBarProps) {
  const safeTotal = Math.max(total, 1);
  const safeCurrent = Math.min(Math.max(current, 0), safeTotal);
  const percent = (safeCurrent / safeTotal) * 100;

  return (
    <div aria-label={label} aria-valuemin={0} aria-valuemax={safeTotal} aria-valuenow={safeCurrent} role="progressbar">
      <div className="mb-2 flex items-center justify-between text-caption text-mute">
        <span>{label}</span>
        <span>{safeCurrent} of {safeTotal}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-primary-subtle">
        <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
