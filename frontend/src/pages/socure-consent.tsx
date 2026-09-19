import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { routePaths } from "@/app/routes";
import { Button } from "@/components";
import {
  buildSocureVerificationRequest,
  socureSharedFields,
  socureVerificationProvider,
  type SocureVerificationResult,
} from "@/features/identity/socure-verification";
import { getPassportResult } from "@/features/profile/member-profile";
import { useScrollReset } from "@/lib/use-scroll-reset";

type ViewState = "consent" | "verifying" | "complete" | "not-verified" | "error";

export function SocureConsentPage() {
  const navigate = useNavigate();
  const abortController = useRef<AbortController | null>(null);
  const [identity] = useState(getPassportResult);
  const [viewState, setViewState] = useState<ViewState>("consent");
  const [result, setResult] = useState<SocureVerificationResult | null>(null);
  useScrollReset(viewState);

  useEffect(() => () => abortController.current?.abort(), []);

  if (!identity) return <Navigate to={routePaths.passport} replace />;

  async function allowAndContinue() {
    if (!identity) return;
    abortController.current?.abort();
    const controller = new AbortController();
    abortController.current = controller;
    setResult(null);
    setViewState("verifying");

    try {
      const verificationResult = await socureVerificationProvider.verifyIdentity(
        buildSocureVerificationRequest(identity),
        controller.signal,
      );
      setResult(verificationResult);
      setViewState(verificationResult.verified ? "complete" : "not-verified");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setViewState("error");
    }
  }

  if (viewState === "verifying") return <Verifying />;
  if (viewState === "complete" && result) {
    return (
      <VerificationComplete
        result={result}
        onContinue={() => navigate(routePaths.liveness)}
      />
    );
  }
  if (viewState === "not-verified") {
    return (
      <VerificationIssue
        onRetry={allowAndContinue}
        onContinue={() => navigate(routePaths.liveness)}
      />
    );
  }

  const fields = [
    ["Legal name", identity.fullName],
    ["Date of birth", formatDate(identity.dateOfBirth)],
    ["Passport number", identity.passportNumber],
    ["Nationality", identity.nationality],
  ];

  return (
    <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <div className="flex-1">
        <p className="text-caption font-semibold uppercase tracking-[0.16em] text-mute">
          Identity · Verification consent
        </p>
        <h1 className="mt-3 font-display text-display-md text-primary">Verify your information</h1>
        <p className="mt-3 text-body-md text-body">
          To continue, VERIFIED will securely share selected identity information with Socure, our identity verification provider.
        </p>

        <div className="mt-7 overflow-hidden rounded-lg border border-primary-subtle bg-canvas">
          <p className="bg-canvas-soft px-5 py-4 font-semibold text-primary">Information to be shared</p>
          <dl className="divide-y divide-primary-subtle px-5">
            {fields.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[7rem_1fr] gap-3 py-3.5">
                <dt className="text-body-sm text-mute">{label}</dt>
                <dd className="break-words text-right font-data text-data-sm text-primary">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <dl className="mt-5 space-y-3 rounded-lg bg-canvas-soft p-4 text-body-sm">
          <div>
            <dt className="font-semibold text-primary">Why</dt>
            <dd className="mt-1 text-body">Verify additional identity information required for onboarding</dd>
          </div>
          <div>
            <dt className="font-semibold text-primary">Shared with</dt>
            <dd className="mt-1 text-body">Socure</dd>
          </div>
          <div>
            <dt className="font-semibold text-primary">Not shared</dt>
            <dd className="mt-1 text-body">Financial history or school information unless separately authorized</dd>
          </div>
        </dl>

        <div className="mt-5 flex gap-3 rounded-md bg-positive-subtle p-4 text-body-sm text-primary">
          <LockIcon />
          <p>Nothing is sent until you select Allow &amp; Continue. This hackathon step uses an offline demo response.</p>
        </div>

        {viewState === "error" ? (
          <p className="mt-5 rounded-md bg-negative-subtle p-3 text-body-sm text-negative" role="alert">
            The demo verification couldn’t finish. No provider details or sensitive values were included in this message. Please try again.
          </p>
        ) : null}
      </div>

      <div className="sticky bottom-0 mt-7 bg-canvas pb-2 pt-4">
        <Button fullWidth onClick={allowAndContinue}>
          {viewState === "error" ? "Try Again" : "Allow & Continue"}
        </Button>
        <Button className="mt-3" variant="secondary" fullWidth onClick={() => navigate(routePaths.liveness)}>
          Not Now
        </Button>
      </div>
    </section>
  );
}

function Verifying() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center" aria-live="polite">
      <div className="relative grid size-24 place-items-center">
        <span className="absolute size-20 animate-ping rounded-full bg-secondary-subtle opacity-60" />
        <span className="relative grid size-16 place-items-center rounded-full bg-primary text-lg font-semibold text-white">SOC</span>
      </div>
      <h1 className="mt-7 font-display text-display-md text-primary">Verifying your information</h1>
      <p className="mt-3 max-w-xs text-body-md text-body">Sending only the four fields you approved through the VERIFIED backend.</p>
      <p className="mt-5 rounded-full bg-warning-subtle px-3 py-1.5 text-caption font-semibold text-warning">Demo verification</p>
    </section>
  );
}

