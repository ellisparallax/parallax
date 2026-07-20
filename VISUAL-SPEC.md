# VISUAL-SPEC — "NIGHTWATCH" Living Earth Upgrade (v2 visual architecture)

**The critique this answers:** *"You can't make out the geography... it needs to be a real lifelike world that looks like you wanna explore."* Root cause: CARTO dark-matter tiles are city-zoom dashboard tiles — at planetary distance they read as black-on-black. The fix is not one better tile set; it's a **stack of coordinated layers** that make the planet feel alive, plus one signature moment.

## 0. The signature element (spend the boldness here)
**A living day/night terminator.** Real solar position drives Cesium's lighting; the sunlit hemisphere shows true-color satellite terrain, and as the camera drifts across the terminator the night side reveals **NASA Black Marble city lights** — with our sighting points and hotspot rings burning above the glow of real cities. UAP are a nocturnal phenomenon; the night side of Earth is literally the observational context. No other data-globe does this as its identity. Everything else stays disciplined so this one thing sings.

## 1. THE LAYER STACK (bottom → top)
1. **Base imagery — real Earth, no keys.** Default: **Esri World Imagery** (`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`, attribution "Esri, Maxar, Earthstar Geographics" required in footer). Instantly recognizable continents: Sahara ochre, Amazon green, Himalayan snow. Fallback offline: Cesium's built-in NaturalEarthII (`Cesium.TileMapServiceImageryProvider` + `Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')`).
2. **Night lights layer — the soul.** NASA GIBS Black Marble, no key: WMTS endpoint `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/VIIRS_Black_Marble/default/2016-01-01/500m/{z}/{y}/{x}.png` via `WebMapTileServiceImageryProvider` (tilingScheme: GeographicTilingScheme; GIBS docs specify matrix set params). Set the layer's **`dayAlpha: 0.0, nightAlpha: 1.0`** — Cesium natively cross-fades imagery across the terminator when `scene.globe.enableLighting = true`. This one property pair creates the entire signature.
3. **Lighting & atmosphere.** `globe.enableLighting = true`, `globe.dynamicAtmosphereLighting = true`, `globe.showGroundAtmosphere = true`, `scene.skyAtmosphere.show = true` (tune `hueShift ~0.0, brightnessShift +0.05` for a cold blue limb glow), `scene.sun.show = true`, `scene.moon.show = true`, `scene.skyBox` default starfield ON. `scene.highDynamicRange = true`.
4. **Borders layer.** `data/world_borders.geojson` (INCLUDED, 281KB, Natural Earth 110m, 177 countries) as `GeoJsonDataSource`: stroke `--ice` at 0.35 alpha, width 1; fill transparent. Subtle — geography orientation, not a political map. Toggleable.
5. **Geo-labels layer.** `data/geo_labels.json` (INCLUDED, 29 anchors: 7 continents, 4 oceans, 18 case-relevant countries) as a `LabelCollection`, Bebas Neue, letter-spaced, `--ice` at 55% alpha with `--void` outline. **Camera-height LOD:** continents+oceans visible > 9,000 km altitude; countries fade in 2,500–9,000 km; all hidden below 1,200 km (imagery takes over). Distance-fade via `Cesium.NearFarScalar` on translucency.
6. **Data layers (existing, restyled).** Incident points get canvas-drawn radial-gradient glow sprites (core white → category color halo) + gentle 2s pulse on hover; hotspot rings become double-ring pulses (`--ember`/`--gold`) with count labels; sighting layer stays fine teal dust but add `scaleByDistance` so it never becomes noise at altitude.
7. **Post-processing.** `PostProcessStageLibrary.createBloomStage()` (brightness ~-0.3, contrast ~64, delta 1.0, sigma 3.8, stepSize 5) so glow sprites and city lights bloom together; FXAA on. Bloom is what makes points feel like *energy* instead of dots.

## 2. MOTION & EXPLORATION FEEL
- **Cinematic boot:** camera starts 45,000 km out over the Pacific night side (city lights + points visible immediately = instant wow), then a 4s ease-in `flyTo` settles at 18,000 km over the user's rough longitude. Skippable on click.
- **Idle drift:** after 20s of no input, slow eastward rotation (`clock.multiplier` on ICRF or camera orbit ~0.15°/s). Any input cancels. The planet should never feel dead.
- **Terminator awareness:** a small UI chip shows local solar time at camera center ("NIGHT SIDE — optimal sighting window") — ties the visual to the mission.
- **Fly-to choreography:** clicking an incident does altitude-arc easing (up-over-down, not straight-line), landing at 600–900 km with the point pulsing once on arrival.
- Respect `prefers-reduced-motion`: disable idle drift, boot flight, and pulses.

## 3. VIEW MODES (persist choice; NIGHTWATCH is default)
- **NIGHTWATCH** — the full stack above (signature mode).
- **SATELLITE** — Esri imagery, lighting off, uniform daylight (analysis mode, max geographic clarity).
- **TACTICAL** — the existing CARTO dark for dense data-reading at low zoom (it was never wrong, just wrong as the *only* mode). Borders + labels forced ON here since tiles carry them poorly at altitude.
Mode switch = 0.6s crossfade of imagery layer alphas, not a hard swap.

## 4. PERFORMANCE GUARDRAILS
Two imagery layers + bloom is real GPU load: keep `requestRenderMode: true` (idle drift calls requestRender per tick only while active); cap `maximumScreenSpaceError` at 2; GIBS Black Marble is level-8 max — clamp its `maximumLevel` to stop over-requesting; borders GeoJSON loads once (110m is light); labels are a single LabelCollection (no per-entity overhead). Test: 60fps target desktop, 30fps floor mid-range mobile; if mobile struggles, auto-disable bloom (feature-detect via `scene.postProcessStages.bloom.enabled` + devicePixelRatio heuristic).

## 5. ACCEPTANCE CRITERIA (the "explore test")
- [ ] One-second recognition: a first-time viewer at boot altitude can point to Africa, the USA, Australia unprompted.
- [ ] The terminator is visible and city lights render on the night side; crossing it feels like the app's identity.
- [ ] Labels appear/fade smoothly with altitude; never overlap the sidebar; never visible below 1,200 km.
- [ ] Borders subtle at altitude, invisible-feeling at street-ish zoom.
- [ ] Bloom makes incident points read as luminous objects, not flat dots; no white-out over bright cities.
- [ ] Idle drift + skippable cinematic boot work; reduced-motion respected.
- [ ] All three view modes switch with crossfade; NIGHTWATCH default; choice persists.
- [ ] Attribution line present (Esri / NASA GIBS / Natural Earth / OSM-CARTO / CesiumJS).
- [ ] Still zero API keys, still 60fps desktop.

## 6. BUILD ORDER FOR THIS PASS
Esri base swap → lighting+atmosphere+skybox → GIBS night layer with dayAlpha/nightAlpha → verify terminator → borders → labels+LOD → point glow sprites & bloom → cinematic boot + idle drift → view modes → perf pass → acceptance run.
