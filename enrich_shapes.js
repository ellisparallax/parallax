#!/usr/bin/env node
/**
 * enrich_shapes.js — one-time enrichment: bake a `shape` field into incidents.json
 * Taxonomy: Tic-Tac | Disk | Triangle | Sphere | Orb | Lights | Unknown
 * Method: priority-ordered keyword pass over name+summary+what+sigs,
 *         then explicit analyst overrides for cases where keywords mislead.
 * Run:    node enrich_shapes.js   (from the package root)
 */
const fs = require('fs');
const PATH = 'data/incidents.json';
const incidents = JSON.parse(fs.readFileSync(PATH, 'utf8'));

// Priority-ordered rules: first match wins.
const RULES = [
  ['Tic-Tac',  /tic[\s-]?tac|pill[\s-]?shaped|ellipsoid|football[\s-]?shaped|cigar[\s-]?shaped/i],
  ['Triangle', /triangul|triangle|delta|v[\s-]?formation|boomerang|chevron/i],
  ['Disk',     /\bdisc\b|\bdisk\b|saucer|flying disc/i],
  ['Sphere',   /spher|metallic ball|round object/i],
  ['Orb',      /\borbs?\b/i],
  ['Lights',   /\blights?\b|glowing|luminous|bright object/i],
];

// Analyst overrides (id -> shape) where the keyword pass is known to misfire.
// Justifications kept inline for the record.
const OVERRIDES = {
  0:  'Orb',      // Foo Fighters: glowing orbs tracking aircraft — canonical orb case, not metallic spheres
  2:  'Lights',   // Lubbock: V-FORMATION keyword misfired; phenomenon was formations of lights
  3:  'Orb',      // Malmstrom: Salas — "glowing red object" over front gate; orb characterization
  4:  'Lights',   // Tehran: brilliant strobing light source; shape never resolved
  5:  'Lights',   // Shag Harbour: four flashing lights descending into harbor
  6:  'Orb',      // Colares/Prato: luminous beam-emitting objects; orb is the dominant descriptor class
  7:  'Triangle', // Rendlesham: Penniston close-encounter description — triangular craft ~3m
  8:  'Disk',     // Trans-en-Provence: Nicolaï described a lead-grey saucer; GEPAN trace case
  9:  'Disk',     // Usovo 1982: witness descriptions of an enormous disc over the base
  15: 'Unknown',  // PURSUE Release: meta/aggregate disclosure entry — no single shape
  16: 'Orb',      // FBI Western Orbs: it's in the name; sphere-keyword outranked orb wrongly
  19: 'Disk',     // Westall 1966: silvery-grey saucer descriptions from schoolchildren/teachers
  21: 'Lights',   // NJ Drone Wave: overwhelmingly lights-in-sky reports
  22: 'Tic-Tac',  // Pascagoula: oval/egg-shaped craft — ellipsoid taxonomy bucket
  23: 'Lights',   // Valentich: "four bright lights," elongated shape unresolved
  25: 'Sphere',   // North West Cape 1991: hovering large black sphere (Exmouth)
};

function classify(inc) {
  if (OVERRIDES[inc.id]) return { shape: OVERRIDES[inc.id], via: 'override' };
  const hay = [inc.name, inc.summary, inc.what, (inc.sigs || []).join(' ')].join(' :: ');
  for (const [shape, re] of RULES) if (re.test(hay)) return { shape, via: re.source.slice(0, 24) };
  return { shape: 'Unknown', via: 'no-match' };
}

const rows = incidents.map(inc => {
  const { shape, via } = classify(inc);
  inc.shape = shape;
  return { id: inc.id, name: inc.name.slice(0, 30), year: inc.year, shape, via };
});
console.table(rows);
const dist = incidents.reduce((a, i) => ((a[i.shape] = (a[i.shape] || 0) + 1), a), {});
console.log('Distribution:', JSON.stringify(dist));

fs.writeFileSync(PATH, JSON.stringify(incidents, null, 2));
console.log(`Baked shape into ${incidents.length} records -> ${PATH}`);
