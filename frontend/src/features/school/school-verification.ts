import type { PassportIdentity } from "@/features/passport/passport-provider";

export type SchoolVerificationStatus = "verified" | "inactive" | "no_match" | "ambiguous";

export interface SchoolVerificationResult {
  verified: boolean;
  status: SchoolVerificationStatus;
  school: string;
  source: string;
}

export async function verifySchoolEnrollment(identity: PassportIdentity, signal?: AbortSignal) {
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? "/api";
  const response = await fetch(`${apiBaseUrl}/school/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      first_name: identity.firstName,
      middle_name: identity.middleName,
      last_name: identity.lastName,
      date_of_birth: identity.dateOfBirth,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`School verification failed with status ${response.status}`);
  }

  return (await response.json()) as SchoolVerificationResult;
}
