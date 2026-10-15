# JYC Production Setup

## Database

Run these files in Supabase SQL Editor, in order:

1. `supabase/00-core-migration.sql`
2. `supabase/relational-v2.sql`
3. `supabase/platform-v3.sql`
4. `supabase/platform-v4-fix.sql`
5. `supabase/final-role-hardening.sql`
6. `supabase/platform-v5-production.sql`
7. `supabase/contact-and-project-submissions.sql`

Do not run a name-based cleanup for **Abhivyakti**. Abhivyakti is a legitimate JYC community in the supplied hub directory, and the historical cleanup script is now non-destructive. If an unexpected record remains, verify it against an independent source-backed identifier before removing it.

## Edge Functions

Deploy:

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

## Final launch checklist

- [ ] No legacy/demo club is visible.
- [ ] Super Admin can log in.
- [ ] Admin permissions match `ADMIN-ROLE-MATRIX.md`.
- [ ] Homepage copy and layout can be edited.
- [ ] Club pages render correctly.
- [ ] Event publish flow works.
- [ ] Gallery uploads work.
- [ ] Fest Mode preview works before activation.
- [ ] Mobile layout works.
- [ ] `npm run build` passes.
- [ ] GitHub Actions passes.
- [ ] Vercel deployment works.


> **Current release boundary:** The production public release intentionally does not expose the historical `/admin`, `/login`, `/my-jyc`, `/notifications`, or other retired student-platform routes. They resolve to safe public destinations. The backend/admin implementation remains repository infrastructure but is not part of the public-release acceptance gate unless a future release explicitly re-enables it.
