# SKYCHECK-SPEC — Astronomical Cross-Reference & Prosaic-Object Discrimination Module

**Purpose:** Answer one question at the point of observation: *"Is the thing in the sky a cataloged astronomical/artificial object, or a genuine unknown?"* This module operationalizes Parallax's noise-filtering doctrine — every civilian report that passes this filter is a higher-value data point; every report it resolves is contamination removed. It serves BOTH live sky-watching (phone held up to sky) and after-the-fact analysis (uploaded photos/reports).

---

## 1. HOW THE BEST SKY APPS DO IT (dissection → what we borrow)

**Stellarium (open-source gold standard).** Full planetary ephemeris (VSOP87), star catalogs, atmospheric refraction modeling, time scrubbing. Its browser port (Stellarium Web) proves a full planetarium runs in JS. *We borrow:* the ephemeris-first architecture — compute what SHOULD be visible, then compare against what IS seen.

**SkySafari / Sky Guide (sensor-fusion AR).** The hold-phone-to-sky magic is sensor fusion: GPS (observer position) + clock (time) + magnetometer/gyro/accelerometer (pointing direction) → altitude/azimuth of the camera axis → overlay catalog objects within the field of view. Gyro smooths the jittery compass (complementary/Kalman filtering). *We borrow:* the entire pointing pipeline via the browser's Geolocation API + DeviceOrientationEvent.

**astrometry.net (blind plate solving).** Identifies ANY star field photo with zero metadata by hashing 4-star geometric patterns ("quads") against a pre-built index, returning precise WCS coordinates. This is how you identify everything in an uploaded photo definitively. *We borrow:* as an OPTIONAL enhancement via their free API (nova.astrometry.net) — full client-side blind solving is not realistic in a single-file app; the sensor/metadata path below needs no key and covers the primary use case.

**Heavens-Above / ISS Detector (satellite prediction).** TLE orbital elements + SGP4 propagation → pass predictions with brightness estimates. Starlink trains — the #1 modern UAP-report contaminant — are pure TLE math. *We borrow:* satellite.js (SGP4 in JS) + CelesTrak's free GP data feeds.

**Key insight from all four:** none of them do image recognition of stars in the live view — they trust the ephemeris + sensors. Image analysis is only needed for the uploaded-photo case, where astrometry.net exists.

## 2. LIBRARIES & DATA (all CDN / no keys, consistent with project constraints)

- **astronomy-engine** (MIT, ~120KB): positions of Sun, Moon, planets to arcminute accuracy; sidereal time; RA/Dec↔Alt/Az transforms; rise/set; Moon phase. `https://cdn.jsdelivr.net/npm/astronomy-engine`
- **satellite.js** (MIT): SGP4/SDP4 TLE propagation. `https://cdn.jsdelivr.net/npm/satellite.js`
- **exifr** (MIT): EXIF extraction from uploaded photos (timestamp, GPS, sometimes heading). `https://cdn.jsdelivr.net/npm/exifr`
- **data/skycheck_stars.json** (INCLUDED, 240KB): 5,044 stars to mag 6.5 (naked-eye complete), 493 with proper names, RA/Dec/mag/name. Source: d3-celestial (BSD), merged from Yale BSC. Embed inline in final bundle.
- **data/visual_sats.tle** (INCLUDED): 148 brightest satellites, epoch 2026-07-02 — offline fallback. LIVE fetch at runtime: `https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle` and `GROUP=starlink` (fetch Starlink only on demand — ~8MB). Graceful degradation to the cached file when offline; SHOW the TLE epoch age in the UI (stale TLEs = degraded accuracy, be honest about it).
- Magnetic declination: astronomy-engine does not provide it; implement the simple WMM dipole approximation or accept ±3° error and widen the match cone (declared in UI).

## 3. MODULE ARCHITECTURE

