import { Screen } from "@/components";

export interface RoutePlaceholderProps {
  title: string;
  stage: string;
}

export function RoutePlaceholder({ title, stage }: RoutePlaceholderProps) {
  return (
    <Screen eyebrow={stage} title={title} description="This screen is part of the application route map and is ready for its feature implementation." />
  );
}
