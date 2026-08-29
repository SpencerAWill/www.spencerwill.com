import type { ReactNode } from "react";

/**
 * Anything that leaves the page opens in a new tab — other origins, and the
 * résumé PDF. In-page anchors and mailto:/tel: stay put: handing those a
 * target would either break same-page navigation or strand the visitor on a
 * blank tab once their mail client takes over.
 */
const STAYS_IN_TAB = /^(#|mailto:|tel:|\/$)/;

export function opensInNewTab(href: string) {
  return !STAYS_IN_TAB.test(href);
}

export function OutboundLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  if (!opensInNewTab(href)) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      className={className}
      target="_blank"
      // noopener alone, deliberately: it closes the tabnabbing hole, while
      // omitting noreferrer keeps the referrer header so GitHub and LinkedIn
      // can still attribute the traffic to this site.
      rel="noopener"
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
