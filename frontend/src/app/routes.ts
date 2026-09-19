export const routePaths = {
  welcome: "/",
  passport: "/passport",
  liveness: "/liveness",
  school: "/school",
  schoolAuthorization: "/school/authorize",
  credit: "/credit",
  creditConnection: "/credit/connect",
  profile: "/profile",
  membershipReady: "/membership-ready",
  goals: "/goals",
  guide: "/guide",
} as const;

export type RouteKey = keyof typeof routePaths;
