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

// Cloudflare's reference to the first wildcard capture group, for use inside a
// `wildcard_replace` target. Held in a constant rather than written inline
// because `${1}` in source reads as a TypeScript template placeholder -- to
// linters and to people -- and the two mean opposite things. Interpolating it
// away would ship a bare `https://` as the redirect target; this way the literal
// is stated once, deliberately, and the template below reads as the substitution
// it actually is.
// biome-ignore lint/suspicious/noTemplateCurlyInString: the point of this constant
const WILDCARD_CAPTURE = "${1}";

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

// Collapses www onto the apex with a permanent 301, so exactly one hostname is
// canonical and search engines are told which.
//
// This ADOPTS the zone's existing redirect rather than creating one. The zone
// already had a "www to root" rule, written by hand long before this program
// existed, and a phase entrypoint ruleset is a singleton: Cloudflare permits at
// most one per zone per phase and rejects a second with error 20217
// ("exceeded maximum number of zone rulesets"), which is exactly how the first
// deploy failed.
//
// Deleting the old one was the obvious alternative and is the wrong move.
// Removing the rule in the dashboard leaves the ruleset itself behind, so the
// conflict survives; and Cloudflare has a known soft-delete defect where a
// deleted zone ruleset still counts against the phase limit, which can leave the
// zone in a state that is harder to recover from than this one. Importing costs
// nothing and takes the redirect offline for zero seconds.
//
// The rule below is reproduced from what was already live, not redesigned, so
// the adopting update is a no-op. It is also simply better than the
// host-equality rule this program originally declared: `wildcard_replace` over
// `full_uri` carries the path and query across without either being named, and
// it covers any future `www.<anything>.spencerwill.com` rather than one literal
// hostname.
//
// Because the entrypoint ruleset is a zone singleton, this resource owns the
// zone's ENTIRE dynamic-redirect list -- ucmc.spencerwill.com's included, were
// it ever to want one. A rule added by hand in the dashboard will be removed on
// the next `pulumi up`. Add rules to the array below instead.
const redirectRuleset = new cloudflare.Ruleset(
  `spencerwill-web-${stack}-www-redirect`,
  {
    zoneId,
    kind: "zone",
    phase: "http_request_dynamic_redirect",
    // "default" is the name Cloudflare assigns a phase entrypoint ruleset.
    // Matching it keeps the adopting update from renaming a singleton for
    // cosmetic reasons.
    name: "default",
    rules: [
      {
        description: "www to root",
        enabled: true,
        expression: '(http.request.full_uri wildcard r"https://www.*")',
        action: "redirect",
        actionParameters: {
          fromValue: {
            statusCode: 301,
            targetUrl: {
              expression: `wildcard_replace(http.request.full_uri, r"https://www.*", r"https://${WILDCARD_CAPTURE}")`,
            },
            // Deliberately false. `full_uri` already contains the query string,
            // so `wildcard_replace` has carried it into the target -- preserving
            // it again would append a second copy.
            preserveQueryString: false,
          },
        },
      },
    ],
  },
  {
    // The rule matches on the request URI, which only produces traffic once the
    // record exists.
    dependsOn: [wwwRecord],
    // Adopt the pre-existing ruleset instead of creating a second one. Format is
    // `{accounts|zones}/{id}/{ruleset_id}`, per the provider SDK. Remove this
    // option once the import has landed in state -- it has served its purpose
    // and the literal id does not belong in code long-term.
    import: `zones/${zoneId}/0e33f1ff194d49ed8081931960eb15b3`,
  },
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
