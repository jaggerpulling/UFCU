import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "scan";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-secondary text-white hover:bg-secondary-lighter active:bg-secondary-darker",
  secondary: "border border-primary bg-canvas text-primary hover:bg-canvas-soft active:bg-primary-subtle",
  scan: "min-h-scan bg-primary text-white hover:bg-primary-darker active:bg-primary-darkest",
};

export function Button({ className, variant = "primary", fullWidth = false, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-touch items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}
