import type { PassportIdentity } from "@/features/passport/passport-provider";
import type { NovaReport } from "@/features/credit/nova-api";
import type { EnrollmentVerificationResult } from "@/features/school/school-verification";

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
  schoolSkipped: "verified.school.skipped",
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

export function getPassportResult(): PassportIdentity | null {
  const value = read<PassportIdentity>(storageKeys.passport);
  if (!value || typeof value !== "object") return null;

  const requiredStrings: Array<keyof PassportIdentity> = [
    "firstName",
    "lastName",
    "fullName",
    "dateOfBirth",
    "nationality",
    "passportNumber",
    "documentType",
    "initials",
  ];
  return requiredStrings.every((key) => typeof value[key] === "string" && value[key].trim().length > 0)
    ? value
    : null;
}

export function saveSchoolResult(result: EnrollmentVerificationResult) {
  write(storageKeys.school, result);
  remove(storageKeys.schoolSkipped);
}

export function getSchoolResult(): EnrollmentVerificationResult | null {
  const value = read<EnrollmentVerificationResult>(storageKeys.school);
  return value
    && typeof value === "object"
    && typeof value.verified === "boolean"
    && typeof value.school === "string"
    && value.provider === "national_student_clearinghouse"
    && value.demo === true
    ? value
    : null;
}

export function clearSchoolResult() {
  remove(storageKeys.school);
}

export function markSchoolSkipped() {
  remove(storageKeys.school);
  try {
    sessionStorage.setItem(storageKeys.schoolSkipped, "true");
  } catch {
    // Storage can be unavailable in privacy-restricted browsing contexts.
  }
}

export function clearSchoolSkipped() {
  remove(storageKeys.schoolSkipped);
}

export function wasSchoolSkipped() {
  try {
    return sessionStorage.getItem(storageKeys.schoolSkipped) === "true";
  } catch {
    return false;
  }
}

export function saveNovaResult(report: NovaReport) {
  write(storageKeys.nova, report);
  remove(storageKeys.novaSkipped);
}

export function getSavedNovaResult(): NovaReport | null {
  const value = read<NovaReport>(storageKeys.nova);
  return value && typeof value === "object" ? value : null;
}

export function clearNovaResult() {
  remove(storageKeys.nova);
}

export function markNovaSkipped() {
  remove(storageKeys.nova);
  try {
    sessionStorage.setItem(storageKeys.novaSkipped, "true");
  } catch {
    // Storage can be unavailable in privacy-restricted browsing contexts.
  }
}

export function clearNovaSkipped() {
  remove(storageKeys.novaSkipped);
}

export function clearOnboardingData() {
  Object.values(storageKeys).forEach(remove);
  remove("verified.school.selected");
  remove("verified.nova.initialization");
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
  const passport = getPassportResult();
  const school = getSchoolResult();
  let skippedNova = false;
  try {
    skippedNova = sessionStorage.getItem(storageKeys.novaSkipped) === "true";
  } catch {
    // Treat unavailable storage as an empty session.
  }
  const nova = skippedNova ? null : getSavedNovaResult();

  const profile = buildMemberProfile(passport, school, nova, skippedNova);
  profile.goals = getFinancialGoals().selected;
  return profile;
}

export function buildMemberProfile(
  passport: PassportIdentity | null,
  school: EnrollmentVerificationResult | null,
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
    const sourceLabel = "National Student Clearinghouse — Demo Verification";
    student.school = verifiedField(school.school, "school", sourceLabel);
    student.enrollment = verifiedField(
      school.enrollmentStatus ?? "Currently Enrolled",
      "school",
      sourceLabel,
    );
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
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // A failed demo storage write should not crash the active screen.
  }
}

function remove(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Storage can be unavailable in privacy-restricted browsing contexts.
  }
}
