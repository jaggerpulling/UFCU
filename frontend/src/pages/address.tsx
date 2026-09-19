import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { routePaths } from "@/app/routes";
import { Button } from "@/components";
import { verifyAddress } from "@/features/address/address-verification";
import { getPassportResult, saveVerifiedAddress } from "@/features/profile/member-profile";

export function AddressPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ streetAddress: "", city: "", state: "", zipCode: "" });
  const [status, setStatus] = useState<"entry" | "verifying" | "complete" | "error">("entry");

  if (!getPassportResult()) return <Navigate to={routePaths.passport} replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("verifying");
    try {
      const result = await verifyAddress({ ...form, state: form.state.toUpperCase() });
      saveVerifiedAddress(result);
      setStatus("complete");
    } catch {
      setStatus("error");
    }
  }

  if (status === "complete") {
    return (
      <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
        <div className="flex-1">
          <div className="grid size-14 place-items-center rounded-full bg-secondary text-white verified-pop" aria-hidden="true">✓</div>
          <h1 className="mt-5 font-display text-display-md text-primary">✓ Address verified</h1>
          <p className="mt-4 text-body-sm font-semibold text-primary">Source: Socure — Demo Verification</p>
        </div>
        <div className="sticky bottom-0 mt-7 bg-canvas pb-2 pt-4">
          <Button fullWidth onClick={() => navigate(routePaths.credit)}>Continue <span aria-hidden="true">→</span></Button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <div className="flex-1">
        <p className="text-caption font-semibold uppercase tracking-[0.16em] text-mute">Address verification · Step 2</p>
        <h1 className="mt-3 font-display text-display-md text-primary">What’s your current address?</h1>
        <p className="mt-3 text-body-md text-body">We’ll verify this address with Socure — Demo Verification.</p>
        <form className="mt-7 space-y-4" onSubmit={submit}>
          <Field label="Street address" value={form.streetAddress} onChange={(streetAddress) => setForm({ ...form, streetAddress })} />
          <Field label="City" value={form.city} onChange={(city) => setForm({ ...form, city })} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="State" maxLength={2} value={form.state} onChange={(state) => setForm({ ...form, state })} />
            <Field label="ZIP" value={form.zipCode} onChange={(zipCode) => setForm({ ...form, zipCode })} />
          </div>
          {status === "error" ? <p className="text-body-sm text-negative" role="alert">We couldn’t verify the demo address. Please try again.</p> : null}
          <div className="sticky bottom-0 bg-canvas pb-2 pt-4">
            <Button fullWidth disabled={status === "verifying"} type="submit">
              {status === "verifying" ? "Verifying address…" : "Continue"}
              {status !== "verifying" ? <span aria-hidden="true">→</span> : null}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({ label, maxLength, onChange, value }: { label: string; maxLength?: number; onChange: (value: string) => void; value: string }) {
  return <label className="block text-body-sm font-semibold text-primary">{label}<input required maxLength={maxLength} className="mt-2 min-h-touch w-full rounded-md border border-primary-subtle bg-canvas px-3 py-2 text-body-md font-normal" value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
