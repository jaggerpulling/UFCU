export const routePaths = {
  welcome: "/",
  passport: "/passport",
  socureConsent: "/identity/verify",
  liveness: "/liveness",
  school: "/school",
  schoolAuthorization: "/school/authorize",
  address: "/address",
  credit: "/credit",
  creditConnection: "/credit/connect",
  profile: "/profile",
  membershipReady: "/membership-ready",
  docusignDemo: "/docusign-demo",
  goals: "/goals",
  guide: "/guide",
} as const;

export type RouteKey = keyof typeof routePaths;
