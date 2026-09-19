import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "@/components";
import { FoundationPage } from "@/pages/foundation";
import { NotFoundPage } from "@/pages/not-found";
import { RoutePlaceholder } from "@/pages/route-placeholder";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <FoundationPage /> },
      { path: "passport", element: <RoutePlaceholder stage="Identity" title="Establish your identity" /> },
      { path: "school", element: <RoutePlaceholder stage="Student information" title="Connect your school" /> },
      { path: "school/authorize", element: <RoutePlaceholder stage="Student information" title="Verify your student information" /> },
      { path: "credit", element: <RoutePlaceholder stage="Financial history" title="Bring your credit history with you" /> },
      { path: "credit/connect", element: <RoutePlaceholder stage="Financial history" title="Connect international credit history" /> },
      { path: "profile", element: <RoutePlaceholder stage="Profile" title="Your VERIFIED profile" /> },
      { path: "membership-ready", element: <RoutePlaceholder stage="Complete" title="Membership ready" /> },
      { path: "goals", element: <RoutePlaceholder stage="Your goals" title="What would you like UFCU to help you with?" /> },
      { path: "guide", element: <RoutePlaceholder stage="Your next step" title="Personalized Financial Guide" /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
