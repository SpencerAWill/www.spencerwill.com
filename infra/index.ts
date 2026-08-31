import * as cloudflare from "@pulumi/cloudflare";
import * as pulumi from "@pulumi/pulumi";

/**
 * Cloudflare resources for www.spencerwill.com.
 *
 * Deliberately small. The site is server-rendered but stateless -- no database,
 * no object storage, no KV, no email -- so the only things worth declaring are
 * the two hostnames and the rule that collapses one into the other. Everything
 * that makes the worker itself exist is wrangler's job (see
 * `apps/web/wrangler.jsonc`).
 *
 * That split imposes an ordering constraint worth stating plainly, because
 * getting it backwards produces a confusing first-run failure:
 *
 *   `wrangler deploy` must run BEFORE `pulumi up`.
 *
 * `WorkersCustomDomain` binds a hostname to a Worker *by name*, and Cloudflare
 * rejects the binding if no script by that name exists yet. Nothing here
 * produces a value the worker needs at build time, so the dependency runs in
 * exactly one direction and `.github/workflows/deploy.yml` orders the jobs to
 * match.
 *
 * ---- Migrating off the previous site ----
 *
 * Before this program was written, both `spencerwill.com` and
 * `www.spencerwill.com` were Custom Domains on a single hand-uploaded worker
 * named `static-website`, and the www -> apex 301 was implemented in that
 * worker's own code -- there was no redirect rule and no CNAME. Two consequences
 * that are not obvious from reading the resources below:
 *
 *   1. `static-website` is deleted outright as part of the cutover, which
 *      releases both hostnames and deletes their DNS records in one action.
 *      Cloudflare will not attach a hostname that already has a Custom Domain,
 *      and it refuses to create a Custom Domain on a hostname carrying a
 *      conflicting DNS record, so nothing below can be created until it is gone.
 *      Nothing is imported into this stack: every resource here is created new.
 *   2. The redirect moves from worker code into a Rules-engine redirect, so www
 *      no longer costs a worker invocation and no longer depends on any script
 *      staying deployed.
 *
 * The apex is unavailable between that deletion and the end of the next deploy.
 * There is no way to overlap the two -- one hostname, one owner.
 *
 * The zone also carries apex MX (Cloudflare Email Routing), SPF, DMARC, and DKIM
 * records, plus every ucmc.spencerwill.com record. None are managed here and
 * none are touched: this program only ever addresses its own two hostnames.
 */

const cfg = new pulumi.Config();

const accountId = cfg.require("accountId");
const zoneId = cfg.require("zoneId");
const zoneName = cfg.require("zoneName");
const hostname = cfg.require("hostname");
const redirectHostname = cfg.require("redirectHostname");
const workerName = cfg.require("workerName");

const stack = pulumi.getStack();

// Binds the apex to the Worker. Cloudflare provisions the proxied DNS record
// and the edge certificate implicitly -- there is no `cloudflare.DnsRecord` for
// the apex here, and adding one would fight this resource for ownership of the
// same record.
//
// A custom domain is the right primitive rather than a Worker *route*: routes
// layer a worker over an existing origin and inherit that origin's DNS, while a
// custom domain makes the worker the origin. There is no other origin here.
const apexDomain = new cloudflare.WorkersCustomDomain(
  `spencerwill-web-${stack}-apex`,
  {
    accountId,
    zoneId,
    zoneName,
    hostname,
    service: workerName,
  },
);

// `www` has to resolve, and has to be proxied, for the redirect below to exist
// at all: a dynamic redirect is evaluated by Cloudflare's edge, and the edge
// only sees traffic for a hostname that has an orange-clouded record. An
// unproxied record (or no record) means the browser never reaches a machine
// that knows about the rule, and the user gets NXDOMAIN or the origin directly.
//
// This replaces a Custom Domain binding on the old `static-website` worker (see
// the header comment). A plain proxied record is the cheaper primitive: the
// redirect happens in the Rules engine, so www never starts a worker.
//
// CNAME to the apex rather than duplicating the apex's A/AAAA addresses --
// those belong to the Worker custom domain above and can change without notice.
// Cloudflare resolves CNAME-at-apex targets internally, so pointing a subdomain
// at the zone apex is well-defined here even though the record never has to be
// followed by a public resolver: proxied records answer with Cloudflare's own
// anycast addresses regardless of content.
//
// `ttl: 1` means "automatic" and is the only value Cloudflare accepts on a
// proxied record; a literal TTL is rejected.
const wwwRecord = new cloudflare.DnsRecord(`spencerwill-web-${stack}-www`, {
  zoneId,
  name: redirectHostname,
  type: "CNAME",
  content: hostname,
  proxied: true,
  ttl: 1,
  comment: "Managed by Pulumi (spencerwill-infra). Redirects to the apex.",
});

// Collapses www onto the apex with a permanent redirect, so exactly one
// hostname is canonical and search engines are told which.
//
// The target is an `expression` rather than a plain `value` because a plain
// value is the *entire* destination URL -- every path would land on the
// homepage, silently turning deep links into a soft 404. `concat` rebuilds the
// path; `preserveQueryString` carries the query separately (it is not part of
// `http.request.uri.path`).
//
// 301 rather than 302: this is a permanent statement about which hostname owns
// the content, and it is what lets the redirect be cached and link equity be
// passed. It is also the expensive one to get wrong -- browsers cache 301s
// aggressively, so flipping canonical hostnames later means users who visited
// during this period keep redirecting until their cache expires.
//
// `kind: "zone"` with `phase: "http_request_dynamic_redirect"` is the Rules
// engine's single-redirect entry point. Cloudflare allows exactly one ruleset
// per zone per phase, so this resource owns the zone's entire dynamic-redirect
// list: any rule added by hand in the dashboard will be removed on the next
// `pulumi up`. Add rules to the array below instead.
const redirectRuleset = new cloudflare.Ruleset(
  `spencerwill-web-${stack}-www-redirect`,
  {
    zoneId,
    kind: "zone",
    phase: "http_request_dynamic_redirect",
    name: "Redirect www to apex",
    description: "Managed by Pulumi (spencerwill-infra).",
    rules: [
      {
        ref: "www_to_apex",
        description: `Permanent redirect ${redirectHostname} -> ${hostname}`,
        enabled: true,
        expression: `(http.host eq "${redirectHostname}")`,
        action: "redirect",
        actionParameters: {
          fromValue: {
            statusCode: 301,
            targetUrl: {
              expression: `concat("https://${hostname}", http.request.uri.path)`,
            },
            preserveQueryString: true,
          },
        },
      },
    ],
  },
  // The rule matches on `http.host`, which only produces traffic once the
  // record exists. Creating them in the other order leaves a window where the
  // rule is live and unreachable -- harmless, but the explicit dependency makes
  // `pulumi preview` show the two as the single change they actually are.
  { dependsOn: [wwwRecord] },
);

export const stackName = stack;

// The hostname the Worker answers on, read back from Cloudflare rather than
// echoed from config -- if the binding ever drifts, this output shows it.
export const workerHostname = apexDomain.hostname;
export const workerServiceName = workerName;

// Canonical origin. Nothing consumes this at build time today (the app hardcodes
// it in `profile.ts`, which is correct for a value baked into rendered markup),
// but it is the value to diff against if that ever moves to an env var.
export const appBaseUrl = `https://${hostname}`;

export const redirectFrom = wwwRecord.name;
export const redirectRulesetId = redirectRuleset.id;
