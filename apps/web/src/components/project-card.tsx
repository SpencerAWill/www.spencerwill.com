import type { Project } from "#/data/profile";
import { OutboundLink } from "./outbound-link";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="border-line border-b py-5 last:border-b-0 last:pb-0">
      <h3 className="font-semibold text-[1.03rem] tracking-tight">
        {project.href ? (
          <OutboundLink
            href={project.href}
            className="text-ink transition-colors hover:text-accent"
          >
            {project.title}
          </OutboundLink>
        ) : (
          project.title
        )}
      </h3>
      <p className="mt-0.5 text-[0.84rem] text-muted">{project.meta}</p>

      {project.metrics ? (
        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {project.metrics.map((metric) => (
            <div key={metric.label}>
              <dt className="sr-only">{metric.label}</dt>
              <dd className="font-display font-semibold text-[1.25rem] text-accent leading-tight">
                {metric.value}
              </dd>
              <dd className="text-[0.75rem] text-muted">{metric.label}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <p className="mt-3 text-[0.94rem] text-body leading-relaxed">
        {project.body}
      </p>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <li
            key={tag}
            className="rounded bg-sunk px-2 py-0.5 font-medium font-mono text-[0.72rem] text-body"
          >
            {tag}
          </li>
        ))}
      </ul>
    </article>
  );
}
