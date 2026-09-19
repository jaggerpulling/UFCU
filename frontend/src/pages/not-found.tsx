import { Link } from "react-router-dom";

import { Screen } from "@/components";

export function NotFoundPage() {
  return (
    <Screen eyebrow="404" title="That page isn't here." description="Return to the VERIFIED app foundation.">
      <Link className="font-semibold text-primary underline decoration-primary-lighter underline-offset-4" to="/">
        Back to start
      </Link>
    </Screen>
  );
}
