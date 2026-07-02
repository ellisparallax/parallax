# Project Parallax — UAP Global Tracking Map

An interactive 3D globe of verified UAP incidents, live sightings, and citizen reports — built as an installable web app (PWA) that works offline and turns your phone into a field reporting tool.

![Parallax app icon](icons/icon-192.png)

## What it does

- **3D globe** (CesiumJS) with dark cartography — spin, zoom, fly-to.
- **37 verified incidents** (1944–2026) with full intel briefings and, where available, **public-domain photos and official government video** (Roswell newspaper, the U.S. Navy FLIR1/GIMBAL footage, the JWST image of interstellar comet 3I/ATLAS, and more).
- A **data-coverage note** is shown in-app: records skew heavily toward Western/English-language open sources, so China, Russia, and other closed-archive regions are under-represented (a few canonical cases from those regions are included — Dalnegorsk, Petrozavodsk, Voronezh, Hangzhou).
- **565 live sightings** with zoom-aware clustering, and **8 activity hotspots** sized by report count.
- **Filters** by object shape and source category, a **1944→2026 time slider** with playback, and a **live metrics dashboard**.
- **Citizen reporting** — submit a sighting with a photo; it drops onto your map instantly and can be sent to the project for review.
- **Field tools** — report from your GPS location, capture the compass **heading & tilt** you were looking at (for triangulation), and a **"Near me"** view with distance-to-incident.
- **Sighting alerts** — "watch an area" (draw a radius on the map or use your GPS) and get **notified when a new sighting is reported inside it** (Watch-Duty style). Works in-app today; add a backend for true background push (see below).
- **Installable + offline** — add to your home screen; the app shell, map tiles you've viewed, and data are cached for no-signal use.

## Run it

**Quick look:** open `index.html` directly in a browser (needs internet for the map/CDN). PWA install, offline caching, and the service worker only activate when served over `http(s)` — see below.

**Full app (recommended), any static server:**
```bash
# from the project root
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy on GitHub Pages (free)

1. Create a GitHub repo and push this folder (see below).
2. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pick `main` / `/root`.
3. Your app goes live at `https://<you>.github.io/<repo>/`. That URL is a secure context, so **install-to-home-screen, offline, GPS, camera, and compass all work.**

```bash
git init
git add -A
git commit -m "Project Parallax — installable UAP map (v1)"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

## Project structure

```
index.html              Self-contained app (data embedded inline)
manifest.webmanifest    PWA manifest
sw.js                   Service worker (offline shell + tile/CDN caching)
icons/                  App icons (192/512/maskable/apple-touch/favicon)
data/                   Source datasets (incidents, sightings, hotspots)
enrich_shapes.js        One-time script that bakes the `shape` field into incidents
CLAUDE.md, SPEC.md      Design system + spec (developer reference)
HANDOFF.md              Original build handoff notes
```

## Configuration notes

- **Submission intake:** the "Email for review" button uses a placeholder address. Set `REVIEW_EMAIL` near the top of the report code in `index.html` to your real intake address.
- **No API keys, no Cesium Ion token.** Map tiles are CARTO's free dark basemap.
- **Media** loads from Wikimedia's stable `Special:FilePath` endpoint; broken links hide themselves.

### Sighting alerts / push notifications

Watch zones, geofence matching, notification permission, and the service-worker push
handlers are all built in. Out of the box, alerts fire **in-app while Parallax is open**.

To enable **true background push** (delivered when the app is closed), add a backend:

1. Generate VAPID keys (e.g. `npx web-push generate-vapid-keys`).
2. In `index.html`, set the `PUSH` config near the top of the alerts section:
   ```js
   const PUSH = { enabled: true, vapidPublicKey: '<your VAPID public key>', subscribeUrl: '<your /subscribe endpoint>' };
   ```
   The client will subscribe via `PushManager` and POST the subscription (+ the user's
   watch zones) to your endpoint.
3. On your server (e.g. a Supabase Edge Function), store subscriptions, and when a new
   sighting is **approved through moderation**, find subscribers whose watch zone contains
   it and send a Web Push. `sw.js` already handles the `push` and `notificationclick`
   events (clicking an alert flies the globe to the sighting).

**iOS note:** web push requires the app be **installed to the home screen** (iOS 16.4+).
For a polished always-on experience, the App Store build uses native APNs push instead —
same watch-zone model, native delivery.

## Roadmap to the App Store

This is the "limited but legit" v1 — a real installable app using real device features. The path to a native iPhone app:

- **Now (this repo):** PWA, GPS, camera, compass, offline. ✅
- **Next (backend):** a real shared database + moderation queue for submissions (e.g. Supabase), user accounts (Sign in with Apple), corroboration/voting, comments. Swap the report form's export step for an API call.
- **Then (native):** wrap with Capacitor for the App Store, add push notifications and an AR sky mode, licensed map tiles, and the required content-moderation / privacy / EULA pieces.

See `docs`-style detail in `SPEC.md` and `CLAUDE.md`.

## License

MIT — see [LICENSE](LICENSE). Incident media is individually credited in-app and remains under its original public-domain / Creative Commons terms.
