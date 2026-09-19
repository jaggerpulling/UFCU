import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { routePaths } from "@/app/routes";
import { Button } from "@/components";
import {
  calculateMembershipReadiness,
  getMemberProfile,
  type MembershipRequirement,
} from "@/features/profile/member-profile";
import {
  createAgreementEnvelope,
  getAgreementSignature,
  saveAgreementSignature,
  type AgreementSignature,
} from "@/features/esignature/esignature";

export function MembershipReadyPage() {
  const navigate = useNavigate();
  const [signature, setSignature] = useState(getAgreementSignature());
  const [signingError, setSigningError] = useState<string | null>(null);
  const [openingSigner, setOpeningSigner] = useState(false);
  const readiness = calculateMembershipReadiness(getMemberProfile());

  const receiveSignature = useCallback((result: AgreementSignature) => {
    saveAgreementSignature(result);
    setSignature(result);
  }, []);

  useEffect(() => {
    function receiveMessage(event: MessageEvent<unknown>) {
      if (event.origin !== window.location.origin || !event.data || typeof event.data !== "object") return;
      const payload = event.data as { type?: string; result?: AgreementSignature };
      if (payload.type === "ufcu-docusign-demo-complete" && payload.result?.agreementSigned === true) {
        receiveSignature(payload.result);
      }
    }
    window.addEventListener("message", receiveMessage);
    return () => window.removeEventListener("message", receiveMessage);
  }, [receiveSignature]);

  async function openDocuSignDemo() {
    setOpeningSigner(true);
    setSigningError(null);
    try {
      const envelope = await createAgreementEnvelope();
      const popup = window.open(
        `${routePaths.docusignDemo}?envelopeId=${encodeURIComponent(envelope.envelopeId)}`,
        "ufcu-docusign-demo",
        "popup=yes,width=560,height=760",
      );
      if (!popup) throw new Error("popup_blocked");
      popup.focus();
    } catch {
      setSigningError("We couldn’t open DocuSign — Demo. Please allow popups and try again.");
    } finally {
      setOpeningSigner(false);
    }
  }

  if (!readiness.isReady) {
    const nextRoute = readiness.requirements.find((item) => item.id === "identity" && !item.complete)
      ? routePaths.passport
      : routePaths.school;

    if (readiness.requirements.find((item) => item.id === "required")?.complete) {
      return (
        <ReviewAndSign
          error={signingError}
          opening={openingSigner}
          onReview={openDocuSignDemo}
          signed={signature?.agreementSigned === true}
        />
      );
    }

    return (
      <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
        <div className="flex-1">
          <p className="text-caption font-semibold uppercase tracking-[0.16em] text-mute">Membership progress</p>
          <h1 className="mt-3 font-display text-display-md text-primary">A few details are still needed.</h1>
          <p className="mt-3 text-body-md text-body">
            Your membership status updates only when verified information is present in your profile.
          </p>
          <ReadinessSummary readiness={readiness} />
        </div>
        <div className="sticky bottom-0 mt-7 bg-canvas pb-2 pt-4">
          <Button fullWidth onClick={() => navigate(nextRoute)}>
            Complete required information
            <span aria-hidden="true">→</span>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <div className="flex-1">
        <div className="grid size-16 place-items-center rounded-full bg-secondary text-white verified-pop" aria-hidden="true">
          <CheckIcon />
        </div>
        <p className="mt-5 text-caption font-semibold uppercase tracking-[0.16em] text-positive">Required profile complete</p>
        <h1 className="mt-2 font-display text-display-md text-primary">You’re ready.</h1>
        <p className="mt-3 text-body-md text-body">
          We’ve collected and verified the information needed for this demo onboarding profile without making you repeatedly enter information that already exists.
        </p>

        <ReadinessSummary readiness={readiness} />

        <div className="mt-6 rounded-lg bg-primary px-5 py-5 text-center text-white confirmed-card">
          <p className="text-caption font-semibold uppercase tracking-[0.22em] text-white/70">Status</p>
          <p className="mt-2 font-display text-display-sm">Membership ready</p>
          <p className="mt-2 text-caption text-white/70">Demo onboarding profile</p>
        </div>

        <p className="mt-4 text-center text-caption text-mute">
          This status does not mean an account has been opened or production identity checks are complete.
        </p>
      </div>

      <div className="sticky bottom-0 mt-7 bg-canvas pb-2 pt-4">
        <Button fullWidth onClick={() => navigate(routePaths.goals)}>
          Continue with UFCU
          <span aria-hidden="true">→</span>
        </Button>
      </div>
    </section>
  );
}

function ReviewAndSign({ error, opening, onReview, signed }: {
  error: string | null;
  opening: boolean;
  onReview: () => void;
  signed: boolean;
}) {
  return (
    <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <div className="flex-1">
        <p className="text-caption font-semibold uppercase tracking-[0.16em] text-accent-darker">DocuSign — Demo</p>
        <h1 className="mt-3 font-display text-display-md text-primary">Review & Sign</h1>
        <p className="mt-3 text-body-md text-body">One final demo agreement is needed before this membership profile is ready.</p>
        <div className="mt-7 rounded-lg border border-primary-subtle bg-canvas-soft p-5">
          <p className="text-caption font-semibold uppercase tracking-[0.12em] text-mute">Sample terms — not actual UFCU legal language</p>
          <p className="mt-3 text-body-sm text-body">This mock agreement confirms your demo onboarding profile. Official UFCU account terms, disclosures, and privacy notices would be provided before any real account is opened.</p>
        </div>
        {signed ? <p className="mt-5 text-body-sm font-semibold text-positive">Agreement signed ✓</p> : null}
        {error ? <p className="mt-5 text-body-sm text-negative" role="alert">{error}</p> : null}
      </div>
      <div className="sticky bottom-0 mt-7 bg-canvas pb-2 pt-4">
        <Button fullWidth onClick={onReview} disabled={opening || signed}>
          {opening ? "Opening DocuSign — Demo…" : signed ? "Agreement signed ✓" : "Review & Sign with DocuSign"}
          {!opening && !signed ? <span aria-hidden="true">↗</span> : null}
        </Button>
      </div>
    </section>
  );
}

function ReadinessSummary({ readiness }: { readiness: ReturnType<typeof calculateMembershipReadiness> }) {
  return (
    <div className="mt-7 overflow-hidden rounded-lg border border-primary-subtle bg-canvas">
      <div className="bg-canvas-soft px-5 py-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.12em] text-mute">Profile readiness</p>
            <p className="mt-1 font-data text-data-md text-primary">
              {readiness.completedCount} of {readiness.totalCount} signals complete
            </p>
          </div>
          <span className="font-data text-data-md text-accent-darker">{readiness.completionPercent}%</span>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-primary-subtle"
          role="progressbar"
          aria-label="Profile readiness"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={readiness.completionPercent}
        >
          <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${readiness.completionPercent}%` }} />
        </div>
      </div>
      <ul className="divide-y divide-primary-subtle px-5">
        {readiness.requirements.map((requirement) => (
          <RequirementRow key={requirement.id} requirement={requirement} />
        ))}
      </ul>
    </div>
  );
}

function RequirementRow({ requirement }: { requirement: MembershipRequirement }) {
  return (
    <li className="flex items-center gap-3 py-4">
      <span
        className={`grid size-7 shrink-0 place-items-center rounded-full text-sm font-semibold ${
          requirement.complete ? "bg-secondary text-white" : "border border-primary-subtle text-mute"
        }`}
        aria-hidden="true"
      >
        {requirement.complete ? "✓" : ""}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-body-sm font-semibold ${requirement.complete ? "text-primary" : "text-body"}`}>
          {requirement.label}
        </p>
        {!requirement.required ? (
          <p className="mt-0.5 text-caption text-mute">Optional — you can continue without it</p>
        ) : null}
      </div>
      <span className={`text-caption font-semibold ${requirement.complete ? "text-positive" : "text-mute"}`}>
        {requirement.complete ? "Complete" : requirement.required ? "Needed" : "Skipped"}
      </span>
    </li>
  );
}

function CheckIcon() {
  return (
    <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="m6 12 4 4 8-9" />
    </svg>
  );
}
