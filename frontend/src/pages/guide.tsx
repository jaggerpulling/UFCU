import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { routePaths } from "@/app/routes";
import { Button, SourceBadge } from "@/components";
import { buildRecommendations, type FinancialRecommendation } from "@/features/guidance/recommendations";
import { getFinancialGoals, getMemberProfile } from "@/features/profile/member-profile";

export function GuidePage() {
  const navigate = useNavigate();
  const recommendations = useMemo(
    () => buildRecommendations(getMemberProfile(), getFinancialGoals()),
    [],
  );

  if (recommendations.length === 0) {
    return (
      <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
        <div className="flex-1">
          <p className="text-caption font-semibold uppercase tracking-[0.16em] text-mute">Your starting point</p>
          <h1 className="mt-3 font-display text-display-md text-primary">Choose a goal to build your guide.</h1>
          <p className="mt-3 text-body-md text-body">We only recommend a starting point after you tell us what you want help with.</p>
        </div>
        <div className="sticky bottom-0 mt-7 bg-canvas pb-2 pt-4">
          <Button fullWidth onClick={() => navigate(routePaths.goals)}>Choose my goals</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.16em] text-positive">Built from your profile</p>
            <h1 className="mt-2 font-display text-display-md text-primary">Your UFCU Starting Point</h1>
          </div>
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary-subtle text-secondary-darker" aria-hidden="true">✦</span>
        </div>
        <p className="mt-3 text-body-md text-body">A personalized guide based on the goals and profile information you shared.</p>

        <div className="mt-7 space-y-4">
          {recommendations.map((recommendation, index) => (
            <RecommendationCard key={recommendation.goal} recommendation={recommendation} featured={index === 0} />
          ))}
        </div>

        <div className="mt-6 rounded-md border border-primary-subtle bg-canvas px-4 py-4">
          <p className="text-caption text-body">
            This guide is educational and does not determine eligibility, approval, or account opening. A UFCU representative can help you evaluate specific products.
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 mt-7 space-y-3 bg-canvas pb-2 pt-4">
        <Button fullWidth onClick={() => navigate(routePaths.welcome)}>Finish</Button>
        <Button fullWidth variant="secondary" onClick={() => navigate(routePaths.goals)}>Update my goals</Button>
      </div>
    </section>
  );
}

function RecommendationCard({ recommendation, featured }: { recommendation: FinancialRecommendation; featured: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const panelId = `why-${recommendation.goal}`;

  return (
    <article className={`overflow-hidden rounded-lg border ${featured ? "border-secondary" : "border-primary-subtle"} bg-canvas-soft`}>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-caption font-semibold uppercase tracking-[0.12em] text-mute">{recommendation.eyebrow}</p>
          {featured ? <span className="rounded-full bg-secondary-subtle px-2.5 py-1 text-caption font-semibold text-secondary-darkest">Top goal</span> : null}
        </div>
        <h2 className="mt-2 font-display text-display-sm text-primary">{recommendation.title}</h2>
        <p className="mt-2 text-body-md text-body">{recommendation.description}</p>
        <button type="button" className="mt-4 inline-flex items-center gap-2 text-body-sm font-semibold text-primary underline decoration-primary-subtle underline-offset-4">
          {recommendation.action}
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <div className="border-t border-primary-subtle bg-white">
        <button
          type="button"
          className="flex min-h-touch w-full items-center justify-between gap-3 px-5 py-3 text-left text-body-sm font-semibold text-primary"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((value) => !value)}
        >
          Why am I seeing this?
          <span className={`text-lg transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true">⌄</span>
        </button>
        {expanded ? (
          <div id={panelId} className="border-t border-primary-subtle px-5 py-4">
            <p className="text-caption font-semibold uppercase tracking-[0.12em] text-mute">Supporting profile fields</p>
            <ul className="mt-3 space-y-4">
              {recommendation.reasons.map((reason) => (
                <li key={reason.field} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-caption font-semibold text-mute">{reason.label}</p>
                    <p className={reason.verified ? "mt-0.5 font-data text-data-sm text-primary" : "mt-0.5 text-body-sm text-primary"}>{reason.value}</p>
                  </div>
                  <SourceBadge
                    variant={reason.source === "self_reported" ? "self-reported" : reason.source === "inferred" ? "inferred" : "verified"}
                    label={reason.sourceLabel}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}
