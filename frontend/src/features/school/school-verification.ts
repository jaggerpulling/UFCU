import type { PassportIdentity } from "@/features/passport/passport-provider";

export interface SchoolOption {
  id: string;
  name: string;
  location: string;
  aliases: string[];
}

export const schoolOptions: SchoolOption[] = [
  {
    id: "austin-community-college",
    name: "Austin Community College",
    location: "Austin, TX",
    aliases: ["ACC"],
  },
  {
    id: "university-of-texas-at-austin",
    name: "The University of Texas at Austin",
    location: "Austin, TX",
    aliases: ["UT", "UT Austin"],
  },
  {
    id: "texas-state-university",
    name: "Texas State University",
    location: "San Marcos, TX",
    aliases: ["TXST", "Texas State"],
  },
  {
    id: "st-edwards-university",
    name: "St. Edward's University",
    location: "Austin, TX",
    aliases: ["St. Edward's"],
  },
];

export interface EnrollmentVerificationRequest {
  schoolId: string;
  identity: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  };
}

export interface EnrollmentVerificationResult {
  provider: "national_student_clearinghouse";
  school: string;
  enrollmentStatus?: string;
  currentAddress?: string;
  verified: boolean;
  verifiedAt: string;
  demo: true;
}

export interface StudentVerificationProvider {
  verifyEnrollment(
    request: EnrollmentVerificationRequest,
    signal?: AbortSignal,
  ): Promise<EnrollmentVerificationResult>;
}

class BackendStudentVerificationProvider implements StudentVerificationProvider {
  async verifyEnrollment(request: EnrollmentVerificationRequest, signal?: AbortSignal) {
    const apiBaseUrl = import.meta.env.VITE_API_URL ?? "/api";
    const response = await fetch(`${apiBaseUrl}/school/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });

    if (!response.ok) {
      throw new Error(`School verification failed with status ${response.status}`);
    }

    return (await response.json()) as EnrollmentVerificationResult;
  }
}

export const studentVerificationProvider: StudentVerificationProvider =
  new BackendStudentVerificationProvider();

export function buildEnrollmentVerificationRequest(
  school: SchoolOption,
  identity: PassportIdentity,
): EnrollmentVerificationRequest {
  return {
    schoolId: school.id,
    identity: {
      firstName: identity.firstName,
      lastName: identity.lastName,
      dateOfBirth: identity.dateOfBirth,
    },
  };
}

const selectedSchoolKey = "verified.school.selected";

export function saveSelectedSchool(school: SchoolOption) {
  try {
    sessionStorage.setItem(selectedSchoolKey, JSON.stringify(school));
  } catch {
    // The member can continue selecting in memory when storage is unavailable.
  }
}

export function getSelectedSchool(): SchoolOption | null {
  try {
    const value = sessionStorage.getItem(selectedSchoolKey);
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<SchoolOption>;
    return schoolOptions.find((school) => school.id === parsed.id) ?? null;
  } catch {
    return null;
  }
}

export function clearSelectedSchool() {
  try {
    sessionStorage.removeItem(selectedSchoolKey);
  } catch {
    // Storage can be unavailable in privacy-restricted browsing contexts.
  }
}
