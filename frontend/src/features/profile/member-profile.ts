import { syntheticIdentity } from "@/features/passport/mock-passport-provider";
import type { PassportIdentity } from "@/features/passport/passport-provider";
import type { NovaReport } from "@/features/credit/nova-api";
import type { SchoolVerificationResult } from "@/features/school/school-verification";

export type Source = "passport" | "school" | "nova_credit" | "self_reported" | "inferred" | "demo";

export interface ProfileField {
  value: string | number | boolean;
  source: Source;
  verified: boolean;
  confidence?: number;
  sourceLabel?: string;
}

export interface MemberProfile {
  identity: Record<string, ProfileField>;
  student: Record<string, ProfileField>;
  finances: Record<string, ProfileField>;
  goals: string[];
}

const storageKeys = {
  passport: "verified.passport.identity",
  school: "verified.school.verification",
  nova: "verified.nova.report",
  novaSkipped: "verified.nova.skipped",
} as const;

const demoSchoolResult: SchoolVerificationResult = {
  verified: true,
  status: "verified",
  school: "Austin Community College",
  source: "ACC Demo Connection",
  enrollment_status: "Currently enrolled",
  program: "Computer Science",
  expected_completion_date: "2027-08-31",
};

const demoNovaReport: NovaReport = {
  status: "SUCCESS",
  creditHistory: {
    historyLengthYears: 4,
    activeAccounts: 3,
    paymentHistory: "Strong",
    reportedDelinquencies: 0,
  },
  isSynthetic: true,
  source: "Nova Credit — Demo Data",
};

export function savePassportResult(identity: PassportIdentity) {
  write(storageKeys.passport, identity);
}

export function saveSchoolResult(result: SchoolVerificationResult) {
  write(storageKeys.school, result);
}

export function saveNovaResult(report: NovaReport) {
  write(storageKeys.nova, report);
  sessionStorage.removeItem(storageKeys.novaSkipped);
}

export function markNovaSkipped() {
  sessionStorage.removeItem(storageKeys.nova);
  sessionStorage.setItem(storageKeys.novaSkipped, "true");
}

export function clearNovaSkipped() {
  sessionStorage.removeItem(storageKeys.novaSkipped);
}

export function getMemberProfile(): MemberProfile {
  const passport = read<PassportIdentity>(storageKeys.passport) ?? syntheticIdentity;
  const school = read<SchoolVerificationResult>(storageKeys.school) ?? demoSchoolResult;
  const skippedNova = sessionStorage.getItem(storageKeys.novaSkipped) === "true";
  const nova = skippedNova ? null : read<NovaReport>(storageKeys.nova) ?? demoNovaReport;

  return buildMemberProfile(passport, school, nova, skippedNova);
}

export function buildMemberProfile(
  passport: PassportIdentity,
  school: SchoolVerificationResult,
  nova: NovaReport | null,
  skippedNova = false,
): MemberProfile {
  const passportSource = "Passport chip · Demo scan";
  const identity: MemberProfile["identity"] = {
    name: verifiedField(passport.fullName, "passport", passportSource),
    dateOfBirth: verifiedField(passport.dateOfBirth, "passport", passportSource),
    nationality: verifiedField(passport.nationality, "passport", passportSource),
    passport: verifiedField(`${passport.documentType} · ${passport.passportNumber}`, "passport", passportSource),
  };

  const student: MemberProfile["student"] = {};
  if (school.verified) {
    student.school = verifiedField(school.school, "school", school.source);
    student.enrollment = verifiedField(school.enrollment_status ?? "Currently enrolled", "school", school.source);
    if (school.program) student.program = verifiedField(school.program, "school", school.source);
    if (school.expected_completion_date) {
      student.programEnd = verifiedField(school.expected_completion_date, "school", school.source);
    }
  }

  const finances: MemberProfile["finances"] = {};
  if (nova) {
    const history = readCreditHistory(nova);
    const sourceLabel = readString(nova.source) ?? (nova.isSynthetic ? "Nova Credit — Demo Data" : "Nova Credit Sandbox");
    finances.internationalCreditHistory = verifiedField(true, "nova_credit", sourceLabel);
    finances.reportStatus = verifiedField("Connected", "nova_credit", sourceLabel);
    if (history) {
      if (typeof history.historyLengthYears === "number") {
        finances.historyLengthYears = verifiedField(history.historyLengthYears, "nova_credit", sourceLabel);
      }
      if (typeof history.activeAccounts === "number") {
        finances.activeAccounts = verifiedField(history.activeAccounts, "nova_credit", sourceLabel);
      }
      if (typeof history.paymentHistory === "string") {
        finances.paymentHistory = verifiedField(history.paymentHistory, "nova_credit", sourceLabel);
      }
      if (typeof history.reportedDelinquencies === "number") {
        finances.reportedDelinquencies = verifiedField(history.reportedDelinquencies, "nova_credit", sourceLabel);
      }
    }
  } else if (skippedNova) {
    finances.internationalCreditHistory = {
      value: false,
      source: "self_reported",
      sourceLabel: "You told us",
      verified: false,
    };
  }

  return { identity, student, finances, goals: [] };
}

function verifiedField(value: ProfileField["value"], source: Source, sourceLabel: string): ProfileField {
  return { value, source, sourceLabel, verified: true };
}

function readCreditHistory(report: NovaReport) {
  const value = report.creditHistory;
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function read<T>(key: string): T | null {
  try {
    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) as T : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  sessionStorage.setItem(key, JSON.stringify(value));
}
