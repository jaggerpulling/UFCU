import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { routePaths } from "@/app/routes";
import { Button } from "@/components";
import { initializeNova } from "@/features/credit/nova-api";
import {
  clearNovaResult,
  clearNovaSkipped,
  getMemberProfile,
  getPassportResult,
  markNovaSkipped,
  wasSchoolSkipped,
} from "@/features/profile/member-profile";
import { useScrollReset } from "@/lib/use-scroll-reset";

type View = "question" | "consent";

export function CreditPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("question");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canStart] = useState(() => Boolean(getPassportResult()) && (
    Object.keys(getMemberProfile().student).length > 0 || wasSchoolSkipped()
  ));
  useScrollReset(view);

  async function consentAndConnect() {
    setLoading(true);
    setError(null);
    try {
      clearNovaSkipped();
      clearNovaResult();
      const initialization = await initializeNova();
      sessionStorage.setItem("verified.nova.initialization", JSON.stringify({ ...initialization, initializedAt: Date.now() }));
      navigate(routePaths.creditConnection);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The connection could not be started.");
      setLoading(false);
    }
  }

  if (!canStart) return <Navigate to={routePaths.school} replace />;

  if (view === "consent") {
    return (
      <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
        <div className="flex-1">
          <p className="text-caption font-semibold uppercase tracking-[0.16em] text-mute">Financial history · Consent</p>
          <h1 className="mt-3 font-display text-display-md text-primary">Connect your international credit history?</h1>
          <p className="mt-3 text-body-md text-body">
            With your permission, we’ll securely ask Nova Credit for eligible credit history from your home country.
          </p>

          <div className="mt-7 rounded-lg border border-primary-subtle bg-canvas-soft p-5">
            <p className="font-semibold text-primary">You’re allowing us to retrieve:</p>
            <ul className="mt-4 space-y-3 text-body-sm text-body">
              {["Credit accounts and history", "Payment history", "Report status and source details"].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-positive" aria-hidden="true">✓</span>{item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 flex gap-3 rounded-md bg-positive-subtle p-4 text-body-sm text-primary">
            <LockIcon />
            <p>Your credentials stay with Nova Credit. UFCU receives the completed Credit Passport report only.</p>
          </div>
          {error ? <p className="mt-4 rounded-md bg-negative-subtle p-3 text-body-sm text-negative" role="alert">{error}</p> : null}
        </div>

        <div className="sticky bottom-0 mt-7 bg-canvas pb-2 pt-4">
          <Button fullWidth disabled={loading} onClick={consentAndConnect}>
            {loading ? "Starting secure connection…" : "Allow and continue"}
          </Button>
          <Button className="mt-3" variant="secondary" fullWidth disabled={loading} onClick={() => setView("question")}>
            Go back
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <div className="flex-1">
        <p className="text-caption font-semibold uppercase tracking-[0.16em] text-mute">Financial history · Step 3</p>
        <h1 className="mt-3 font-display text-display-md text-primary">Do you have credit history outside the United States?</h1>
        <p className="mt-3 text-body-md text-body">Moving countries shouldn’t mean leaving your financial history behind.</p>

        <div className="relative my-10 grid min-h-52 place-items-center" aria-hidden="true">
          <div className="absolute h-1 w-44 bg-primary-subtle" />
          <div className="absolute left-6 grid size-24 place-items-center rounded-full bg-primary text-white shadow-lg">
            <span className="font-display text-3xl">◎</span>
          </div>
          <div className="absolute right-6 grid size-24 place-items-center rounded-full border-4 border-secondary-subtle bg-white text-secondary shadow-lg">
            <span className="text-3xl">★</span>
          </div>
          <span className="relative rounded-full bg-positive-subtle px-3 py-1 text-caption font-semibold text-positive">Secure connection</span>
        </div>
      </div>

      <div className="sticky bottom-0 bg-canvas pb-2 pt-4">
        <Button fullWidth onClick={() => setView("consent")}>Yes, connect my history</Button>
        <Button className="mt-3" variant="secondary" fullWidth onClick={() => { markNovaSkipped(); navigate(routePaths.profile); }}>No / Skip for now</Button>
      </div>
    </section>
  );
}

function LockIcon() {
  return (
    <svg className="mt-0.5 size-5 shrink-0 text-positive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
