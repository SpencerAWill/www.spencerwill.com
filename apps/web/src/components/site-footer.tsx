import { profile } from "#/data/profile";
import { OutboundLink } from "./outbound-link";

export function SiteFooter() {
  const links = [
    { href: `mailto:${profile.email}`, label: "Email" },
    { href: profile.links.github, label: "GitHub" },
    { href: profile.links.linkedin, label: "LinkedIn" },
    { href: profile.links.resume, label: "Résumé" },
  ];

  return (
    <footer className="border-line border-t py-10 pb-20 text-[0.9rem] text-body">
      <ul className="flex flex-wrap gap-4">
        {links.map((link) => (
          <li key={link.label}>
            <OutboundLink
              href={link.href}
              className="text-accent hover:underline"
            >
              {link.label}
            </OutboundLink>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[0.81rem] text-muted">
        © {new Date().getFullYear()} {profile.name}. Built with TanStack Start
        on Cloudflare.
      </p>
    </footer>
  );
}
