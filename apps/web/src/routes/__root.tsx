import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Container } from "#/components/section";
import { SiteFooter } from "#/components/site-footer";
import { SiteNav } from "#/components/site-nav";
import { profile } from "#/data/profile";

import appCss from "../styles.css?url";

const description = `${profile.role} at ${profile.employer} in ${profile.location}. I build and own production systems end to end — C#/.NET and TypeScript on Azure.`;

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: profile.url,
  image: `${profile.url}/og-image.jpg`,
  jobTitle: profile.role,
  worksFor: {
    "@type": "Organization",
    name: profile.employer,
    url: profile.employerUrl,
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: profile.university,
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Cincinnati",
    addressRegion: "OH",
    addressCountry: "US",
  },
  knowsAbout: [
    "C#",
    ".NET",
    "TypeScript",
    "React",
    "Microsoft Azure",
    "Distributed systems",
    "Multi-tenant architecture",
  ],
  sameAs: [profile.links.github, profile.links.linkedin],
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${profile.name} — ${profile.role}` },
      { name: "description", content: description },
      { property: "og:title", content: `${profile.name} — ${profile.role}` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: profile.name },
      { property: "og:locale", content: "en_US" },
      { name: "author", content: profile.name },
      { property: "og:url", content: profile.url },
      { property: "og:image", content: `${profile.url}/og-image.jpg` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: profile.avatarAlt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${profile.url}/og-image.jpg` },
    ],
    links: [
      { rel: "canonical", href: profile.url },
      // rel="me" is how Mastodon and similar tools verify a profile is really
      // yours: they follow the link back and look for a matching reference.
      { rel: "me", href: profile.links.github },
      { rel: "me", href: profile.links.linkedin },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      {
        rel: "icon",
        type: "image/png",
        sizes: "96x96",
        href: "/favicon-96x96.png",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      { rel: "stylesheet", href: appCss },
      // Fonts carry crossorigin even though they are same-origin: font
      // fetches are always CORS-mode, and without it the preload is discarded
      // and the file downloaded a second time.
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/inter-400-600-latin.woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/fraunces-600-latin.woff2",
        crossOrigin: "anonymous",
      },
    ],
    // schema.org Person, emitted through the head API rather than a raw
    // <script dangerouslySetInnerHTML>. This is what lets a search engine treat
    // "Spencer Will" as an entity with a job, an employer and verified
    // profiles, rather than a string that happens to appear on a page.
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(personSchema),
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/*
          Rendered here rather than via the route's `meta` array: the head
          manager dedupes by `name`, which collapses a light/dark theme-color
          pair down to whichever came last.
        */}
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#f7f5ee"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#0d120f"
        />
        <HeadContent />
      </head>
      <body>
        <SiteNav />
        <Container>
          {children}
          <SiteFooter />
        </Container>
        <Scripts />
      </body>
    </html>
  );
}
