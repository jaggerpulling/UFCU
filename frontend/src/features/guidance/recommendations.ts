import {
  financialGoals,
  type FinancialGoalId,
  type MemberProfile,
  type ProfileField,
  type SavedFinancialGoals,
} from "@/features/profile/member-profile";

export interface RecommendationReason {
  field: string;
  label: string;
  value: string;
  source: ProfileField["source"];
  sourceLabel: string;
  verified: boolean;
}

export interface FinancialRecommendation {
  goal: FinancialGoalId;
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  reasons: RecommendationReason[];
}

const goalCopy: Record<FinancialGoalId, Omit<FinancialRecommendation, "goal" | "reasons">> = {
  everyday_banking: {
    eyebrow: "A simple place to start",
    title: "Set up everyday banking",
    description: "Explore an account for day-to-day spending, deposits, and recurring payments while you study.",
    action: "Explore everyday banking",
  },
  build_credit: {
    eyebrow: "Build your U.S. foundation",
    title: "Learn how U.S. credit works",
    description: "Start with UFCU’s credit-building education and compare options designed to help establish a U.S. credit record.",
    action: "Explore credit-building options",
  },
  save_for_tuition: {
    eyebrow: "Plan around school",
    title: "Create a tuition savings plan",
    description: "Use a dedicated savings account and recurring transfers to make tuition progress easier to see.",
    action: "Explore savings options",
  },
  emergency_fund: {
    eyebrow: "Build a financial cushion",
    title: "Start an emergency fund",
    description: "Choose a manageable savings target and automate small transfers to build it over time.",
    action: "Explore emergency savings",
  },
  finance_car: {
    eyebrow: "Prepare before you shop",
    title: "Understand auto financing",
    description: "Review budgeting and auto-loan education so you can compare the full cost of owning a car.",
    action: "Explore auto resources",
  },
  other: {
    eyebrow: "A starting point for your goal",
    title: "Talk through your next financial step",
    description: "Connect with UFCU to turn your goal into a practical starting plan.",
    action: "Connect with UFCU",
  },
};

export function buildRecommendations(
  profile: MemberProfile,
  goals: SavedFinancialGoals,
): FinancialRecommendation[] {
  return goals.selected.map((goal) => ({
    goal,
    ...goalCopy[goal],
    reasons: buildReasons(goal, profile, goals),
  }));
}

function buildReasons(
  goal: FinancialGoalId,
  profile: MemberProfile,
  goals: SavedFinancialGoals,
): RecommendationReason[] {
  const reasons: RecommendationReason[] = [selfReportedGoal(goal, goals)];

  if (goal === "build_credit") {
    addField(reasons, profile, "finances.internationalCreditHistory", "International credit history");
    addField(reasons, profile, "finances.historyLengthYears", "Credit history");
  }

  if (goal === "save_for_tuition") {
    addField(reasons, profile, "student.enrollment", "Enrollment");
    addField(reasons, profile, "student.programEnd", "Expected completion");
  }

  if (goal === "everyday_banking" || goal === "emergency_fund" || goal === "finance_car") {
    addField(reasons, profile, "student.school", "School");
    addField(reasons, profile, "student.enrollment", "Enrollment");
  }

  return reasons;
}

function selfReportedGoal(goal: FinancialGoalId, goals: SavedFinancialGoals): RecommendationReason {
  const configuredLabel = financialGoals.find((item) => item.id === goal)?.label ?? goal;
  const value = goal === "other" && goals.other ? goals.other : configuredLabel;
  return {
    field: "goals",
    label: "Goal",
    value,
    source: "self_reported",
    sourceLabel: "You told us",
    verified: false,
  };
}

function addField(
  reasons: RecommendationReason[],
  profile: MemberProfile,
  path: `student.${string}` | `finances.${string}`,
  label: string,
) {
  const [section, key] = path.split(".") as ["student" | "finances", string];
  const field = profile[section][key];
  if (!field) return;

  reasons.push({
    field: path,
    label,
    value: formatFieldValue(key, field.value),
    source: field.source,
    sourceLabel: field.sourceLabel ?? "Verified profile",
    verified: field.verified,
  });
}

function formatFieldValue(key: string, value: ProfileField["value"]) {
  if (typeof value === "boolean") return value ? "Connected" : "Not connected";
  if (key === "historyLengthYears") return `${value} years`;
  if (key === "programEnd" && typeof value === "string") {
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(
      new Date(`${value}T00:00:00Z`),
    );
  }
  return String(value);
}