### Module A — LIVE SKYCHECK (AR pointing mode)
1. `navigator.geolocation` → lat/lon/alt. 2. `DeviceOrientationEvent` (iOS: requires user-gesture permission request + HTTPS) → device quaternion → camera-axis Alt/Az (apply magnetic declination correction). 3. `getUserMedia` rear camera as background layer. 4. Every frame (throttled 10Hz): compute Alt/Az of all catalog objects (planets via astronomy-engine; stars via sidereal transform of skycheck_stars.json; satellites via satellite.js propagation) → render those within camera FOV (~65° diagonal typical; allow calibration) as labeled overlay markers. 5. Tap any marker → object card (name, type, magnitude, why it looks the way it looks — e.g., "Capella: bright star low on horizon; atmospheric scintillation causes red/green flashing commonly reported as UAP").
**Honest constraint (state in UI):** phone compasses are ±10–20° until figure-8 calibrated; the app must render an uncertainty cone, not a false-precision crosshair. AR mode requires HTTPS hosting (sensors are blocked on file://) — the app detects file:// and hides AR mode gracefully, keeping Modules B–D fully functional.

### Module B — PHOTO/REPORT ANALYZER (upload mode, works everywhere)
1. User uploads sighting photo → exifr extracts timestamp + GPS (+ heading if present); missing fields fall back to manual entry (date/time picker, map-pin location, compass-rose bearing widget, elevation-angle slider).
2. Engine computes every catalog object within the uncertainty cone (default ±15° around stated bearing/elevation) at that instant: planets, Moon, bright stars, ISS, visible sats, Starlink trains (fetch TLEs for that epoch — CelesTrak supports historical GP queries; if unavailable, flag "satellite check limited").
3. Output: ranked candidate list with angular separation from the stated position + a plain-language verdict card.
4. OPTIONAL (settings toggle, off by default, requires free API key): submit photo to nova.astrometry.net for blind plate solve → definitive identification of the star field and precise position of any non-stellar object in frame.

### Module C — VERDICT ENGINE (the discrimination checklist, codified)
Score candidates and behaviors against the prosaic ladder, in order:
1. **Planet match** (<3° from Venus/Jupiter/Mars/Saturn, alt >0): Venus is the single most-reported "UAP" in history — steady, brilliant, slow drift. → IDENTIFIED-LIKELY.
2. **Bright star match** (<3°, mag <2.5): if report says "flashing colors, stationary for minutes, near horizon" → scintillation explainer (Capella, Sirius, Arcturus are the classic offenders). → IDENTIFIED-LIKELY.
3. **Satellite/ISS/Starlink match** (pass within cone ±2 min): steady point, straight line, 2–8 min transit, fades into Earth's shadow; a *string* of points = Starlink train. → IDENTIFIED-LIKELY.
4. **Aircraft heuristic** (no ADS-B API without keys; use behavior): red/green/white strobes, ~1Hz flash. → PROBABLE-AIRCRAFT (advise checking adsbexchange/FR24 manually; deep-link with time/место prefilled).
5. **Lantern/balloon/drone heuristics:** orange flicker drifting with wind in loose groups = lanterns; hover + instant relocation + <400ft = consumer drone.
6. **Bolide/meteor:** <10s duration, fragmentation, terminal flash.
7. **NO MATCH + anomalous kinematics** (reported right-angle turns, hover→instant acceleration, transmedium entry): → **CANDIDATE UNKNOWN** — route to structured report flow.
Verdict card always shows: match name, confidence (angular error + behavior consistency), and *what was checked* ("checked 7 planets, 5,044 stars, 148 satellites, Starlink not fetched [offline]") — transparent negative evidence is the point.

### Module D — INTEGRATION WITH THE TRACKING MAP
- CANDIDATE UNKNOWN verdicts generate a structured sighting record `{lat, lon, timestamp, bearing, elevation, shape, behavior_flags[], skycheck: {checked:[...], ruled_out:[...], residual:'unknown'}}` appendable to sightings.json — every crowd report enters the database pre-filtered, with its negative-evidence audit attached.
- Reverse mode: clicking any existing sighting on the globe offers "Reconstruct sky" — renders what the sky contained at that place/time (was Venus up? was a Starlink train passing?). This retroactively stress-tests the 565 existing sighting points.

## 4. CORE MATH (implementation notes)
- RA/Dec → Alt/Az: astronomy-engine `Horizon()` handles it including refraction; for the 5,044-star bulk transform per frame, precompute GMST once per tick and do the spherical trig inline (fast path), reserving the library call for tap-detail accuracy.
- Note stars.6/skycheck coordinates: RA in degrees, may be negative (add 360), Dec in degrees.
- Satellite look-angles: satellite.js `propagate()` → ECI → `eciToLookAngles(observerGd, positionEci, gmst)`.
- Sun altitude gate: satellites are only visible when observer is in twilight/night AND satellite is sunlit — check sun altitude at satellite height (satellite.js gives ECI; compare against astronomy-engine sun vector) to avoid predicting invisible passes.
- FOV math for uploaded photos: if EXIF has focal length + sensor model, compute true FOV; else default 65° and widen uncertainty.

## 5. ACCEPTANCE CRITERIA
- [ ] Enter a known Venus-report scenario (e.g., westward bright light, 45 min after sunset, any 2026 date) → verdict identifies Venus with small angular error.
- [ ] Enter an ISS pass (verify against Heavens-Above for same location/time) → matched within ±2 min and ±5°.
- [ ] Reconstruct-sky on an existing sighting point renders correct bright stars/planets for that timestamp (spot-check vs Stellarium Web).
- [ ] Photo with EXIF GPS+time auto-populates the analyzer; photo without EXIF falls back to manual widgets.
- [ ] AR mode: correct permission flow on iOS Safari + Android Chrome over HTTPS; hidden gracefully on file://.
- [ ] Verdict card always lists what was checked and TLE epoch age; UNKNOWN verdicts produce a valid structured record.
- [ ] Offline: module still resolves planets/stars (no network needed) and satellites from cached TLEs with staleness warning.

## 6. EPISTEMIC RULES (non-negotiable, from the wiki constitution)
The engine outputs *likelihoods, never dogma*: an object 2° from Venus's computed position IS Venus until behavior says otherwise, and a NO-MATCH is a "residual unknown," not an "alien." Confidence language is mandatory: IDENTIFIED-LIKELY / PROBABLE / CANDIDATE UNKNOWN. The tool's credibility — and the database's value — depends on it identifying the mundane relentlessly and flagging the residue honestly.
