import type { PassportIdentity, PassportProvider, PassportScanProgress } from "./passport-provider";

const syntheticIdentity: PassportIdentity = {
  fullName: "Maya Okafor",
  dateOfBirth: "14 February 2004",
  nationality: "Nigerian",
  passportNumber: "A•••••482",
  documentType: "Passport",
  initials: "MO",
};

const scanSequence: PassportScanProgress[] = [
  { stage: "positioning", progress: 18, message: "Hold your passport near your phone" },
  { stage: "detected", progress: 42, message: "Passport detected" },
  { stage: "reading", progress: 72, message: "Reading secure passport chip" },
  { stage: "verifying", progress: 94, message: "Confirming identity details" },
];

function wait(milliseconds: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, milliseconds);

    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timer);
        reject(new DOMException("Passport scan cancelled", "AbortError"));
      },
      { once: true },
    );
  });
}

export class MockPassportProvider implements PassportProvider {
  async scan({
    signal,
    onProgress,
  }: {
    signal?: AbortSignal;
    onProgress?: (progress: PassportScanProgress) => void;
  }): Promise<PassportIdentity> {
    for (const progress of scanSequence) {
      signal?.throwIfAborted();
      onProgress?.(progress);
      await wait(700, signal);
    }

    signal?.throwIfAborted();
    return { ...syntheticIdentity };
  }
}
