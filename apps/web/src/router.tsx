import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import { ErrorPage } from "#/components/error-page";
import { NotFound } from "#/components/not-found";

import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    // Set on the router rather than per route, so any route added later
    // inherits both instead of falling back to the framework defaults.
    defaultNotFoundComponent: NotFound,
    defaultErrorComponent: ErrorPage,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
