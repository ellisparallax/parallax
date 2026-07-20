# WITNESS-VIEW-SPEC — Sightings-Anchored Sky Reconstruction (limited scope, locked)

**One sentence:** From any incident or sighting, "Stand here, look up" flips the camera from orbit to a ground-level planetarium dome showing the exact sky at that place and time — what the witness saw, every prosaic object labeled.

## Scope discipline (what this is NOT)
No constellation artwork, no deep-sky catalogs, no telescope control, no sky-touring content. Stellarium exists. Our differentiator is *sighting-anchored reconstruction only*. One entry path (from a sighting/incident card + from SKYCHECK results), one exit (return to orbit).

## The flip (second signature moment — built almost entirely from existing pieces)
1. Entry: incident card button "⦿ WITNESS VIEW — stand at the sighting, [date, local time]".
2. Camera flies to the coordinate, descends to 2m AGL, pitches up through the horizon — a 2.5s choreographed move (orbit → dive → tilt-up). Globe imagery fades to a horizon silhouette ring + compass rose; Cesium's skyAtmosphere/starfield swap for OUR computed sky.
3. Render (reusing SKYCHECK Module C engine at the incident's timestamp): 5,044 stars at correct alt/az with magnitude-scaled brightness, planets + Moon (correct phase) labeled in DM Mono, satellite passes within ±30 min as animated tracks (Starlink trains drawn as bead-strings), Milky Way band optional off.
4. The sighting itself: a pulsing `--pursue` marker at the witness-reported bearing/elevation (when known from the record) — the anomaly positioned IN the reconstructed sky next to everything it wasn't.
5. Drag to look around (simple alt/az orbit controls); pinch = FOV zoom 30°–90°; time scrubber ±3h around the incident moment (satellites animate, stars rotate).
6. HUD chip: "SKY RECONSTRUCTION — Jan 27 1994 · 41,000 ft · 45.0N 55.0E · checked: 7 planets · 5,044 stars · 148 sats" — the negative-evidence audit as ambient UI.
7. Exit: "Return to orbit" reverses the choreography.

## Implementation notes
- Rendering: a full-screen canvas/WebGL layer OVER the Cesium viewport (Cesium paused via requestRenderMode) — avoids fighting Cesium's camera at ground level; alt/az projection math is ~50 lines; reuse glow sprites.
- Historical satellites: current TLEs are only valid ±weeks. For incidents >30 days old, satellite layer shows "TLE epoch unavailable — satellite check not performed for this date" (honest) unless a historical TLE is embedded per-incident (do this for showcase incidents: fetch archival TLEs for Kazakhstan 1994 is impossible pre-Starlink — fine: pre-1998 incidents state "pre-megaconstellation era").
- Altitude handling: airborne sightings (Kazakhstan at 41,000 ft) set observer height accordingly — horizon dips, more sky visible; a detail that will delight exactly the right people.
- Reduced motion: crossfade instead of the dive choreography.

## Acceptance
- [ ] Kazakhstan 1994 witness view: correct January sky for 45N 55E (verify 3 bright stars vs Stellarium Web), observer at FL410, pre-megaconstellation notice shown.
- [ ] A 2025 incident shows real satellite tracks from cached/live TLEs.
- [ ] Flip choreography under 3s, 60fps, reversible, reduced-motion respected.
- [ ] Every witness view displays the checked-objects audit chip.
