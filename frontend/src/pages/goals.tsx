import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { routePaths } from "@/app/routes";
import { Button } from "@/components";
import {
  financialGoals,
  getFinancialGoals,
  saveFinancialGoals,
  type FinancialGoalId,
} from "@/features/profile/member-profile";

export function GoalsPage() {
  const navigate = useNavigate();
  const initialGoals = useMemo(() => getFinancialGoals(), []);
  const [selected, setSelected] = useState<FinancialGoalId[]>(initialGoals.selected);
  const [other, setOther] = useState(initialGoals.other ?? "");
  const needsOther = selected.includes("other");
  const canContinue = selected.length > 0 && (!needsOther || other.trim().length > 0);

  function toggleGoal(goal: FinancialGoalId) {
    setSelected((current) => current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal]);
  }

  function continueToGuide() {
    if (!canContinue) return;
    saveFinancialGoals({ selected, ...(needsOther ? { other } : {}) });
    navigate(routePaths.guide);
  }

  return (
    <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <div className="flex-1">
        <p className="text-caption font-semibold uppercase tracking-[0.16em] text-mute">Your goals</p>
        <h1 className="mt-3 font-display text-display-md text-primary">What would you like UFCU to help you with?</h1>
        <p className="mt-3 text-body-md text-body">Choose all that apply. Your answers shape your guide and are saved as self-reported profile details.</p>

        <fieldset className="mt-7">
          <legend className="sr-only">Select your financial goals</legend>
          <div className="space-y-3">
            {financialGoals.map((goal) => {
              const checked = selected.includes(goal.id);
              return (
                <label
                  key={goal.id}
                  className={`flex min-h-[4.25rem] cursor-pointer items-center gap-4 rounded-lg border px-4 py-3.5 transition-colors ${
                    checked ? "border-secondary bg-secondary-subtle" : "border-primary-subtle bg-canvas hover:bg-canvas-soft"
                  }`}
                >
                  <input
                    className="sr-only"
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleGoal(goal.id)}
                  />
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-md border text-sm font-bold ${
                      checked ? "border-secondary bg-secondary text-white" : "border-primary-lighter bg-white text-transparent"
                    }`}
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <span className="flex-1 text-body-md font-semibold text-primary">{goal.label}</span>
                  <GoalIcon goal={goal.id} selected={checked} />
                </label>
              );
            })}
          </div>
        </fieldset>

        {needsOther ? (
          <div className="mt-4">
            <label htmlFor="other-goal" className="text-body-sm font-semibold text-primary">Tell us what you’re working toward</label>
            <input
              id="other-goal"
              value={other}
              onChange={(event) => setOther(event.target.value)}
              maxLength={100}
              placeholder="e.g. Send money home"
              className="mt-2 min-h-touch w-full rounded-md border border-primary-subtle bg-white px-4 py-3 text-body-md text-ink placeholder:text-mute"
            />
          </div>
        ) : null}

        <p className="mt-5 flex items-center gap-2 text-caption text-mute">
          <span aria-hidden="true">◇</span>
          You can update these goals anytime.
        </p>
      </div>

      <div className="sticky bottom-0 mt-7 bg-canvas pb-2 pt-4">
        <Button fullWidth disabled={!canContinue} onClick={continueToGuide}>
          Build my financial guide
          <span aria-hidden="true">→</span>
        </Button>
      </div>
    </section>
  );
}

function GoalIcon({ goal, selected }: { goal: FinancialGoalId; selected: boolean }) {
  const symbols: Record<FinancialGoalId, string> = {
    everyday_banking: "$",
    build_credit: "↗",
    save_for_tuition: "A",
    emergency_fund: "+",
    finance_car: "◇",
    other: "…",
  };
  return (
    <span className={`grid size-9 shrink-0 place-items-center rounded-full font-data text-sm ${selected ? "bg-white text-secondary-darker" : "bg-canvas-soft text-primary"}`} aria-hidden="true">
      {symbols[goal]}
    </span>
  );
}
