import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { routePaths } from "@/app/routes";
import { Button, SourceBadge } from "@/components";
import { syntheticIdentity } from "@/features/passport/mock-passport-provider";
import { verifySchoolEnrollment, type SchoolVerificationResult } from "@/features/school/school-verification";

type ViewState = "consent" | "verifying" | "complete" | "not-verified" | "error";

export function SchoolAuthorizationPage() {
  const navigate = useNavigate();
  const abortController = useRef<AbortController | null>(null);
  const [viewState, setViewState] = useState<ViewState>("consent");
  const [result, setResult] = useState<SchoolVerificationResult | null>(null);

  useEffect(() => () => abortController.current?.abort(), []);

  async function startVerification() {
    abortController.current?.abort();
    const controller = new AbortController();
    abortController.current = controller;
    setResult(null);
    setViewState("verifying");

    try {
      const [verificationResult] = await Promise.all([
        verifySchoolEnrollment(syntheticIdentity, controller.signal),
        wait(900, controller.signal),
      ]);
      setResult(verificationResult);
      setViewState(verificationResult.verified ? "complete" : "not-verified");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setViewState("error");
    }
  }

  if (viewState === "verifying") return <Verifying />;
  if (viewState === "complete" && result) {
    return <VerificationComplete result={result} onContinue={() => navigate(routePaths.credit)} />;
  }
  if (viewState === "not-verified" && result) {
    return <VerificationIssue result={result} onRetry={startVerification} />;
  }

  return (
    <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <div className="flex-1">
        <p className="text-caption font-semibold uppercase tracking-[0.16em] text-mute">Austin Community College</p>
        <h1 className="mt-3 font-display text-display-md text-primary">Allow enrollment verification</h1>
        <p className="mt-3 text-body-md text-body">VERIFIED is requesting permission to confirm:</p>

        <ul className="mt-7 space-y-3 rounded-lg bg-canvas-soft p-5">
          {["Your enrollment status", "Your school name", "That your identity matches the student record"].map((item) => (
            <li key={item} className="flex items-start gap-3 text-body-sm text-primary">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-positive-subtle font-semibold text-positive" aria-hidden="true">
                ✓
              </span>
              <span className="pt-0.5">{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-md border border-primary-subtle p-4">
          <p className="text-body-sm font-semibold text-primary">Identity being matched</p>
          <p className="mt-1 font-data text-data-sm text-body">{syntheticIdentity.fullName}</p>
          <p className="mt-1 font-data text-data-sm text-mute">Born January 1, 1999</p>
        </div>

        {viewState === "error" ? (
          <p className="mt-5 rounded-md bg-negative-subtle p-3 text-body-sm text-negative" role="alert">
            We couldn’t reach the demo verification service. Make sure the backend is running, then try again.
          </p>
        ) : null}
      </div>

      <div className="sticky bottom-0 mt-7 bg-canvas pb-2 pt-4">
        <Button fullWidth onClick={startVerification}>
          {viewState === "error" ? "Try again" : "Allow and continue"}
        </Button>
        <button className="mt-3 min-h-touch w-full text-body-sm font-semibold text-primary" onClick={() => navigate(routePaths.school)}>
          Cancel
        </button>
      </div>
    </section>
  );
}

function Verifying() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center" aria-live="polite">
      <div className="relative grid size-24 place-items-center">
        <span className="absolute size-20 animate-ping rounded-full bg-secondary-subtle opacity-60" />
        <span className="relative grid size-16 place-items-center rounded-full bg-primary text-xl font-semibold text-white">A</span>
      </div>
      <h1 className="mt-7 font-display text-display-md text-primary">Verifying student information…</h1>
      <p className="mt-3 max-w-xs text-body-md text-body">Securely matching your passport identity with the ACC demo connection.</p>
    </section>
  );
}

function VerificationComplete({ result, onContinue }: { result: SchoolVerificationResult; onContinue: () => void }) {
  return (
    <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <div className="flex-1">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.16em] text-secondary-darker">Verification complete</p>
            <h1 className="mt-2 font-display text-display-md text-primary">Student information verified</h1>
          </div>
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-secondary text-white verified-pop" aria-hidden="true">
            <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m6 12 4 4 8-9" /></svg>
          </div>
        </div>
        <p className="mt-3 text-body-md text-body">Your enrollment was confirmed using the identity from your passport.</p>

        <div className="confirmed-card mt-7 overflow-hidden rounded-lg border-2 border-secondary">
          <div className="border-b border-primary-subtle bg-canvas-soft p-5">
            <p className="font-semibold text-primary">{result.school}</p>
            <div className="mt-2"><SourceBadge variant="verified" label="Enrollment verified" /></div>
          </div>
          <dl className="divide-y divide-primary-subtle px-5">
            <div className="flex items-center justify-between gap-4 py-4">
              <dt className="text-body-sm text-mute">Enrollment</dt>
              <dd className="font-data text-data-sm text-positive">✓ Currently enrolled</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-4">
              <dt className="text-body-sm text-mute">Student</dt>
              <dd className="text-right font-data text-data-sm text-primary">{syntheticIdentity.fullName}</dd>
            </div>
          </dl>
        </div>

        <p className="mt-4 text-center text-caption text-mute">Source: {result.school} — {result.source}</p>
        <p className="mt-1 text-center text-caption text-mute">Synthetic demo data · No real school account was accessed</p>
      </div>
      <div className="sticky bottom-0 mt-7 bg-canvas pb-2 pt-4">
        <Button fullWidth onClick={onContinue}>Continue <span aria-hidden="true">→</span></Button>
      </div>
    </section>
  );
}

function VerificationIssue({ result, onRetry }: { result: SchoolVerificationResult; onRetry: () => void }) {
  const message = result.status === "inactive"
    ? "We found the student record, but it is not currently enrolled."
    : result.status === "ambiguous"
      ? "We found more than one matching student record and couldn’t verify automatically."
      : "We couldn’t match this identity to an active student record.";

  return (
    <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <div className="flex-1">
        <p className="text-caption font-semibold uppercase tracking-[0.16em] text-negative">Verification incomplete</p>
        <h1 className="mt-3 font-display text-display-md text-primary">We couldn’t verify enrollment</h1>
        <p className="mt-3 text-body-md text-body">{message}</p>
        <div className="mt-7 rounded-lg bg-negative-subtle p-5 text-body-sm text-negative">Status: {result.status.replace("_", " ")}</div>
      </div>
      <div className="sticky bottom-0 mt-7 bg-canvas pb-2 pt-4"><Button fullWidth onClick={onRetry}>Try again</Button></div>
    </section>
  );
}

function wait(milliseconds: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, milliseconds);
    signal.addEventListener("abort", () => {
      window.clearTimeout(timer);
      reject(new DOMException("Verification cancelled", "AbortError"));
    }, { once: true });
  });
}
