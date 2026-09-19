export interface VerifiedAddress {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  verifiedAt: string;
  source: "Socure — Demo Verification";
}

interface AddressVerificationResponse {
  verified: true;
  verifiedAt: string;
  source: "Socure — Demo Verification";
  demo: true;
}

export async function verifyAddress(address: Omit<VerifiedAddress, "verifiedAt" | "source">): Promise<VerifiedAddress> {
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? "/api";
  const response = await fetch(`${apiBaseUrl}/identity/socure/address/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });
  if (!response.ok) throw new Error("Address verification could not be completed.");
  const result = await response.json() as AddressVerificationResponse;
  return { ...address, verifiedAt: result.verifiedAt, source: result.source };
}
