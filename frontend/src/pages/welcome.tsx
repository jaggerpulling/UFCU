import { useNavigate } from "react-router-dom";

import { Button } from "@/components";
import { routePaths } from "@/app/routes";

export function WelcomePage() {
  const navigate = useNavigate();

  return (
    <section className="flex flex-1 flex-col overflow-hidden px-6 pb-6 pt-7">
      <div className="flex flex-1 flex-col">
        <p className="text-caption font-semibold uppercase tracking-[0.16em] text-mute">A simpler way to join UFCU</p>
        <h1 className="mt-4 max-w-[20rem] font-display text-[2.65rem] font-bold leading-[1.05] tracking-[-0.02em] text-primary">
          Your financial identity should move with you.
        </h1>
        <p className="mt-5 max-w-[21rem] text-body-lg text-body">
          Get started with UFCU without entering information we can securely verify.
        </p>

        <div className="relative my-5 flex min-h-52 flex-1 items-center justify-center" aria-hidden="true">
          <div className="absolute size-44 rounded-full bg-secondary-subtle" />
          <div className="absolute left-[calc(50%-7.25rem)] top-1/2 size-14 -translate-y-1/2 rounded-full border border-primary-subtle bg-white" />
          <div className="relative h-40 w-56 rotate-[-4deg] rounded-lg bg-primary p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="text-[0.625rem] font-semibold uppercase tracking-[0.2em]">Passport</span>
              <span className="grid size-8 place-items-center rounded-full border border-white/35 text-sm">◎</span>
            </div>
            <div className="absolute bottom-5 left-5">
              <span className="block h-1.5 w-24 rounded-full bg-white/70" />
              <span className="mt-2 block h-1.5 w-16 rounded-full bg-white/35" />
            </div>
          </div>
          <div className="absolute bottom-2 right-[calc(50%-8.5rem)] grid size-16 place-items-center rounded-full border-4 border-white bg-secondary text-white">
            <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="m6 12 4 4 8-9" />
            </svg>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-canvas pb-2 pt-4">
        <Button fullWidth onClick={() => navigate(routePaths.passport)}>
          Get started
          <span aria-hidden="true">→</span>
        </Button>
        <p className="mt-4 flex items-center justify-center gap-2 text-body-sm text-body">
          <svg className="size-4 text-positive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          You’re always in control of what you connect.
        </p>
      </div>
    </section>
  );
}
