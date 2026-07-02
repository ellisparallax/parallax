# SPEC — Parallax 3D UAP Global Tracking Map (v1.0)

Role: Senior Frontend Engineer / Geospatial Developer. Library: **CesiumJS** (locked — see CLAUDE.md for token-free configuration). Deliverable: single self-contained `index.html`.

## 1. Application architecture & UI layout
- **Split screen:** 3D globe viewport = right 2/3 of screen. Control sidebar = left 1/3. Sidebar scrolls independently; globe fills remaining space, resizes responsively.
- **Glassmorphism sidebar:** background `rgba(10,15,30,0.75)`, `backdrop-filter: blur(14px)`, neon border glow, crisp typography per the Parallax design system (CLAUDE.md). Cyberpunk-intelligence aesthetic, not consumer-app.
- **Sidebar modules, top to bottom:**
  1. **Header** — "PROJECT PARALLAX // GLOBAL TRACKING" (Bebas Neue), live UTC clock (DM Mono).
  2. **Metrics Dashboard** — three counters: `TOTAL VETTED INCIDENTS` (respects active filters), `MOST COMMON SHAPE` (mode of shape field across filtered set), `ACTIVE HOTSPOT` (highest-count hotspot name). Animated count-up on change.
  3. **Filter Control Panel** —
     - Sighting Shape: checkbox group — Tic-Tac, Disk, Triangle, Sphere, Orb, Lights, Unknown (reads the baked `shape` field in incidents.json; no runtime derivation needed).
     - Source Category: checkbox group with color swatches — Military/Declassified (red), Pilot Report (blue), Vetted Civilian (amber), PURSUE Release (pink).
     - Layer toggles: Verified Incidents / Live Sightings (565) / Activity Hotspots (8).
     - "Reset filters" text button.
  4. **Time-Series Slider** — range 1944→2026, current-year readout in DM Mono, Play/Pause button. Playback advances ~1 year per 300ms (adjustable const); markers with `year <= cursor` visible, entering markers animate in (scale+fade). Slider drag scrubs live.
  5. **Incident Inspection Card** — hidden until a point is clicked. Populates: incident NAME (Bebas), YEAR + CLASS badge (A gold / B ember / H pink), DATE/YEAR, COORDINATES (DM Mono, 4-decimal), LOCATION + COUNTRY, WITNESS DESCRIPTION (use `what` field, Crimson Pro), OFFICIAL CLASSIFICATION STATUS (use `response` field), signature glyph chips (`sigs`), source links list. Close (×) button.

## 2. Data & interaction layer
- Plot every incident at exact lat/lon as a **luminous, semi-transparent glowing point** (PointPrimitive with translucent outer glow ring, or billboard with radial-gradient sprite generated on an offscreen canvas — no external image files).
- Color by source category: RED = Military/Declassified, BLUE = Pilot Report, AMBER = Vetted Civilian, PINK = PURSUE (class H / isPursue).
- Sightings layer: smaller teal points, PointPrimitiveCollection, 40% alpha.
- Hotspots: glowing rings (ellipse outline entities) with radius proportional to `count`, pulsing subtle animation, count label.
- **Hover:** screen-space tooltip near cursor showing `location` (City/Region) + `year`. Use `ScreenSpaceEventType.MOUSE_MOVE` + `scene.pick`.
- **Click:** `camera.flyTo` the point (duration ~2.2s, height ~900km, ease-out) and populate the Inspection Card. `ScreenSpaceEventType.LEFT_CLICK`.

## 3. Technical & performance
- `requestRenderMode: true`, `maximumRenderTimeChange: Infinity`; call `scene.requestRender()` after any filter/time/camera-programmatic change. Target fluid 60fps interaction.
- Disable: baseLayerPicker, geocoder, timeline, animation widget, homeButton, sceneModePicker, navigationHelpButton, infoBox, selectionIndicator (we build our own UI). `creditContainer` routed to a hidden-but-present element with a small visible "© OSM/CARTO · CesiumJS" attribution line in the sidebar footer (keep tile attribution legally visible).
- **Clustering:** for regions with >50 points (the NJ/NYC area qualifies via sightings density), cluster into a numeric node that breaks apart when camera height < ~600km. Simplest robust path: put sightings in a `CustomDataSource` with `clustering.enabled = true`, `pixelRange: 45`, `minimumClusterSize: 8`, custom cluster billboard = canvas-drawn hex with count text. Verify visually over New Jersey.
- All CDN `<script>`/`<link>` in `<head>`. Fonts via Google Fonts CDN. Everything else inline.
- Must run from `file://` — embed the three datasets as inline `const` JSON in a `<script id="parallax-data">` block during the final bundle pass.

## 4. Acceptance criteria (test each)
- [ ] Opens by double-click, no server, no keys, no console errors.
- [ ] Globe renders dark tiles; spin/zoom fluid.
- [ ] 32 incidents visible, correctly colored; hover tooltips correct; click flies + populates card with all fields.
- [ ] 565 sightings toggle on/off; clusters over NJ/NYC break apart on zoom.
- [ ] 8 hotspot rings sized by count with labels.
- [ ] Shape + category filters update globe AND metrics instantly.
- [ ] Time slider scrubs; Play animates 1944→2026 with entering-point animation; Pause halts.
- [ ] Metrics dashboard always equals the visible filtered set.
- [ ] Layout holds at 1280×800 and 1920×1080; sidebar scrolls, globe never overflows.

## 5. Suggested build order
1. Scaffold viewer + dark tiles + UI shell (static) → 2. Load data (fetch during dev) + plot incidents → 3. Hover/click interaction + card → 4. Filters + metrics → 5. Sightings layer + clustering → 6. Hotspot rings → 7. Time slider + playback → 8. Performance pass (requestRenderMode audit) → 9. Inline-bundle pass to single file → 10. Run acceptance checklist.
