import { Outlet, useLocation } from "react-router-dom";

import { BrandMark } from "@/components/brand-mark";
import { useScrollReset } from "@/lib/use-scroll-reset";

export function AppShell() {
  const { pathname } = useLocation();
  useScrollReset(pathname);

  return (
    <div className="min-h-svh bg-canvas-soft md:px-8 md:py-8">
      <div className="mx-auto flex min-h-svh w-full max-w-phone flex-col bg-canvas md:min-h-[calc(100svh-4rem)] md:max-w-flow md:rounded-lg md:border md:border-primary-subtle">
        <header className="safe-top flex min-h-[5rem] items-center justify-between border-b border-primary-subtle px-6 pb-4">
          <BrandMark />
          <span className="rounded-full bg-positive-subtle px-3 py-1 text-caption font-semibold text-positive">
            Secure
          </span>
        </header>

        <main className="flex min-w-0 flex-1 flex-col">
          <Outlet />
        </main>

        <footer className="safe-bottom px-6 pt-4 text-center text-caption text-mute">
          Your information stays in your control.
        </footer>
      </div>
    </div>
  );
}
