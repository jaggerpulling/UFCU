export type PassportScanStage = "positioning" | "detected" | "reading" | "verifying";

export interface PassportScanProgress {
  stage: PassportScanStage;
  progress: number;
  message: string;
}

export interface PassportIdentity {
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  documentType: "Passport";
  initials: string;
}

export interface PassportProvider {
  scan(options: {
    signal?: AbortSignal;
    onProgress?: (progress: PassportScanProgress) => void;
  }): Promise<PassportIdentity>;
}
