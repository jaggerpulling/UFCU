import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "@/components";
import { NotFoundPage } from "@/pages/not-found";
import { PassportPage } from "@/pages/passport";
import { LivenessPage } from "@/pages/liveness";
import { ProfilePage } from "@/pages/profile";
import { MembershipReadyPage } from "@/pages/membership-ready";
import { CreditConnectPage } from "@/pages/credit-connect";
import { CreditPage } from "@/pages/credit";
import { GoalsPage } from "@/pages/goals";
import { GuidePage } from "@/pages/guide";
import { SchoolAuthorizationPage } from "@/pages/school-authorization";
import { SchoolPage } from "@/pages/school";
import { WelcomePage } from "@/pages/welcome";
import { SocureConsentPage } from "@/pages/socure-consent";
import { DocuSignDemoPage } from "@/pages/docusign-demo";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <WelcomePage /> },
      { path: "passport", element: <PassportPage /> },
      { path: "identity/verify", element: <SocureConsentPage /> },
      { path: "liveness", element: <LivenessPage /> },
      { path: "school", element: <SchoolPage /> },
      { path: "school/authorize", element: <SchoolAuthorizationPage /> },
      { path: "credit", element: <CreditPage /> },
      { path: "credit/connect", element: <CreditConnectPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "membership-ready", element: <MembershipReadyPage /> },
      { path: "docusign-demo", element: <DocuSignDemoPage /> },
      { path: "goals", element: <GoalsPage /> },
      { path: "guide", element: <GuidePage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
