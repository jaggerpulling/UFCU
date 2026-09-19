import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "@/components";
import { NotFoundPage } from "@/pages/not-found";
import { PassportPage } from "@/pages/passport";
import { CreditConnectPage } from "@/pages/credit-connect";
import { CreditPage } from "@/pages/credit";
import { RoutePlaceholder } from "@/pages/route-placeholder";
import { SchoolAuthorizationPage } from "@/pages/school-authorization";
import { SchoolPage } from "@/pages/school";
import { WelcomePage } from "@/pages/welcome";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <WelcomePage /> },
      { path: "passport", element: <PassportPage /> },
      { path: "school", element: <SchoolPage /> },
      { path: "school/authorize", element: <SchoolAuthorizationPage /> },
      { path: "credit", element: <CreditPage /> },
      { path: "credit/connect", element: <CreditConnectPage /> },
      { path: "profile", element: <RoutePlaceholder stage="Profile" title="Your VERIFIED profile" /> },
      { path: "membership-ready", element: <RoutePlaceholder stage="Complete" title="Membership ready" /> },
      { path: "goals", element: <RoutePlaceholder stage="Your goals" title="What would you like UFCU to help you with?" /> },
      { path: "guide", element: <RoutePlaceholder stage="Your next step" title="Personalized Financial Guide" /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
