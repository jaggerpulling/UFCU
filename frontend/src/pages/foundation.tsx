import { Card, Screen, SourceBadge } from "@/components";

export function FoundationPage() {
  return (
    <Screen
      eyebrow="App foundation"
      title="Your financial identity should move with you."
      description="The VERIFIED mobile shell, route structure, shared components, and design language are ready."
    >
      <Card className="border border-primary-subtle bg-canvas-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-primary">Foundation ready</p>
            <p className="mt-1 text-body-sm text-body">Feature workflows will be added in the next build phase.</p>
          </div>
          <SourceBadge variant="verified" label="Ready" />
        </div>
      </Card>
    </Screen>
  );
}
