import { profile } from "#/data/profile";
import { OutboundLink } from "./outbound-link";

/**
 * Anchors rather than routes: the site is one page today. When /work and
 * /about exist these become <Link>s.
 */
const links = [
  { href: "#work", label: "Work" },
  { href: "#background", label: "Background" },
  { href: "#toolkit", label: "Toolkit" },
];

export function SiteNav() {
  return (
    <nav className="sticky top-0 z-30 border-line border-b bg-paper/85 backdrop-blur-md">
      <div className="relative z-10 mx-auto flex w-full max-w-measure items-center gap-5 px-7 py-4">
        <a
          href="/"
          className="mr-auto font-display font-semibold text-[1.03rem] text-ink tracking-tight"
        >
          {profile.name}
        </a>
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="hidden text-[0.9rem] text-body transition-colors hover:text-accent sm:inline"
          >
            {link.label}
          </a>
        ))}
        <OutboundLink
          href={profile.links.resume}
          className="text-[0.9rem] text-body transition-colors hover:text-accent"
        >
          Résumé
        </OutboundLink>
      </div>
    </nav>
  );
}
