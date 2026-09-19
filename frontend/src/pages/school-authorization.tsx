import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { routePaths } from "@/app/routes";
import { Button } from "@/components";
import {
  getPassportResult,
  markSchoolSkipped,
  saveSchoolResult,
} from "@/features/profile/member-profile";
import {
  buildEnrollmentVerificationRequest,
  getSelectedSchool,
  studentVerificationProvider,
  type EnrollmentVerificationResult,
} from "@/features/school/school-verification";
import { useScrollReset } from "@/lib/use-scroll-reset";

type ViewState = "consent" | "verifying" | "complete" | "not-verified" | "error";

export function SchoolAuthorizationPage() {
  const navigate = useNavigate();
  const abortController = useRef<AbortController | null>(null);
  const [identity] = useState(getPassportResult);
  const [school] = useState(getSelectedSchool);
  const [viewState, setViewState] = useState<ViewState>("consent");
  const [result, setResult] = useState<EnrollmentVerificationResult | null>(null);
  useScrollReset(viewState);

  useEffect(() => () => abortController.current?.abort(), []);

  async function startVerification() {
    if (!identity || !school) return;
    abortController.current?.abort();
    const controller = new AbortController();
    abortController.current = controller;
    setResult(null);
    setViewState("verifying");

    try {
      const [verificationResult] = await Promise.all([
        studentVerificationProvider.verifyEnrollment(
          buildEnrollmentVerificationRequest(school, identity),
          controller.signal,
        ),
        wait(900, controller.signal),
      ]);
      if (verificationResult.verified) saveSchoolResult(verificationResult);
      setResult(verificationResult);
      setViewState(verificationResult.verified ? "complete" : "not-verified");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setViewState("error");
    }
  }

  function skipVerification() {
    markSchoolSkipped();
    navigate(routePaths.credit);
  }

  if (!identity) return <Navigate to={routePaths.passport} replace />;
  if (!school) return <Navigate to={routePaths.school} replace />;
  if (viewState === "verifying") return <Verifying />;
  if (viewState === "complete" && result) {
    return <VerificationComplete result={result} onContinue={() => navigate(routePaths.credit)} />;
  }
  if (viewState === "not-verified" && result) {
    return <VerificationIssue onRetry={startVerification} onSkip={skipVerification} />;
  }

  const requestedInformation = [
    {
      label: "Identity matching information needed for the verification request",
      detail: "Name and date of birth from your established identity",
    },
    { label: "School", detail: school.name },
    { label: "Enrollment status", detail: "Whether you are currently enrolled" },
  ];

  return (
    <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <div className="flex-1">
        <p className="text-caption font-semibold uppercase tracking-[0.16em] text-mute">{school.name}</p>
        <h1 className="mt-3 font-display text-display-md text-primary">Verify your enrollment</h1>
        <p className="mt-3 text-body-md text-body">
          With your permission, VERIFIED can request enrollment verification through National Student Clearinghouse.
        </p>

        <div className="mt-7 overflow-hidden rounded-lg border border-primary-subtle bg-canvas">
          <p className="bg-canvas-soft px-5 py-4 font-semibold text-primary">What will be requested</p>
          <ul className="divide-y divide-primary-subtle px-5">
            {requestedInformation.map((item) => (
              <li key={item.label} className="flex gap-3 py-4">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-positive-subtle text-sm font-semibold text-positive" aria-hidden="true">
                  ✓
                </span>
                <span>
                  <span className="block text-body-sm font-semibold text-primary">{item.label}</span>
                  <span className="mt-1 block text-caption text-mute">{item.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex gap-3 rounded-md bg-positive-subtle p-4 text-body-sm text-primary">
          <LockIcon />
          <p>This one-time request does not give VERIFIED unrestricted access to education records. No school username or password is requested.</p>
        </div>

        {viewState === "error" ? (
          <p className="mt-5 rounded-md bg-negative-subtle p-3 text-body-sm text-negative" role="alert">
            We couldn’t reach the demo verification service. Make sure the backend is running, then try again.
          </p>
        ) : null}
      </div>

      <div className="sticky bottom-0 mt-7 bg-canvas pb-2 pt-4">
        <Button fullWidth onClick={startVerification}>
          {viewState === "error" ? "Try again" : "Verify enrollment"}
        </Button>
        <Button className="mt-3" variant="secondary" fullWidth onClick={skipVerification}>
          Skip for now
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
        <span className="relative grid size-16 place-items-center rounded-full bg-primary text-xl font-semibold text-white">NSC</span>
      </div>
      <h1 className="mt-7 font-display text-display-md text-primary">Verifying with National Student Clearinghouse...</h1>
      <p className="mt-3 max-w-xs text-body-md text-body">Checking the minimum information included in your approved request.</p>
      <p className="mt-5 rounded-full bg-warning-subtle px-3 py-1.5 text-caption font-semibold text-warning">Demo verification</p>
    </section>
  );
}

function VerificationComplete({
  result,
  onContinue,
}: {
  result: EnrollmentVerificationResult;
  onContinue: () => void;
}) {
  return (
    <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <div className="flex-1">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.16em] text-secondary-darker">Verification complete</p>
            <h1 className="mt-2 font-display text-display-md text-primary">Enrollment verified</h1>
          </div>
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-secondary text-white verified-pop" aria-hidden="true">
            <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m6 12 4 4 8-9" /></svg>
          </div>
        </div>

        <div className="confirmed-card mt-7 rounded-lg border-2 border-secondary p-5">
          <ul className="space-y-4">
            <li className="flex items-start gap-3 font-data text-data-md text-primary">
              <span className="text-positive" aria-hidden="true">✓</span>
              {result.school}
            </li>
            <li className="flex items-start gap-3 font-data text-data-md text-primary">
              <span className="text-positive" aria-hidden="true">✓</span>
              {sentenceCaseEnrollment(result.enrollmentStatus)}
            </li>
          </ul>
        </div>

        <div className="mt-5 rounded-lg border-2 border-warning bg-warning-subtle p-4 text-center">
          <p className="text-caption font-semibold uppercase tracking-[0.12em] text-warning">Source</p>
          <p className="mt-1 text-body-sm font-semibold text-primary">National Student Clearinghouse — Demo Verification</p>
          <p className="mt-2 text-caption text-body">Synthetic response. No request was sent to NSC.</p>
        </div>
      </div>
      <div className="sticky bottom-0 mt-7 bg-canvas pb-2 pt-4">
        <Button fullWidth onClick={onContinue}>Continue <span aria-hidden="true">→</span></Button>
      </div>
    </section>
  );
}

function VerificationIssue({ onRetry, onSkip }: { onRetry: () => void; onSkip: () => void }) {
  return (
    <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <div className="flex-1">
        <p className="text-caption font-semibold uppercase tracking-[0.16em] text-negative">Verification incomplete</p>
        <h1 className="mt-3 font-display text-display-md text-primary">We couldn’t verify enrollment</h1>
        <p className="mt-3 text-body-md text-body">The demo provider did not find a matching current enrollment. You can retry or continue without connecting it.</p>
      </div>
      <div className="sticky bottom-0 mt-7 bg-canvas pb-2 pt-4">
        <Button fullWidth onClick={onRetry}>Try again</Button>
        <Button className="mt-3" variant="secondary" fullWidth onClick={onSkip}>Skip for now</Button>
      </div>
    </section>
  );
}

function sentenceCaseEnrollment(value?: string) {
  return value?.toLocaleLowerCase() === "currently enrolled" ? "Currently enrolled" : value ?? "Currently enrolled";
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

function LockIcon() {
  return (
    <svg className="mt-0.5 size-5 shrink-0 text-positive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
