# Parallax backend (Supabase) — deploy guide

This turns the app from "local + export for review" into a **real shared database
with a moderation queue and background push alerts**. It's scaffolded and ready to
deploy; it has not yet been run against a live project.

## What's here

```
supabase/
├── migrations/0001_init.sql        Schema: sightings + moderation status, push
│                                   subscriptions, watch zones (PostGIS), RLS,
│                                   subscribers_near() radius match, photo bucket
└── functions/
    ├── _shared/cors.ts             CORS + JSON helper
    ├── submit-sighting/index.ts    Public: insert a sighting as status='pending'
    ├── subscribe/index.ts          Public: save a push subscription + its zones
    └── moderate/index.ts           Admin: approve/reject; on approve, push to every
                                    subscriber whose watch zone contains the sighting
```

## Prerequisites

- A free [Supabase](https://supabase.com) project.
- The [Supabase CLI](https://supabase.com/docs/guides/cli) (`brew install supabase/tap/supabase`).
- Node (only to generate VAPID keys once).

## 1. Link & push the schema

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push            # applies migrations/0001_init.sql (enables PostGIS, tables, RLS)
```

## 2. Generate Web Push (VAPID) keys

```bash
npx web-push generate-vapid-keys
# note the Public Key and Private Key
```

## 3. Set function secrets

```bash
supabase secrets set \
  VAPID_PUBLIC_KEY=<public> \
  VAPID_PRIVATE_KEY=<private> \
  VAPID_SUBJECT=you@yourdomain.com \
  MODERATION_SECRET=<a-long-random-string>
# SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.
```

## 4. Deploy the functions

```bash
supabase functions deploy submit-sighting --no-verify-jwt
supabase functions deploy subscribe       --no-verify-jwt
supabase functions deploy moderate         # keep JWT off but it is gated by MODERATION_SECRET
```

`--no-verify-jwt` lets anonymous visitors submit/subscribe. `moderate` is protected
by the `x-admin-secret` header (see below); swap in real role-based auth for production.

## 5. Point the app at the backend

In `index.html`:

- **Submissions** — find `const API = { enabled:false, submitUrl:'' }` and set:
  ```js
  const API = { enabled:true, submitUrl:'https://<ref>.functions.supabase.co/submit-sighting' };
  ```
- **Push alerts** — find `const PUSH = { enabled:false, vapidPublicKey:'', subscribeUrl:'' }` and set:
  ```js
  const PUSH = {
    enabled:true,
    vapidPublicKey:'<your VAPID public key>',
    subscribeUrl:'https://<ref>.functions.supabase.co/subscribe'
  };
  ```

Commit, push — GitHub Pages redeploys, and the live app now writes to the shared
queue and registers for push.

## 6. Approve a sighting → fire the alert

```bash
curl -X POST https://<ref>.functions.supabase.co/moderate \
  -H "content-type: application/json" \
  -H "x-admin-secret: <MODERATION_SECRET>" \
  -d '{"id":"<sighting-uuid>","action":"approve"}'
```

On approve, `moderate` calls `subscribers_near()` (a PostGIS `ST_DWithin` query),
sends a Web Push to each match, and prunes dead subscriptions. The service worker
(`sw.js`) already renders the push and flies the globe to the sighting on tap.

## Notes / next steps

- **Reading approved sightings into the map:** RLS lets anyone `select` rows where
  `status='approved'`. Add a small fetch on load (supabase-js or a REST call to
  `/rest/v1/sightings?status=eq.approved`) to render everyone's approved reports as a
  live layer. (Left out of the single-file client to keep it dependency-free for now.)
- **Moderation UI:** a minimal admin page can list `status='pending'` rows and POST to
  `moderate`. A Supabase Studio table view works in the meantime.
- **iOS push** requires the PWA be installed to the home screen (iOS 16.4+). The native
  App Store build would use APNs directly with the same watch-zone model.
- **Auth:** add Supabase Auth (incl. Sign in with Apple) to attribute reports and gate
  moderation by role instead of the shared secret.
