# PROJECT PARALLAX — 3D UAP Global Tracking Map

## What this is
A production-ready interactive 3D globe application mapping verified UAP incidents, live sightings, and activity hotspots. Part of Project Parallax, a UAP OSINT intelligence project with an established visual identity. The deliverable is **one self-contained `index.html`** — no build step, no npm for the end product, no API keys. It must open from a double-click on the file.

## Tech decision (locked)
- **CesiumJS** via public CDN (`https://cdn.jsdelivr.net/npm/cesium@latest/Build/Cesium/` or cesium.com CDN), loaded in `<head>`.
- **No Cesium Ion token.** Use a token-free imagery provider: `Cesium.UrlTemplateImageryProvider` with OSM tiles (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`) or CARTO dark-matter tiles (`https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png` — preferred, matches our dark aesthetic). Set `Cesium.Ion.defaultAccessToken = undefined` handling so no 401 spam. Disable the default Bing imagery, geocoder, and baseLayerPicker.
- Data may be embedded inline in the HTML (const arrays) OR loaded via fetch from `data/*.json` — embed inline for the final deliverable so a single file works from `file://`.

## Design system (non-negotiable — matches existing Parallax artifacts)
CSS variables:
```css
--void:  #030608;   /* page background */
--gold:  #c8a96e;   /* headers, accents, Class A */
--ice:   #a8d8f0;   /* body text, secondary */
--ember: #e85d26;   /* alerts, Class B accents */
--teal:  #00c8ff;   /* interactive, live data */
--pursue:#ff2e88;   /* PURSUE/Class H pink badge */
```
Typography (Google Fonts CDN): **Bebas Neue** (display/headers, letter-spacing 0.08em), **DM Mono** (data, labels, coordinates), **Crimson Pro** (briefing body text).
Aesthetic: dark intelligence/investigation theme. Glassmorphism sidebar `rgba(10,15,30,0.75)`, `backdrop-filter: blur(14px)`, 1px glowing borders (`box-shadow: 0 0 12px` in accent color at low alpha), scanline/noise restraint — cinematic but legible. No rounded-bubble consumer UI.

## Data files (in ./data/, already prepared)
1. **incidents.json** — 32 verified incidents, 1944–2026, 17 countries. Schema per record:
   `{ id, name, year, lat, lon, location, country, class, cat, shape, sigs[], summary, what, why, witnesses, evidence, response, links[{label,url}], isPursue? }`
   - `class`: 'A' (highest evidentiary weight) | 'B' | 'H' (2026 PURSUE-era historic releases)
   - `cat`: military | mass | nuclear | transmedium | biological | physical | disclosure
   - `sigs`: emoji signature glyphs used as visual signature chips
2. **sightings.json** — 565 live sighting points: `{ location, lat, lon }`
3. **hotspots.json** — 8 activity clusters: `{ name, lat, lon, count, desc }`

### Field mapping to the spec's filter model
- "Source Category" filter → map `cat` groups: Military/Declassified = military+nuclear+transmedium (RED `--ember`), Pilot Report ≈ class A military aviation cases (BLUE `--teal`), Vetted Civilian = mass+biological+physical (AMBER `--gold`). Keep a 4th color for `isPursue`/class H (PINK `--pursue`).
- "Sighting Shape" filter → use the baked `shape` field (Tic-Tac | Disk | Triangle | Sphere | Orb | Lights | Unknown), pre-enriched via `enrich_shapes.js` (keyword pass + reviewed analyst overrides).
- Time slider domain: 1944 → 2026 from `year`.

## Hard requirements
- 60 FPS target: use `viewer.scene.requestRenderMode = true` + explicit `scene.requestRender()` on state change; PointPrimitiveCollection (not Entities) for the 565-sighting layer; Billboard/Label collections only where needed.
- Clustering: any region >50 points clusters to a numeric node that splits on zoom (Cesium `EntityCluster` or custom screen-space binning for primitives).
- Click → `camera.flyTo` (2.2s, easing) + populate sidebar inspection card. Hover → small tooltip (City/Region + Date).
- Layer toggles: Incidents / Live Sightings / Hotspots.
- Time-series playback: Play/Pause button auto-advances a year cursor; points fade/scale in as the cursor passes their year.
- Metrics dashboard recomputes on every filter change: Total Vetted Incidents (filtered count), Most Common Shape (mode of `shape`), Active Hotspot (highest-count hotspot).

## Conventions & pitfalls (learned on this project)
- Previous SVG-viewBox approaches broke interactivity — real WebGL mapping only.
- Test at `file://` — no dev-server-only assumptions (CORS: this is why data gets embedded inline in the final single file).
- Keep everything in ONE final index.html; during development you may split, but the last step is an inline-bundle pass.
- Verify no console errors with Ion token absent.
- Escape apostrophes in embedded JSON-in-JS carefully (source data contains many).

## Definition of done
1. `index.html` opens locally, globe renders dark CARTO imagery, spins/zooms fluidly.
2. All 32 incidents plotted + color-coded; 565 sightings layer toggles; 8 hotspots render as glowing rings sized by count.
3. Filters, time slider + playback, hover tooltips, click fly-to + inspection card all functional.
4. Clustering verified on the NJ/NYC region (64-count hotspot area).
5. Zero external dependencies beyond CDN + tile servers; zero API keys.
