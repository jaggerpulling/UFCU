import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { routePaths } from "@/app/routes";
import { Button, SourceBadge } from "@/components";
import { MockPassportProvider } from "@/features/passport/mock-passport-provider";
import type { PassportIdentity, PassportScanProgress } from "@/features/passport/passport-provider";
import { PassportVisual } from "@/features/passport/passport-visual";
import { savePassportResult } from "@/features/profile/member-profile";
import { useScrollReset } from "@/lib/use-scroll-reset";

type ViewState = "ready" | "scanning" | "complete" | "error";

const passportProvider = new MockPassportProvider();

export function PassportPage() {
  const navigate = useNavigate();
  const abortController = useRef<AbortController | null>(null);
  const [viewState, setViewState] = useState<ViewState>("ready");
  const [progress, setProgress] = useState<PassportScanProgress | null>(null);
  const [identity, setIdentity] = useState<PassportIdentity | null>(null);
  useScrollReset(viewState);

  useEffect(() => () => abortController.current?.abort(), []);

  async function startScan() {
    abortController.current?.abort();
    const controller = new AbortController();
    abortController.current = controller;
    setIdentity(null);
    setProgress(null);
    setViewState("scanning");

    try {
      const result = await passportProvider.scan({ signal: controller.signal, onProgress: setProgress });
      savePassportResult(result);
      setIdentity(result);
      setViewState("complete");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setViewState("error");
    }
  }

  if (viewState === "complete" && identity) {
    return <IdentityEstablished identity={identity} onContinue={() => navigate(routePaths.liveness)} />;
  }

  if (viewState === "scanning") {
    return (
      <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
        <div className="flex flex-1 flex-col text-center">
          <p className="text-caption font-semibold uppercase tracking-[0.16em] text-mute">Identity · Step 1</p>
          <h1 className="mt-3 font-display text-display-md text-primary">Scanning your passport</h1>
          <p className="mx-auto mt-3 max-w-[20rem] text-body-md text-body">Keep your passport still and close to your phone.</p>

          <div className="my-8">
            <PassportVisual scanning />
          </div>

          <div className="mt-auto rounded-lg bg-canvas-soft p-5 text-left" aria-live="polite">
            <div className="flex items-center gap-3">
              <span className="relative flex size-3">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-40" />
                <span className="relative inline-flex size-3 rounded-full bg-accent" />
              </span>
              <p className="font-semibold text-primary">{progress?.message ?? "Preparing secure scan"}</p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-primary-subtle">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
                style={{ width: `${progress?.progress ?? 5}%` }}
              />
            </div>
            <p className="mt-3 text-caption text-mute">Demo scan · No passport data leaves this device</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <div className="flex-1">
        <p className="text-caption font-semibold uppercase tracking-[0.16em] text-mute">Identity · Step 1</p>
        <h1 className="mt-3 font-display text-display-md text-primary">Start with your passport</h1>
        <p className="mt-3 text-body-md text-body">
          Your passport securely establishes your identity so you don’t have to enter the same information manually.
        </p>

        <div className="my-7 rounded-lg border border-primary-subtle bg-canvas-soft px-4 py-3">
          <div className="flex gap-3">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-positive-subtle text-positive">
              <LockIcon />
            </span>
            <div>
              <p className="text-body-sm font-semibold text-primary">Private by design</p>
              <p className="mt-1 text-body-sm text-body">We’ll show you exactly what was read before you continue.</p>
            </div>
          </div>
        </div>

        <div className="mb-7 rounded-lg border border-secondary bg-secondary-subtle p-4 text-body-sm text-primary">
          <p className="font-semibold">How your passport details help</p>
          <p className="mt-1 text-body">
            We can use these details to verify your U.S. entry record, so you don’t need to upload other documents.
          </p>
        </div>

        <PassportVisual />
        {viewState === "error" ? (
          <p className="mt-4 rounded-md bg-negative-subtle p-3 text-body-sm text-negative" role="alert">
            The demo scan couldn’t finish. Please try again.
          </p>
        ) : null}
      </div>

      <div className="sticky bottom-0 mt-6 bg-canvas pb-2 pt-4">
        <Button variant="scan" fullWidth onClick={startScan}>
          <ScanIcon />
          {viewState === "error" ? "Try scan again" : "Scan passport"}
        </Button>
        <p className="mt-3 text-center text-caption text-mute">This prototype uses secure synthetic identity data.</p>
      </div>
    </section>
  );
}

function IdentityEstablished({ identity, onContinue }: { identity: PassportIdentity; onContinue: () => void }) {
  const verifiedFields = [
    ["Name", identity.fullName],
    ["Date of birth", formatDate(identity.dateOfBirth)],
    ["Nationality", identity.nationality],
    ["Document", `${identity.documentType} · ${identity.passportNumber}`],
  ];

  return (
    <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <div className="flex-1">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.16em] text-secondary-darker">Scan complete</p>
            <h1 className="mt-2 font-display text-display-md text-primary">Identity established</h1>
          </div>
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-secondary text-white verified-pop" aria-hidden="true">
            <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="m6 12 4 4 8-9" />
            </svg>
          </div>
        </div>
        <p className="mt-3 text-body-md text-body">We found the identity details needed to keep your application moving.</p>

        <div className="mt-7 overflow-hidden rounded-lg border-2 border-secondary bg-canvas confirmed-card">
          <div className="flex items-center gap-4 border-b border-primary-subtle bg-canvas-soft p-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-md bg-primary font-data text-data-md text-white">
              {identity.initials}
            </div>
            <div className="min-w-0">
              <p className="truncate font-data text-data-md text-primary">{identity.fullName}</p>
              <div className="mt-1.5">
                <SourceBadge variant="verified" label="Passport verified" />
              </div>
            </div>
          </div>

          <dl className="divide-y divide-primary-subtle px-4">
            {verifiedFields.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[7rem_1fr] gap-3 py-3.5">
                <dt className="text-body-sm text-mute">{label}</dt>
                <dd className="text-right font-data text-data-sm text-primary">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="mt-4 text-center text-caption text-mute">Synthetic demo identity · No real passport was accessed</p>
      </div>

      <div className="sticky bottom-0 mt-7 bg-canvas pb-2 pt-4">
        <Button fullWidth onClick={onContinue}>
          Continue
          <span aria-hidden="true">→</span>
        </Button>
      </div>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function LockIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
      <rect x="8" y="8" width="8" height="8" rx="1" />
    </svg>
  );
}
