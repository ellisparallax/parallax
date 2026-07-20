# INTERACTION-SPEC — Zoom Scaling & Live-Dev Addendum

**Gap this closes:** elements must rescale smoothly and continuously DURING pinch/scroll zoom (not after it settles), every layer needs explicit near/far behavior, and the dev loop must show changes live on save.

## 1. UNIVERSAL ZOOM-SCALING RULES (every visual element gets an explicit policy)

| Element | Behavior | Implementation |
|---|---|---|
| Incident glow points | Screen-space px with floor/ceiling: 28px near → 11px far. Never vanish at altitude, never balloon at street level. | Billboard `sizeInMeters:false` + `scaleByDistance: NearFarScalar(3e5, 1.0, 2.5e7, 0.4)` |
| Incident hover pulse | Pulse amplitude constant in *pixels* regardless of zoom | animate billboard `scale`, not an ellipse on the ground |
| Sightings dust (565) | 7px near → 2px far + fade so they read as texture at altitude, points up close | PointPrimitive `scaleByDistance` + `translucencyByDistance: NearFarScalar(5e5, 0.9, 2.2e7, 0.35)` |
| Hotspot rings | GEO-ANCHORED (they represent real area) — grow naturally on zoom-in; hidden < 300 km where individual points take over; hidden > 30,000 km where they'd shrink to noise | ellipse entities + `distanceDisplayCondition(3e5, 3e7)`; count label uses scaleByDistance |
| Clusters | Re-evaluate continuously during the gesture (pixelRange is screen-space, so zoom changes membership live) | `camera.percentageChanged = 0.01` so `camera.changed` fires rapidly mid-gesture; cluster billboards get scaleByDistance too |
| Geo labels | Gradual fade tied to altitude bands — visible transition DURING the pinch, no binary popping | `translucencyByDistance` NearFarScalar per tier (continent/ocean/country), never `show` toggles |
| Borders | Constant 1px screen width at all altitudes (polylines are screen-space by default); fade out < 900 km | material alpha via distanceDisplayCondition |

## 2. THE requestRenderMode TRAP (this is the "laggy zoom" bug pre-empted)
`requestRenderMode: true` is our perf strategy, but naive use makes distance-scaling feel frozen mid-gesture. Required wiring:
- `viewer.camera.percentageChanged = 0.01` (default 0.5 fires far too rarely) → `camera.changed` listener calls `scene.requestRender()`. Cesium auto-renders during active camera *movement*, but the low threshold guarantees scaleByDistance/translucency/cluster updates track the gesture frame-by-frame, including inertia tail.
- Custom animations (pulses, hotspot breathing, boot flight) run via a single `scene.postUpdate` ticker that calls `requestRender()` ONLY while an animation is active (maintain an `activeAnimations` counter; when it hits 0, stop requesting).
- After any programmatic state change (filters, time slider, mode switch): one explicit `scene.requestRender()`.

## 3. GESTURE TUNING (pinch must feel physical)
```js
const c = viewer.scene.screenSpaceCameraController;
c.minimumZoomDistance = 400;          // never clip through the globe
c.maximumZoomDistance = 5.5e7;        // never get lost in space
c.inertiaZoom = 0.85;                 // buttery pinch release
c.inertiaSpin = 0.9; c.inertiaTranslate = 0.9;
c.enableCollisionDetection = true;
```
Zoom-to-cursor/finger (not screen center) — Cesium does this by default for pinch; verify not overridden. `useBrowserRecommendedResolution: true` and cap `resolutionScale` at `Math.min(devicePixelRatio, 2)` for mobile GPU headroom. Double-tap = zoom-in step; two-finger tap = step out (mobile parity with trackpad).

## 4. SEE IT LIVE (dev loop)
- **Primary loop:** `npx live-server --port=8080` in the repo root — auto-reloads the browser on every file save, so each Claude Code edit is visible within ~1s. (Plain `python3 -m http.server` works with manual refresh.) Claude Code should run the server as a background process and keep it running across the session.
- **Simulating pinch on desktop:** macOS trackpad pinch works natively in Chrome; otherwise DevTools device toolbar (Cmd/Ctrl+Shift+M) → touch simulation, hold Shift+drag for pinch.
- **Phone on the same Wi-Fi:** open `http://<dev-machine-ip>:8080` — globe, zoom scaling, gallery all work over LAN http. ONLY the AR sensor mode needs a secure context: `localhost` counts as secure (desktop testing fine); for phone AR testing use a quick tunnel (`npx cloudflared tunnel --url http://localhost:8080`) which gives an https URL.
- **Verification ritual per visual change:** dev server running → save → observe live → then the acceptance pass at three altitudes (25,000 km / 3,000 km / 500 km) and one full pinch-in from space to city.

## 5. ACCEPTANCE ADDITIONS
- [ ] Continuous pinch from 25,000 km to 500 km: points shrink/grow smoothly THROUGHOUT the gesture and its inertia tail — zero popping, zero frozen frames.
- [ ] Labels crossfade mid-gesture (watch "AFRICA" dissolve as country labels arrive) — gradual, not binary.
- [ ] Clusters re-form/break DURING zoom, not after release.
- [ ] Hotspot rings appear/disappear at their altitude gates without flicker.
- [ ] 60fps desktop / 30fps-floor mobile sustained through a 10s continuous pinch+spin torture test.
- [ ] live-server loop demonstrated: edit a color token, see it on screen without manual refresh.
