import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { routePaths } from "@/app/routes";
import { Button, SourceBadge } from "@/components";
import { getMemberProfile, type ProfileField } from "@/features/profile/member-profile";

const fieldLabels: Record<string, string> = {
  name: "Name",
  dateOfBirth: "Date of birth",
  nationality: "Nationality",
  passport: "Passport",
  school: "School",
  enrollment: "Enrollment",
  program: "Program",
  programEnd: "Expected completion",
  internationalCreditHistory: "International credit history",
  reportStatus: "Credit profile",
  historyLengthYears: "Credit history",
  activeAccounts: "Active accounts",
  paymentHistory: "Payment history",
  reportedDelinquencies: "Reported delinquencies",
};

const fieldOrder = Object.keys(fieldLabels);

export function ProfilePage() {
  const navigate = useNavigate();
  const profile = useMemo(() => getMemberProfile(), []);
  const sourceCount = new Set(
    [...Object.values(profile.identity), ...Object.values(profile.student), ...Object.values(profile.finances)]
      .map((field) => field.source),
  ).size;

  return (
    <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.16em] text-positive">Profile assembled</p>
            <h1 className="mt-2 font-display text-display-md text-primary">Your VERIFIED profile</h1>
          </div>
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-secondary text-white verified-pop" aria-hidden="true">
            <VerifiedProfileIcon />
          </div>
        </div>
        <p className="mt-3 text-body-md text-body">One profile, built from the trusted sources you chose to connect.</p>

        <div className="mt-6 flex items-center gap-3 rounded-lg bg-primary px-4 py-4 text-white">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 font-data text-data-md">{sourceCount}</div>
          <div>
            <p className="font-semibold">{sourceCount} sources brought together</p>
            <p className="mt-0.5 text-caption text-white/70">Every profile value shows where it came from.</p>
          </div>
        </div>

        <div className="mt-7 space-y-5">
          <ProfileSection title="Identity" description="Established from your passport" fields={profile.identity} />
          <ProfileSection title="Student" description="Confirmed with your school" fields={profile.student} />
          <ProfileSection title="Financial history" description="Connected with your permission" fields={profile.finances} />
        </div>

        <div className="mt-6 rounded-md bg-canvas-soft p-4">
          <p className="flex items-start gap-2 text-caption text-body">
            <LockIcon />
            These are synthetic demo details. VERIFIED keeps the source attached as information moves through onboarding.
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 mt-7 bg-canvas pb-2 pt-4">
        <Button fullWidth onClick={() => navigate(routePaths.membershipReady)}>
          Continue
          <span aria-hidden="true">→</span>
        </Button>
      </div>
    </section>
  );
}

function ProfileSection({
  title,
  description,
  fields,
}: {
  title: string;
  description: string;
  fields: Record<string, ProfileField>;
}) {
  const entries = Object.entries(fields).sort(([left], [right]) => fieldOrder.indexOf(left) - fieldOrder.indexOf(right));

  return (
    <section className="overflow-hidden rounded-lg border border-primary-subtle bg-canvas" aria-label={title}>
      <div className="flex items-center justify-between gap-4 bg-canvas-soft px-4 py-3.5">
        <div>
          <h2 className="font-display text-display-sm text-primary">{title}</h2>
          <p className="mt-0.5 text-caption text-mute">{description}</p>
        </div>
        <span className="grid size-7 place-items-center rounded-full bg-positive-subtle text-sm font-semibold text-positive" aria-hidden="true">✓</span>
      </div>
      <dl className="divide-y divide-primary-subtle">
        {entries.map(([key, field]) => (
          <ProfileFieldRow key={key} fieldKey={key} field={field} />
        ))}
      </dl>
    </section>
  );
}

function ProfileFieldRow({ fieldKey, field }: { fieldKey: string; field: ProfileField }) {
  const variant = field.source === "self_reported" ? "self-reported" : field.source === "inferred" ? "inferred" : "verified";

  return (
    <div className="px-4 py-3.5">
      <dt className="text-caption font-semibold uppercase tracking-[0.08em] text-mute">{fieldLabels[fieldKey] ?? fieldKey}</dt>
      <dd className="mt-1.5 font-data text-data-md text-primary">{formatValue(fieldKey, field.value)}</dd>
      <dd className="mt-2">
        <SourceBadge variant={variant} label={field.sourceLabel ?? sourceName(field.source)} />
      </dd>
    </div>
  );
}

function formatValue(key: string, value: ProfileField["value"]) {
  if (typeof value === "boolean") return value ? "Connected" : "Not connected";
  if ((key === "dateOfBirth" || key === "programEnd") && typeof value === "string") {
    return new Intl.DateTimeFormat("en-US", {
      day: key === "dateOfBirth" ? "numeric" : undefined,
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${value}T00:00:00Z`));
  }
  if (key === "historyLengthYears") return `${value} years`;
  return String(value);
}

function sourceName(source: ProfileField["source"]) {
  const labels: Record<ProfileField["source"], string> = {
    passport: "Passport",
    school: "School",
    nova_credit: "Nova Credit",
    self_reported: "You told us",
    inferred: "Inferred",
    demo: "Demo data",
  };
  return labels[source];
}

function VerifiedProfileIcon() {
  return (
    <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="mt-0.5 size-4 shrink-0 text-positive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
