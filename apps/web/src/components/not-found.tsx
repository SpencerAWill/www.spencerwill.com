import { Link } from "@tanstack/react-router";

import {
  primaryAction,
  StatusActions,
  StatusPage,
  secondaryAction,
} from "./status-page";

export function NotFound() {
  return (
    <StatusPage code="404" title="This page isn't on the map.">
      <p>
        The link might be out of date, or it may never have pointed anywhere.
        Either way, nothing lives at this address.
      </p>
      <StatusActions>
        <Link to="/" className={primaryAction}>
          Back to the homepage
        </Link>
        <a href="/#work" className={secondaryAction}>
          See selected work
        </a>
      </StatusActions>
    </StatusPage>
  );
}
