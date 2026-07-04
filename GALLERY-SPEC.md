# GALLERY-SPEC — Parallax Evidence Gallery Module ("The Vault Wall")

**Purpose:** The visual centerpiece of the app — a cinematic, full-bleed archive of UAP imagery spanning official releases, authenticated leaks, and vetted civilian captures. The wow factor comes from presentation *and* from radical provenance transparency: every image wears its evidentiary status like a museum placard. This is the anti-slop gallery — beauty in service of rigor.

## 1. DESIGN (Parallax design system, dark intelligence aesthetic)
- **Layout:** full-viewport masonry/justified grid over `--void`, images at high contrast with subtle vignette; hover lifts the image with a `--gold` glow and reveals the placard strip. Entry animation: staggered fade-up. A featured "EXHIBIT A" hero rotation at top (Ken Burns slow zoom on the current featured image).
- **Placard system (non-negotiable):** every tile carries a status chip:
  - `OFFICIAL RELEASE` (teal) — government-published (public domain for US gov works)
  - `LEAKED — AUTHENTICATED` (ember) — unofficial exit, later confirmed genuine by officials/reporting
  - `CIVILIAN — VETTED` (gold) — non-government capture with multi-witness or analysis support
  - `CONTESTED` (ice) — authentic image, disputed interpretation
  - `DEBUNKED` (grey, kept deliberately) — admitted hoaxes/identified objects, retained as calibration exhibits
  - `REFERENCED — UNRELEASED` (pursue-pink) — imagery known to exist but never published (rendered as a redacted-frame placeholder with dossier text). These placeholders are a feature: the gallery of what we are NOT allowed to see, each an acquisition target.
- **Lightbox:** click → full-screen viewer with the complete intel card (date, location, platform/camera, chain of custody, competing analyses, tier label, source link, related incident deep-link to the 3D globe).
- **Filters:** by status chip, decade, country, sensor type (visual/IR/radar-scope/composite). Search by name.
- **Reconstruct-sky button** on civilian night captures → deep-links into SKYCHECK Module B with the image's date/location prefilled.

## 2. DATA & PIPELINE
- Manifest: `data/gallery_seed.json` (INCLUDED — 18 curated entries with full provenance metadata). Schema:
  `{ id, title, year, status, tier, country, sensor, source_org, description, provenance, competing_analysis?, image_url?, local_file?, related_incident_id?, acquisition_note? }`
- **Build-time fetch:** Claude Code should download available `image_url` assets into `assets/gallery/` during development and embed or reference locally (US government works are public domain; civilian items keep credit lines from the manifest; anything unfetchable renders its dossier card with a styled placeholder — never a broken image).
- **User upload lane:** "SUBMIT TO ARCHIVE" accepts civilian uploads → runs EXIF extraction → routes through SKYCHECK verdict → uploads that survive get a `CIVILIAN — PENDING VETTING` chip and a structured record; the verdict audit ships with the submission. The gallery thus grows with pre-filtered civilian finds, per the collection doctrine.
- Storage: window.storage API for user submissions (keys: `gallery:sub:{id}`), manifest entries stay embedded.

## 3. SEED HIGHLIGHTS (see gallery_seed.json for all 18)
Official: PURSUE FBI renderings (2026), FBI photo B2 IR still (Dec 2025), bronze ellipsoid composite, Lake Huron ATP strike frames, Gimbal/FLIR1/GoFast stills, Colares beam photos (Brazilian AF), Costa Rica 1971 government aerial-mapping frame (arguably the best official UAP photo ever taken), STS-48 frame (CONTESTED placard with both Kasher and Oberg analyses).
Leaked-authenticated: 2019 Navy "Acorn / Metallic Blimp / Sphere" photos (leaked 2021, confirmed authentic UAPTF material by DoD spokesperson).
Civilian: Calvine 1990 (suppressed 32 years, surfaced 2022 via Sheffield archive — placard tells that suppression story), Lubbock Lights (Hart, 1951, Air Force-analyzed), Phoenix Lights (1997), McMinnville 1950 (CONTESTED).
Debunked calibration exhibits: Petit-Réchain Belgian triangle photo (admitted hoax 2011 — placard explains the *incident* remains radar-documented while this famous image does not represent it).
Referenced-unreleased: Kazakhstan 1994 Rhodes Olympus photos, Nimitz extended FLIR footage claims, mother-orb original imagery (artist recreations only released), IMMACULATE CONSTELLATION alleged satellite imagery.

## 4. ACCEPTANCE CRITERIA
- [ ] Grid renders 18 seed entries; unfetchable images degrade to styled dossier placeholders, zero broken images.
- [ ] Every tile shows a status chip; lightbox shows full provenance + competing analyses where present.
- [ ] DEBUNKED and REFERENCED-UNRELEASED categories render (the honesty is the feature).
- [ ] Filters and globe deep-links work both directions (gallery→incident, incident card→gallery).
- [ ] Upload lane produces a SKYCHECK-audited pending submission stored via window.storage.
- [ ] The page is genuinely beautiful: judged by whether a first-time visitor stops scrolling. Typography, spacing, and motion per the Parallax system — no consumer-app gloss.
