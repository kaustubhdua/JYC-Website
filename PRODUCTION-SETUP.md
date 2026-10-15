# JYC Production Setup

## Scope and safety

The public website release does not require database migrations, privileged Edge Function deployment, or activation of the retired admin platform. Those steps are optional and only apply to a separately approved backend/admin release.

Before any approved JYC migration, verify the target project is `ogbanmjokjlxfuktkicj`, review the forward-only SQL and its RLS, storage-policy, and table impact, and preserve unrelated data. Never apply JYC migrations to Nihdhoom project `igqgtlmnwssjaoxkkzbm`.

## Optional backend/admin database setup (not required for public-site release)

Only for a separately approved backend/admin release, review and run these files in Supabase SQL Editor in order:

1. `supabase/00-core-migration.sql`
2. `supabase/relational-v2.sql`
3. `supabase/platform-v3.sql`
4. `supabase/platform-v4-fix.sql`
5. `supabase/final-role-hardening.sql`
6. `supabase/platform-v5-production.sql`
7. `supabase/contact-and-project-submissions.sql`

Do not run a name-based cleanup for **Abhivyakti**. Abhivyakti is a legitimate JYC community in the supplied hub directory, and the historical cleanup script is now non-destructive. If an unexpected record remains, verify it against an independent source-backed identifier before removing it.

## Optional backend/admin Edge Functions (not required for public-site release)

Only for a separately approved backend/admin release, deploy:

```bash
npx supabase functions deploy admin-management
npx supabase functions deploy send-notification
npx supabase functions deploy backup-site-data
npx supabase functions deploy ai-content-assist
```

Privileged secrets belong only in Supabase Edge Function secrets.

## Web Push

Set the browser-side public VAPID key:

```text
VITE_VAPID_PUBLIC_KEY=...
```

Set private VAPID values as Supabase secrets:

```bash
npx supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:jyc.website@gmail.com
```


## JYC Now live updates

The public `/updates` route and homepage JYC Now strip call the server-only `/api/jyc-updates` endpoint. If no connector returns usable records, the UI must continue to show its curated fallback rather than claiming a live feed.

Configure only sources you actually control in **Vercel Project Settings → Environment Variables**. Apply the variables to Production first, and Preview only when preview testing needs them:

- `JYC_INSTAGRAM_ACCOUNTS`: JSON object mapping a JYC/community name to its Instagram Professional Account user ID; requires `META_ACCESS_TOKEN`.
- `JYC_YOUTUBE_CHANNELS`: JSON object mapping community names to YouTube channel IDs; requires `YOUTUBE_API_KEY`.
- `JYC_LINKEDIN_ORGS`: JSON object mapping community names to LinkedIn organization IDs/URNs; requires `LINKEDIN_ACCESS_TOKEN`.
- `JYC_LINKEDIN_VERSION`: optional LinkedIn API version, kept aligned with the version supported by the account.
- `JYC_RSS_FEEDS`: JSON object mapping community names to public HTTPS RSS/Atom feed URLs.
- `JYC_MANUAL_UPDATES`: JSON array of manually curated items with verified official source URLs. Do not label a source verified unless it has been checked.
- `JYC_SYNC_SECRET`: optional server-only secret for the protected sync mode. Never put it in a `VITE_*` variable or browser code.

The API may optionally read/write published records through `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or the supported server-side `SUPABASE_SECRET_KEY` name). Those are server-only values. Confirm that the URL points to the **JYC Supabase project**, not another application. Do not apply JYC schema changes to Nihdhoom or copy any service-role key into the browser.

After configuring a source, redeploy and check `GET /api/jyc-updates` directly. A complete live-feed check requires `live: true`, at least one usable item, valid official source links, and no leaked secrets. `configured: true` alone is not enough: an empty JSON object or a connector with no usable records is not a working live feed. If no source credentials are available, explicitly accept the curated fallback for the public release and keep the UI's status wording truthful.

## Custom-domain verification

If `jiityouthclub128.in` and `www.jiityouthclub128.in` are intended to be public launch domains, open **Vercel → Project Settings → Domains** and follow the current verification instructions for each domain. Copy the exact TXT challenge Vercel displays into the DNS provider for the `_vercel` host, then retry verification in Vercel. Use the current DNS target Vercel shows for the apex and `www` records; do not guess A/CNAME values, replace the whole DNS zone, or disturb existing mail records. Verify both names and test HTTPS/redirect/canonical behavior before changing the canonical origin. If DNS is managed by another owner, this is an owner action.

## Local verification

```bash
npm.cmd install
npm.cmd run build
npm.cmd run dev
```

Verify:

- `/`
- `/about`
- `/clubs`
- `/events`
- `/gallery`
- `/team`
- `/contact`
- `/calendar`
- `/best-of-jyc`
- `/fests`
- `/join-jyc`

The public-release scope intentionally excludes the retired `/admin`, `/login`, `/my-jyc`, and `/notifications` surfaces. Verify those routes resolve to their safe public destinations and are not indexable. Club Admin and Super Admin workflow tests are required only for a separate release that explicitly re-enables the admin platform; they are not a prerequisite for the public website release.

## Vercel

Add:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_VAPID_PUBLIC_KEY (when push is enabled)
```

Do not add service-role or secret keys to Vercel frontend variables.

## Public website release checklist

- [ ] Public routes and representative dynamic routes render correctly; no legacy/demo club is visible.
- [ ] Current event dates, venues, deadlines, official club links and campus scope are verified.
- [ ] Public images decode, have appropriate alt text, use the intended crop, and fall back safely.
- [ ] Light/dark themes, keyboard focus, reduced motion, mobile touch targets and 200%/400% zoom are reviewed.
- [ ] Build, full static QA, Browser QA, CodeQL and Lighthouse CI pass on the exact release commit.
- [ ] Gallery and homepage LCP are checked against the agreed budgets; production Core Web Vitals are measured after release.
- [ ] The exact release commit has a READY Vercel preview and visual captures have human review.
- [ ] JYC Now has either a verified live source with usable records or an explicitly accepted curated fallback.
- [ ] Intended custom domains are verified and HTTPS/canonical redirects work, or the verified Vercel domain is explicitly accepted as the launch origin.
- [ ] The production deployment is READY and built from the exact approved `main` SHA.
- [ ] Production routes, security headers, sitemap/canonical metadata, offline recovery and service-worker updates are checked after deployment.

## Optional admin-platform release (separate scope)

Only if a future release explicitly re-enables the retired admin platform, additionally verify:

- [ ] Super Admin can log in and permissions match `ADMIN-ROLE-MATRIX.md`.
- [ ] Homepage/content editing and club/event publishing flows work.
- [ ] Gallery upload and media authorization work.
- [ ] Fest Mode preview is validated before activation.
- [ ] Admin and club-admin boundaries are tested with real authorized accounts.

> **Public-release boundary:** The public release intentionally does not expose the historical `/admin`, `/login`, `/my-jyc`, `/notifications`, or other retired student-platform routes. They resolve to safe public destinations. Admin-platform checks are not a prerequisite unless that platform is explicitly re-enabled.
