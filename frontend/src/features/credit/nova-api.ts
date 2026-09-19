export type NovaProvider = "nova_sandbox" | "demo_mock";

export interface NovaInitialization {
  provider: NovaProvider;
  providerLabel: string;
  token: string;
  publicToken: string;
  publicId: string;
  productId: string;
  expiresIn: number;
}

export interface NovaStatus {
  status: string;
  substatus?: string;
}

export interface NovaReport {
  [key: string]: unknown;
}

const apiBase = import.meta.env.VITE_API_URL ?? "/api";

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(error?.detail ?? "The secure connection could not be completed.");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function initializeNova(): Promise<NovaInitialization> {
  return apiRequest("/nova/initialize", {
    method: "POST",
    body: JSON.stringify({
      consent: true,
      prefill: {
        firstName: "Maya",
        lastName: "Okafor",
        dob: "2004-02-14",
        email: "maya.okafor@example.com",
        city: "Austin",
      },
      country: "NGA",
      externalId: crypto.randomUUID(),
    }),
  });
}

export function recordNovaCompletion(publicToken: string, status?: string): Promise<void> {
  return apiRequest("/nova/complete", {
    method: "POST",
    body: JSON.stringify({ publicToken, status }),
  });
}

export function getNovaStatus(publicToken: string, signal?: AbortSignal): Promise<NovaStatus> {
  return apiRequest(`/nova/status/${encodeURIComponent(publicToken)}`, { signal });
}

export function getNovaReport(publicToken: string, signal?: AbortSignal): Promise<NovaReport> {
  return apiRequest(`/nova/report/${encodeURIComponent(publicToken)}`, { signal });
}
