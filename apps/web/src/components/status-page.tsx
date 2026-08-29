import type { ReactNode } from "react";

/**
 * Shared shell for 404 and error states. Both render inside the root shell,
 * so they inherit the nav and footer and stay navigable rather than dropping
 * the visitor onto a dead end.
 */
export function StatusPage({
  code,
  title,
  children,
}: {
  code: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="py-20">
      <p className="font-medium font-mono text-[0.76rem] text-muted uppercase tracking-[0.14em]">
        {code}
      </p>
      <h1 className="mt-3 font-display font-semibold text-[clamp(1.9rem,4.6vw,2.5rem)] leading-tight tracking-tight">
        {title}
      </h1>
      <div className="mt-4 text-[1rem] text-body leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export function StatusActions({ children }: { children: ReactNode }) {
  return (
    <div className="mt-7 flex flex-wrap items-center gap-2.5">{children}</div>
  );
}

export const primaryAction =
  "rounded-md bg-ink px-4 py-2.5 font-medium text-[0.9rem] text-paper transition-opacity hover:opacity-88";

export const secondaryAction =
  "rounded-md border border-line-2 px-4 py-2.5 font-medium text-[0.9rem] text-ink transition-colors hover:border-accent";
