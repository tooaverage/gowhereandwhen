/* ============================================================================
   When To Go: country outline extractor.
   Writes geo/<iso>.json (lon/lat rings, rounded) for every country that has
   an entry in places.js, so gen.js can draw the city map and the route map
   without touching the network at build time. Commit the output.

   Source: the world-atlas npm package (Natural Earth, 50m). Run:
     npm pack world-atlas@2 && tar xzf world-atlas-*.tgz
     node gen-geo.js path/to/package/countries-50m.json
   Or set WORLD_ATLAS to the directory that holds countries-50m.json.
   ========================================================================= */
const fs = require('fs');
const path = require('path');
const { PLACES } = require('./places.js');

const src = process.argv[2] || path.join(process.env.WORLD_ATLAS || '.', 'countries-50m.json');
if (!fs.existsSync(src)) {
  console.error('countries-50m.json not found at', src, '(pass the path or set WORLD_ATLAS)');
  process.exit(1);
}
const topo = JSON.parse(fs.readFileSync(src, 'utf8'));

// Same decoder as index.html: Topology -> [{id, name, polys}], polys as
// rings of [lon, lat].
function decodeTopo(topo, objName) {
  const t = topo.transform, sx = t.scale[0], sy = t.scale[1], tx = t.translate[0], ty = t.translate[1];
  const arcs = topo.arcs.map(arc => {
    let x = 0, y = 0;
    return arc.map(p => { x += p[0]; y += p[1]; return [x * sx + tx, y * sy + ty]; });
  });
  const arcAt = i => i < 0 ? arcs[~i].slice().reverse() : arcs[i];
  const ring = ids => {
    const pts = [];
    ids.forEach((id, k) => { const a = arcAt(id); for (let j = k ? 1 : 0; j < a.length; j++) pts.push(a[j]); });
    return pts;
  };
  const poly = rings => rings.map(ring);
  return topo.objects[objName].geometries.map(g => {
    let polys = [];
    if (g.type === 'Polygon') polys = [poly(g.arcs)];
    else if (g.type === 'MultiPolygon') polys = g.arcs.map(poly);
    return { id: g.id == null ? null : +g.id, name: (g.properties && g.properties.name) || '', polys };
  });
}

const feats = decodeTopo(topo, 'countries');
fs.mkdirSync('geo', { recursive: true });
for (const iso of Object.keys(PLACES)) {
  const f = feats.find(x => x.id === +iso);
  if (!f) { console.log('SKIP, no outline for iso', iso); continue; }
  // Outer rings only, three decimals (about 100 m), enough for a page map.
  const rings = [];
  for (const polygon of f.polys) {
    const r = polygon[0];
    if (!r || r.length < 4) continue;
    rings.push(r.map(p => [+p[0].toFixed(3), +p[1].toFixed(3)]));
  }
  const out = { iso: +iso, name: f.name, rings };
  fs.writeFileSync(path.join('geo', iso + '.json'), JSON.stringify(out));
  const pts = rings.reduce((n, r) => n + r.length, 0);
  console.log('geo/' + iso + '.json', f.name, rings.length, 'rings,', pts, 'points');
}
