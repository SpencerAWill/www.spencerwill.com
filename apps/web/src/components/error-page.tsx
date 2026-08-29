import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

import {
  primaryAction,
  StatusActions,
  StatusPage,
  secondaryAction,
} from "./status-page";

export function ErrorPage({ error, reset }: ErrorComponentProps) {
  return (
    <StatusPage code="Error" title="Something went wrong.">
      <p>
        This one is on me, not you. Retrying sometimes clears it; if it keeps
        happening I'd genuinely like to know.
      </p>

      {/*
        Message shown in development only. In production an exception can carry
        internals -- query fragments, paths, upstream responses -- and a public
        error page is the wrong place to print them.
      */}
      {import.meta.env.DEV ? (
        <pre className="mt-5 overflow-x-auto rounded-md border border-line bg-sunk p-3 font-mono text-[0.76rem] text-body">
          {error.message}
        </pre>
      ) : null}

      <StatusActions>
        <button type="button" onClick={reset} className={primaryAction}>
          Try again
        </button>
        <Link to="/" className={secondaryAction}>
          Back to the homepage
        </Link>
      </StatusActions>
    </StatusPage>
  );
}
