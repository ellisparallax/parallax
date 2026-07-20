# PRODUCT-SPEC — Competitive Position, Monetization & The Five Differentiators

## 1. COMPETITIVE MAP (July 2026, verified)

| Competitor | Model | What they sell | Their gap through our lens |
|---|---|---|---|
| **Enigma Labs** (200K+ sightings app) | Free (VC-funded data play) | AR "Identify Lens," radius alerts, community feed, human-moderated reports, NID case numbers | **Opaque scoring** (top user complaint), low-quality posts rated high, signup data-harvesting distrust, zero government-record depth, no provenance discipline, no document archive |
| **Flightradar24** | Freemium: Silver ~$18/yr, Gold ~$50/yr | **History & playback** (365 days), custom conditional alerts, weather layers, extended aircraft data, ad-free; Contributor barter (host receiver → free top tier) | Planes only — answers "what aircraft is that" but not "what ISN'T an aircraft" |
| **SkySafari 7** | $29 app + Premium $29.99/yr | Cloud sync, **SkyCast** (broadcast your sky view live), OneSky trending-object analytics, curated monthly sky content | Pure astronomy — treats every light as catalog-explainable by definition |
| **Sky Guide / Stellarium+** | Freemium/one-time | AR pointing, satellite passes, notifications | Same — no anomaly concept, no reporting, no archive |
| **NUFORC / MUFON** | Donation / $ membership | Report databases, case management (MUFON CMS), investigator network | 1990s UX, no live tooling, no instrumentation |

**The proven willingness-to-pay, distilled:** people pay for (1) history/playback, (2) conditional alerts, (3) exclusive data layers, (4) sync/multi-device, (5) live social casting, (6) curated expert briefings, (7) contributor-barter status.

## 2. THE FIVE DIFFERENTIATORS (things no one has built, because no one applied our lens)

1. **SKYWATCH FORECAST — misidentification weather.** Everyone sends "ISS pass tonight!" alerts. Nobody sends the inverse: *"Tonight over your location: Starlink train 21:14 NW→SE, Venus brilliant WSW until 22:30, Capella scintillating low NE — HIGH false-report conditions. Anything outside these is worth filming."* One nightly push computed entirely from our existing SKYCHECK engine. Turns every user into a calibrated observer. **This is the killer subscription hook — daily value, zero marginal cost.**
2. **TRIANGULATION EVENTS.** When 2+ reports arrive within a time/space window, auto-open a live event: each witness's bearing line drawn on the globe; two bearings = position + altitude estimate by geometry. Enigma collects anecdotes; we compute **geometry from crowds**. No consumer product does multi-witness triangulation. (Phase 2: live "event rooms" with SkyCast-style casting.)
3. **THE TRANSPARENT VERDICT.** Enigma's top complaint is opaque scoring. Our SKYCHECK audit — "checked 7 planets, 5,044 stars, 148 satellites; residual unknown" — printed on every report is the direct market answer. Trust as the moat: **we show our work; they show a number.**
4. **THE ARCHIVE AS PRODUCT.** Nobody productized the document layer: full-text-searchable government record vault (our Notion corpus operationalized), **FOIA watchlists** ("alert me when the Rhodes photos, DOC-001 queue items, or PURSUE Tranche 4 drop"), diff-tracking on re-released documents (redaction comparison), citation-grade permalinks. Researchers, journalists, and the obsessed will pay for this alone — it's Bloomberg-terminal logic applied to disclosure.
5. **WITNESS VIEW + SIGHTING PLAYBACK.** FR24 sells flight playback; we sell **sky playback anchored to human events** — scrub the reconstructed sky ±3h around any of 565+ sightings. Emotionally unmatched: *stand where they stood.*

## 3. MONETIZATION ARCHITECTURE (three tiers + one barter)

- **FREE — "Observer":** full globe (NIGHTWATCH), all incidents & gallery, basic SKYCHECK photo analysis, submit reports — **always account-free and anonymous** (see COMMUNITY-SPEC). No pushes except optional 30-min-delayed national-event broadcasts (growth lever). The free tier must stay genuinely excellent — it's the data engine and the trust builder. No ads, ever (ads would poison the credibility moat).
- **PARALLAX PRO — $29/yr or $3.99/mo** (anchored to SkySafari Premium/FR24 Silver-Gold band): **area sighting-event push alerts with custom radius/conditions** · SKYWATCH nightly forecast pushes · full time-machine playback & Witness View time-scrubbing on all sightings · triangulation event access · case-file PDF generator (SKYCHECK audit + sky reconstruction + report metadata — built for MUFON investigators/journalists) · saved watch regions with custom alert conditions · cloud sync.
- **ARCHIVE — $79/yr** (researcher tier): everything in PRO + full-text document vault search · FOIA watchlists & release alerts · redaction-diff viewer · export/citation API · early tranche analyses ("The Parallax Brief" — curated monthly intelligence briefing, the SkySafari content model applied to disclosure).
- **CONTRIBUTOR BARTER (FR24's genius, our lens):** verified high-quality reports (passed SKYCHECK vetting, media attached) earn PRO months. Contributors of ADS-B/allsky-camera data feeds earn ARCHIVE. Data flywheel: the users fund the dataset with observations instead of dollars.

## 4. TECHNICAL IMPLICATIONS (honest)
Free tier ships as the current static single-file app (zero infra). PRO/ARCHIVE require phase-2 infrastructure: auth + payments (Stripe) + push notifications + a small backend (Supabase-class) for accounts, alerts, sync, and the events system. The nightly forecast is a cron job over the existing SKYCHECK math. Do NOT gate any currently-built feature retroactively — paywall only NEW capabilities (forecast, playback depth, triangulation, vault tooling) so early users never feel robbed.

## 5. SEQUENCE
Ship free core (current build queue) → instrument what people actually use → SKYWATCH forecast as first paid feature (highest value/effort ratio) → case-file generator (serves the existing investigator market) → vault/ARCHIVE tier → triangulation events last (needs user density).

**Positioning line:** *Enigma collects stories. Flightradar tracks planes. Stellarium draws the sky. Parallax is the only instrument that does all three against the government record — and shows its work.*

## 6. GOVERNANCE ADDENDUM
Identity, discussion, reputation, and the feature CUT/DEFER list are governed by COMMUNITY-SPEC.md — anonymous-first reporting, case threads instead of forums, track-record reputation instead of karma. Any new feature proposal must pass the test written there before entering a spec.
