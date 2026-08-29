import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Container } from "#/components/section";
import { SiteFooter } from "#/components/site-footer";
import { SiteNav } from "#/components/site-nav";
import { profile } from "#/data/profile";

import appCss from "../styles.css?url";

const description = `${profile.role} at ${profile.employer} in ${profile.location}. I build and own production systems end to end — C#/.NET and TypeScript on Azure.`;

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
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
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
