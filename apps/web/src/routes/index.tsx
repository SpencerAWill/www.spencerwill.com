import { createFileRoute } from "@tanstack/react-router";
import { OutboundLink } from "#/components/outbound-link";
import { ProjectCard } from "#/components/project-card";
import { Section } from "#/components/section";
import { YearStack } from "#/components/year-stack";
import { profile, projects, skills } from "#/data/profile";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <>
      {/*
        First screen carries the six things recruiters are documented to hunt
        for in the first pass — name, title, employer, location, contact, and a
        one-line claim — in a single column, above everything else.
      */}
      <header className="pt-14 pb-5">
        <img
          src={profile.avatar}
          alt={profile.avatarAlt}
          width={80}
          height={80}
          className="mb-5 size-20 rounded-full border border-line object-cover"
        />
        <h1 className="font-display font-semibold text-[clamp(2.1rem,5.4vw,2.9rem)] tracking-tight leading-[1.1]">
          {profile.name}
        </h1>
        <p className="mt-3 text-[1rem] text-body">
          <span className="font-semibold text-ink">{profile.role}</span>
          <span className="mx-2 text-muted">·</span>
          {profile.employer}
          <span className="mx-2 text-muted">·</span>
          {profile.location}
        </p>
        <p className="mt-5 text-[1.09rem] text-ink leading-relaxed">
          {profile.summary[0]}
        </p>
        <p className="mt-3 text-[1rem] text-body leading-relaxed">
          {profile.summary[1]}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <OutboundLink
            href={profile.links.resume}
            className="rounded-md bg-ink px-4 py-2.5 font-medium text-[0.9rem] text-paper transition-opacity hover:opacity-88"
          >
            Résumé (PDF)
          </OutboundLink>
          <OutboundLink
            href={profile.links.github}
            className="rounded-md border border-line-2 px-4 py-2.5 font-medium text-[0.9rem] text-ink transition-colors hover:border-accent"
          >
            GitHub
          </OutboundLink>
          <a
            href={`mailto:${profile.email}`}
            className="font-medium font-mono text-[0.87rem] text-body transition-colors hover:text-accent"
          >
            {profile.email}
          </a>
        </div>
      </header>

      <Section
        id="work"
        title="Selected work"
        sub="Four systems, all in production."
      >
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </Section>

      <Section
        id="background"
        title="Background"
        sub="What overlapped, year by year."
      >
        <YearStack />
      </Section>

      <Section id="toolkit" title="Technical skills">
        <dl className="grid grid-cols-1 gap-x-5 gap-y-1 sm:grid-cols-[6.5rem_1fr] sm:gap-y-3">
          {skills.map((row) => (
            <div key={row.label} className="contents">
              <dt className="pt-2.5 font-medium font-mono text-[0.75rem] text-muted sm:pt-0.5">
                {row.label}
              </dt>
              <dd className="text-[0.9rem] text-body leading-normal">
                {row.segments.map((segment, index) => (
                  <span key={segment.text}>
                    {index > 0 ? " " : null}
                    {segment.strong ? (
                      <span className="font-semibold text-ink">
                        {segment.text}
                      </span>
                    ) : (
                      segment.text
                    )}
                    {segment.strong ? " —" : null}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Leadership">
        <p className="text-[0.94rem] text-body leading-relaxed">
          {profile.leadership}
        </p>
      </Section>
    </>
  );
}
