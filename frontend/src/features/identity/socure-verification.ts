import type { PassportIdentity } from "@/features/passport/passport-provider";

export const socureSharedFields = [
  { key: "legal_name", label: "Legal name" },
  { key: "date_of_birth", label: "Date of birth" },
  { key: "passport_number", label: "Passport number" },
  { key: "nationality", label: "Nationality" },
] as const;

export type SocureSharedField = (typeof socureSharedFields)[number]["key"];

export interface SocureVerificationRequest {
  consent: { granted: true };
  identity: {
    legalName: string;
    dateOfBirth: string;
    passportNumber: string;
    nationality: string;
  };
}

export interface SocureLivenessImage {
  challenge: "center_face" | "turn_left" | "turn_right" | "blink";
  /** Base64 JPEG held only in memory for the current provider handoff. */
  imageData: string;
}

export interface SocureLivenessSubmissionRequest {
  consent: { granted: true };
  biometricDataConsent: true;
  identity: SocureVerificationRequest["identity"];
  livenessImages: SocureLivenessImage[];
}

export interface SocureVerificationResult {
  provider: "socure";
  verified: boolean;
  verificationStatus: "identity_information_verified" | "identity_information_not_verified";
  verifiedInformation: SocureSharedField[];
  verifiedAt: string;
  source: "Socure — Demo Verification";
  demo: true;
}

export interface SocureVerificationProvider {
  verifyIdentity(
    request: SocureVerificationRequest,
    signal?: AbortSignal,
  ): Promise<SocureVerificationResult>;
  submitLivenessImages(
    request: SocureLivenessSubmissionRequest,
    signal?: AbortSignal,
  ): Promise<void>;
}

class BackendSocureVerificationProvider implements SocureVerificationProvider {
  async verifyIdentity(request: SocureVerificationRequest, signal?: AbortSignal) {
    const apiBaseUrl = import.meta.env.VITE_API_URL ?? "/api";
    const response = await fetch(`${apiBaseUrl}/identity/socure/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });

    if (!response.ok) {
      // Do not include response bodies: provider errors may contain sensitive data.
      throw new Error(`Identity verification failed with status ${response.status}`);
    }
    return (await response.json()) as SocureVerificationResult;
  }

  async submitLivenessImages(request: SocureLivenessSubmissionRequest, signal?: AbortSignal) {
    const apiBaseUrl = import.meta.env.VITE_API_URL ?? "/api";
    const response = await fetch(`${apiBaseUrl}/identity/socure/liveness`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });

    if (!response.ok) {
      // Provider error responses could contain sensitive data; never surface them.
      throw new Error(`Liveness verification failed with status ${response.status}`);
    }
  }
}

export const socureVerificationProvider: SocureVerificationProvider =
  new BackendSocureVerificationProvider();

export function buildSocureVerificationRequest(
  identity: PassportIdentity,
): SocureVerificationRequest {
  return {
    consent: { granted: true },
    identity: {
      legalName: identity.fullName,
      dateOfBirth: identity.dateOfBirth,
      passportNumber: identity.passportNumber,
      nationality: identity.nationality,
    },
  };
}

export function buildSocureLivenessSubmissionRequest(
  identity: PassportIdentity,
  livenessImages: SocureLivenessImage[],
): SocureLivenessSubmissionRequest {
  return {
    ...buildSocureVerificationRequest(identity),
    biometricDataConsent: true,
    livenessImages,
  };
}
