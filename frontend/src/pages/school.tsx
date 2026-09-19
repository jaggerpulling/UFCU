import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { routePaths } from "@/app/routes";
import { Button, Screen } from "@/components";
import {
  clearSchoolResult,
  clearSchoolSkipped,
  getPassportResult,
} from "@/features/profile/member-profile";
import {
  getSelectedSchool,
  saveSelectedSchool,
  schoolOptions,
  type SchoolOption,
} from "@/features/school/school-verification";

export function SchoolPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SchoolOption | null>(getSelectedSchool);
  const [hasIdentity] = useState(() => Boolean(getPassportResult()));

  const visibleSchools = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return schoolOptions;
    return schoolOptions.filter((school) =>
      [school.name, school.location, ...school.aliases]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalized),
    );
  }, [query]);

  if (!hasIdentity) return <Navigate to={routePaths.passport} replace />;

  function chooseSchool(school: SchoolOption) {
    setSelected(school);
    saveSelectedSchool(school);
    clearSchoolResult();
    clearSchoolSkipped();
  }

  return (
    <Screen
      eyebrow="Student information · Step 2"
      title="Where do you attend school?"
      description="Search for and select your school. You’ll review what is requested before verification begins."
      footer={
        <>
          <Button fullWidth disabled={!selected} onClick={() => navigate(routePaths.schoolAuthorization)}>
            Continue
            <span aria-hidden="true">→</span>
          </Button>
          <Button className="mt-3" fullWidth variant="secondary" onClick={() => navigate(routePaths.address)}>
            I’m not a student
          </Button>
        </>
      }
    >
      <label className="block">
        <span className="text-body-sm font-semibold text-primary">Search schools</span>
        <span className="relative mt-2 block">
          <SearchIcon />
          <input
            className="min-h-touch w-full rounded-md border border-primary-subtle bg-canvas py-3 pl-11 pr-4 text-body-md text-primary placeholder:text-mute"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try ACC, UT, or TXST"
            autoComplete="off"
          />
        </span>
      </label>

      <div className="mt-5" role="listbox" aria-label="Schools">
        <p className="mb-2 text-caption font-semibold uppercase tracking-[0.12em] text-mute">
          {query ? "Search results" : "Schools near Austin"}
        </p>
        <div className="space-y-2">
          {visibleSchools.map((school) => {
            const isSelected = selected?.id === school.id;
            return (
              <button
                key={school.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`flex min-h-touch w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                  isSelected
                    ? "border-secondary bg-secondary-subtle"
                    : "border-primary-subtle bg-canvas hover:bg-canvas-soft"
                }`}
                onClick={() => chooseSchool(school)}
              >
                <span className={`grid size-10 shrink-0 place-items-center rounded-md font-semibold ${
                  isSelected ? "bg-secondary text-white" : "bg-primary text-white"
                }`} aria-hidden="true">
                  {school.aliases[0].slice(0, 2)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-primary">{school.name}</span>
                  <span className="mt-0.5 block text-caption text-mute">{school.location}</span>
                </span>
                <span className={`grid size-6 shrink-0 place-items-center rounded-full border ${
                  isSelected ? "border-secondary bg-secondary text-white" : "border-primary-subtle"
                }`} aria-hidden="true">
                  {isSelected ? "✓" : ""}
                </span>
              </button>
            );
          })}
          {visibleSchools.length === 0 ? (
            <p className="rounded-lg bg-canvas-soft p-5 text-center text-body-sm text-body">
              No demo schools match that search.
            </p>
          ) : null}
        </div>
      </div>
    </Screen>
  );
}

function SearchIcon() {
  return (
    <svg className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-mute" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}
