import type { SocureLivenessImage } from "@/features/identity/socure-verification";

// Deliberately module-memory only: never persist biometric images in React state,
// sessionStorage, localStorage, analytics, or logs.
let pendingLivenessImages: SocureLivenessImage[] | null = null;

export function holdLivenessImagesForConsent(images: SocureLivenessImage[]) {
  pendingLivenessImages = images;
}

export function getPendingLivenessImages(): SocureLivenessImage[] | null {
  return pendingLivenessImages;
}

export function clearPendingLivenessImages() {
  pendingLivenessImages = null;
}
