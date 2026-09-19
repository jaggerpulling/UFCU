export const agreementVersion = "UFCU-DEMO-MEMBERSHIP-2026-09";

export interface AgreementSignature {
  agreementSigned: true;
  signedAt: string;
  agreementVersion: string;
  envelopeId: string;
}

interface AgreementEnvelope {
  provider: "docusign_demo";
  envelopeId: string;
  agreementVersion: string;
  status: "sent" | "signed";
  signedAt: string | null;
  demo: true;
}

const signatureStorageKey = "verified.esignature.agreement";

export async function createAgreementEnvelope(): Promise<AgreementEnvelope> {
  return request<AgreementEnvelope>("/esignature/envelopes", {
    method: "POST",
    body: JSON.stringify({ agreementVersion }),
  });
}

export async function completeAgreementEnvelope(envelopeId: string): Promise<AgreementSignature> {
  const envelope = await request<AgreementEnvelope>(`/esignature/envelopes/${encodeURIComponent(envelopeId)}/complete`, {
    method: "POST",
    body: JSON.stringify({ electronicRecordsConsent: true }),
  });
  if (envelope.status !== "signed" || !envelope.signedAt) throw new Error("Agreement signing did not complete.");
  return {
    agreementSigned: true,
    signedAt: envelope.signedAt,
    agreementVersion: envelope.agreementVersion,
    envelopeId: envelope.envelopeId,
  };
}

export function saveAgreementSignature(signature: AgreementSignature) {
  try {
    // Deliberately store only completion metadata—not a signature image or text.
    sessionStorage.setItem(signatureStorageKey, JSON.stringify(signature));
  } catch {
    // Storage is optional for this demo.
  }
}

export function getAgreementSignature(): AgreementSignature | null {
  try {
    const value = sessionStorage.getItem(signatureStorageKey);
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<AgreementSignature>;
    return parsed.agreementSigned === true
      && typeof parsed.signedAt === "string"
      && typeof parsed.agreementVersion === "string"
      && typeof parsed.envelopeId === "string"
      ? parsed as AgreementSignature
      : null;
  } catch {
    return null;
  }
}

export function clearAgreementSignature() {
  try {
    sessionStorage.removeItem(signatureStorageKey);
  } catch {
    // Storage is optional for this demo.
  }
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? "/api";
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
  if (!response.ok) throw new Error(`Electronic signature request failed with status ${response.status}`);
  return response.json() as Promise<T>;
}
