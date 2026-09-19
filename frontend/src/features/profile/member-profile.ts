import type { PassportIdentity } from "@/features/passport/passport-provider";
import type { NovaReport } from "@/features/credit/nova-api";
import type { SchoolVerificationResult } from "@/features/school/school-verification";

export type Source = "passport" | "school" | "nova_credit" | "self_reported" | "inferred" | "demo";

export interface DemoLivenessResult {
  status: "verified_demo";
  method: "webcam_liveness";
  completedChallenges: Array<"center_face" | "turn_left" | "turn_right" | "blink">;
  completedAt: string;
}

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

export const financialGoals = [
  { id: "everyday_banking", label: "Everyday banking" },
  { id: "build_credit", label: "Build U.S. credit" },
  { id: "save_for_tuition", label: "Save for tuition" },
  { id: "emergency_fund", label: "Build an emergency fund" },
  { id: "finance_car", label: "Finance a car" },
  { id: "other", label: "Other" },
] as const;

export type FinancialGoalId = (typeof financialGoals)[number]["id"];

export interface SavedFinancialGoals {
  selected: FinancialGoalId[];
  other?: string;
}

export type MembershipRequirementId = "identity" | "student" | "required" | "financial";

export interface MembershipRequirement {
  id: MembershipRequirementId;
  label: string;
  complete: boolean;
  required: boolean;
}

export interface MembershipReadiness {
  requirements: MembershipRequirement[];
  completedCount: number;
  totalCount: number;
  completionPercent: number;
  isReady: boolean;
}

const storageKeys = {
  passport: "verified.passport.identity",
  liveness: "verified.demo.liveness",
  school: "verified.school.verification",
  nova: "verified.nova.report",
  novaSkipped: "verified.nova.skipped",
  goals: "verified.profile.goals",
} as const;

export function saveDemoLivenessResult(result: DemoLivenessResult) {
  write(storageKeys.liveness, result);
}

export function getDemoLivenessResult(): DemoLivenessResult | null {
  return read<DemoLivenessResult>(storageKeys.liveness);
}

export function clearDemoLivenessResult() {
  sessionStorage.removeItem(storageKeys.liveness);
}

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

export function saveFinancialGoals(goals: SavedFinancialGoals) {
  const selected = financialGoals
    .map((goal) => goal.id)
    .filter((goal) => goals.selected.includes(goal));
  const other = goals.other?.trim();
  write(storageKeys.goals, { selected, ...(other ? { other } : {}) });
}

export function getFinancialGoals(): SavedFinancialGoals {
  const stored = read<SavedFinancialGoals>(storageKeys.goals);
  if (!stored || !Array.isArray(stored.selected)) return { selected: [] };

  const validGoals = new Set<FinancialGoalId>(financialGoals.map((goal) => goal.id));
  return {
    selected: stored.selected.filter((goal): goal is FinancialGoalId => validGoals.has(goal)),
    ...(typeof stored.other === "string" && stored.other.trim() ? { other: stored.other.trim() } : {}),
  };
}

export function getMemberProfile(): MemberProfile {
  const passport = read<PassportIdentity>(storageKeys.passport);
  const school = read<SchoolVerificationResult>(storageKeys.school);
  const skippedNova = sessionStorage.getItem(storageKeys.novaSkipped) === "true";
  const nova = skippedNova ? null : read<NovaReport>(storageKeys.nova);

  const profile = buildMemberProfile(passport, school, nova, skippedNova);
  profile.goals = getFinancialGoals().selected;
  return profile;
}

export function buildMemberProfile(
  passport: PassportIdentity | null,
  school: SchoolVerificationResult | null,
  nova: NovaReport | null,
  skippedNova = false,
): MemberProfile {
  const passportSource = "Passport chip · Demo scan";
  const identity: MemberProfile["identity"] = {};
  if (passport) {
    identity.name = verifiedField(passport.fullName, "passport", passportSource);
    identity.dateOfBirth = verifiedField(passport.dateOfBirth, "passport", passportSource);
    identity.nationality = verifiedField(passport.nationality, "passport", passportSource);
    identity.passport = verifiedField(`${passport.documentType} · ${passport.passportNumber}`, "passport", passportSource);
  }

  const student: MemberProfile["student"] = {};
  if (school?.verified) {
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

export function calculateMembershipReadiness(profile: MemberProfile): MembershipReadiness {
  const identityComplete = fieldsAreVerified(profile.identity, ["name", "dateOfBirth", "nationality", "passport"]);
  const studentComplete = fieldsAreVerified(profile.student, ["school", "enrollment"]);
  const requiredComplete = identityComplete && studentComplete;
  const creditHistory = profile.finances.internationalCreditHistory;
  const financialComplete = Boolean(creditHistory?.verified && creditHistory.value === true);

  const requirements: MembershipRequirement[] = [
    { id: "identity", label: "Identity established", complete: identityComplete, required: true },
    { id: "student", label: "Student information verified", complete: studentComplete, required: true },
    { id: "required", label: "Required information complete", complete: requiredComplete, required: true },
    { id: "financial", label: "Financial profile connected", complete: financialComplete, required: false },
  ];
  const completedCount = requirements.filter((requirement) => requirement.complete).length;

  return {
    requirements,
    completedCount,
    totalCount: requirements.length,
    completionPercent: Math.round((completedCount / requirements.length) * 100),
    isReady: requiredComplete,
  };
}

function verifiedField(value: ProfileField["value"], source: Source, sourceLabel: string): ProfileField {
  return { value, source, sourceLabel, verified: true };
}

function fieldsAreVerified(fields: Record<string, ProfileField>, requiredKeys: string[]) {
  return requiredKeys.every((key) => {
    const field = fields[key];
    return Boolean(field?.verified && field.value !== "");
  });
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
