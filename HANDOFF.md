# Parallax Map — Claude Code Handoff Package

## Contents
```
parallax-map-handoff/
├── CLAUDE.md                       ← Claude Code auto-reads this (context, design tokens, conventions)
├── SPEC.md                         ← Full requirements + acceptance criteria + build order
├── README.md                       ← This file
├── enrich_shapes.js                ← One-time shape enrichment (already run; kept for methodology/provenance)
└── data/
    ├── incidents.json              ← 32 verified incidents (1944–2026, 17 countries, full intel briefings)
    ├── incidents_v2_existing.json  ← The original 28 (pre-sweep) for reference/diff
    ├── sightings.json              ← 565 live sighting points
    └── hotspots.json               ← 8 activity hotspots with counts + descriptions
```

## Setup
```bash
mkdir parallax-map && cd parallax-map
# copy this entire handoff folder's contents into the repo root
claude
```

## Kickoff prompt (paste into Claude Code)
> Read CLAUDE.md and SPEC.md, then build the application following the build order in SPEC.md §5. Work incrementally: after each numbered step, run a quick sanity check before moving on. During development you may load data/*.json via fetch with a local server, but the FINAL deliverable is one self-contained index.html with all three datasets embedded inline that opens correctly from file:// with zero console errors and zero API keys. Finish by walking the acceptance checklist in SPEC.md §4 and reporting pass/fail per item.

## Notes
- The 4 newest incidents (ids 28–31: Kazakhstan 1994, Zimbabwe/Harare 2008, Genkai 2025, Lake Huron 2023) came from the July 2026 research sweep and are already merged into incidents.json in the canonical schema.
- The `shape` field is ALREADY BAKED into incidents.json via `enrich_shapes.js` (keyword pass + 16 reviewed analyst overrides, justifications inline in the script). Distribution: Lights 8, Orb 4, Disk 4, Triangle 3, Tic-Tac 3, Sphere 3, Unknown 7. Rerunning the script is idempotent.
- Reference implementation of the prior generation (canvas-based, no Cesium): `parallax-globe-v2.html` in the main project — useful for briefing-card content styling, not for architecture.