function VerificationComplete({
  result,
  onContinue,
}: {
  result: SocureVerificationResult;
  onContinue: () => void;
}) {
  const labels = new Map(socureSharedFields.map((field) => [field.key, field.label]));
  return (
    <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <div className="flex-1">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.16em] text-secondary-darker">Verification complete</p>
            <h1 className="mt-2 font-display text-display-md text-primary">Information verified</h1>
          </div>
          <div className="verified-pop grid size-14 shrink-0 place-items-center rounded-full bg-secondary text-white" aria-hidden="true">
            <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m6 12 4 4 8-9" /></svg>
          </div>
        </div>

        <div className="confirmed-card mt-7 rounded-lg border-2 border-secondary p-5">
          <p className="font-semibold text-primary">The demo provider confirmed the consistency of the identity information you approved.</p>
          <ul className="mt-4 space-y-3">
            {result.verifiedInformation.map((field) => (
              <li key={field} className="flex items-start gap-3 text-body-sm text-primary">
                <span className="text-positive" aria-hidden="true">✓</span>
                {labels.get(field)}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 rounded-lg border-2 border-warning bg-warning-subtle p-4 text-center">
          <p className="text-caption font-semibold uppercase tracking-[0.12em] text-warning">Source</p>
          <p className="mt-1 text-body-sm font-semibold text-primary">Source: {result.source}</p>
          <p className="mt-2 text-caption text-body">Synthetic response. No live request was sent to Socure.</p>
        </div>

        <details className="mt-5 rounded-lg border border-primary-subtle bg-canvas">
          <summary className="cursor-pointer px-4 py-3 text-body-sm font-semibold text-primary">What was shared?</summary>
          <div className="border-t border-primary-subtle px-4 py-4 text-body-sm text-body">
            <p>Legal name, date of birth, passport number, and nationality.</p>
            <p className="mt-2"><span className="font-semibold text-primary">Why:</span> Verify additional identity information required for onboarding.</p>
          </div>
        </details>
      </div>
      <div className="sticky bottom-0 mt-7 bg-canvas pb-2 pt-4">
        <Button fullWidth onClick={onContinue}>Continue <span aria-hidden="true">→</span></Button>
      </div>
    </section>
  );
}

function VerificationIssue({ onRetry, onContinue }: { onRetry: () => void; onContinue: () => void }) {
  return (
    <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <div className="flex-1">
        <p className="text-caption font-semibold uppercase tracking-[0.16em] text-negative">Verification incomplete</p>
        <h1 className="mt-3 font-display text-display-md text-primary">We couldn’t verify this information</h1>
        <p className="mt-3 text-body-md text-body">The demo response did not match the established identity. You can retry or continue the onboarding demo.</p>
      </div>
      <div className="sticky bottom-0 mt-7 bg-canvas pb-2 pt-4">
        <Button fullWidth onClick={onRetry}>Try Again</Button>
        <Button className="mt-3" variant="secondary" fullWidth onClick={onContinue}>Continue</Button>
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
    <svg className="mt-0.5 size-5 shrink-0 text-positive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
