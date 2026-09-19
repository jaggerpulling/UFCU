import type { ReactNode } from "react";

export interface ScreenProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

export function Screen({ eyebrow, title, description, children, footer }: ScreenProps) {
  return (
    <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <div className="flex-1">
        {eyebrow ? <p className="mb-3 text-caption font-semibold uppercase tracking-[0.16em] text-mute">{eyebrow}</p> : null}
        <h1 className="font-display text-display-md text-primary">{title}</h1>
        {description ? <p className="mt-3 max-w-prose text-body-md text-body">{description}</p> : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
      {footer ? <div className="sticky bottom-0 mt-8 bg-canvas pb-2 pt-4">{footer}</div> : null}
    </section>
  );
}
