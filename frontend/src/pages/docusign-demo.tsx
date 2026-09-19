import { FormEvent, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Button } from "@/components";
import { completeAgreementEnvelope } from "@/features/esignature/esignature";

export function DocuSignDemoPage() {
  const [searchParams] = useSearchParams();
  const [acknowledged, setAcknowledged] = useState(false);
  const [signature, setSignature] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const envelopeId = searchParams.get("envelopeId");

  async function finish(event: FormEvent) {
    event.preventDefault();
    if (!envelopeId || !acknowledged || !signature.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await completeAgreementEnvelope(envelopeId);
      window.opener?.postMessage({ type: "ufcu-docusign-demo-complete", result }, window.location.origin);
      window.close();
      if (!window.closed) setError("Signing is complete. You may close this window and return to UFCU.");
    } catch {
      setError("We couldn’t finish the demo agreement. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl bg-canvas px-6 py-8 text-primary">
      <p className="text-caption font-semibold uppercase tracking-[0.16em] text-accent-darker">DocuSign — Demo</p>
      <h1 className="mt-3 font-display text-display-md">Review & Sign</h1>
      <p className="mt-3 text-body-md text-body">This is a simulated DocuSign signing experience for the UFCU onboarding demo.</p>
      <section className="mt-6 rounded-lg border border-primary-subtle bg-canvas-soft p-5" aria-label="Sample membership agreement">
        <p className="text-caption font-semibold uppercase tracking-[0.12em] text-mute">Sample terms — not actual UFCU legal language</p>
        <p className="mt-3 text-body-sm text-body">By signing, you confirm that the information in this demo onboarding profile is intended for a sample membership application. UFCU would provide its official disclosures, account terms, and privacy notices before any real account is opened.</p>
      </section>
      <form className="mt-6 space-y-5" onSubmit={finish}>
        <label className="flex gap-3 text-body-sm text-body">
          <input checked={acknowledged} className="mt-1 size-4 accent-secondary" onChange={(event) => setAcknowledged(event.target.checked)} type="checkbox" />
          <span>I agree to use electronic records and signatures for this demo agreement.</span>
        </label>
        <label className="block text-body-sm font-semibold text-primary">
          Type your signature
          <input className="mt-2 w-full rounded-md border border-primary-subtle bg-white px-3 py-3 font-display text-body-md outline-none focus:border-secondary" onChange={(event) => setSignature(event.target.value)} placeholder="Your full name" value={signature} />
        </label>
        {error ? <p className="text-body-sm text-negative" role="alert">{error}</p> : null}
        <Button disabled={!acknowledged || !signature.trim() || submitting || !envelopeId} fullWidth type="submit">
          {submitting ? "Finishing…" : "Finish"}
        </Button>
      </form>
    </main>
  );
}
