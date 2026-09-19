import { useNavigate } from "react-router-dom";

import { routePaths } from "@/app/routes";
import { Button, Screen } from "@/components";

export function SchoolPage() {
  const navigate = useNavigate();

  return (
    <Screen
      eyebrow="Student information · Step 2"
      title="Verify your student information"
      description="Connect your school so we can confirm your enrollment instead of asking you to upload documents manually."
      footer={
        <Button fullWidth onClick={() => navigate(routePaths.schoolAuthorization)}>
          Continue with ACC
          <span aria-hidden="true">→</span>
        </Button>
      }
    >
      <div className="rounded-lg border border-primary-subtle bg-canvas-soft p-5">
        <div className="flex items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-md bg-primary font-display text-display-sm text-white" aria-hidden="true">
            A
          </div>
          <div>
            <h2 className="font-semibold text-primary">Austin Community College</h2>
            <p className="mt-1 text-body-sm text-body">Secure demo connection</p>
          </div>
        </div>
        <div className="mt-5 border-t border-primary-subtle pt-4">
          <p className="flex gap-2 text-body-sm text-body">
            <ShieldIcon />
            You choose when verification starts. No school password is collected by VERIFIED.
          </p>
        </div>
      </div>

      <p className="mt-4 text-center text-caption text-mute">Simulated for this prototype · No real ACC account is accessed</p>
    </Screen>
  );
}

function ShieldIcon() {
  return (
    <svg className="mt-0.5 size-4 shrink-0 text-positive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
