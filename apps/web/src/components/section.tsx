import type { ReactNode } from "react";

export function Container({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 mx-auto w-full max-w-measure px-7">
      {children}
    </div>
  );
}

export function Section({
  id,
  title,
  sub,
  children,
}: {
  id?: string;
  title: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-line border-t py-11">
      <h2 className="font-display font-semibold text-[1.25rem] tracking-tight">
        {title}
      </h2>
      {sub ? <p className="mt-1 text-[0.84rem] text-muted">{sub}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}
