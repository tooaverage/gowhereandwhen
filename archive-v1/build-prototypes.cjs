// Build the design lab from the site's existing data and scoring engine.
// Restored archive: regenerate data with node build-prototypes.cjs
const fs = require('node:fs');
const path = require('node:path');
const {DATA} = require('./source-data/data.js');
const {CONTENT} = require('./source-data/content.js');
const {score, band, monthTags, seasonOf} = require('./source-data/engine.js');
const root = __dirname;
const topo = JSON.parse(fs.readFileSync(path.join(root, 'assets/world.json'), 'utf8'));
const t = topo.transform;
const arcs = topo.arcs.map(arc => {
  let x = 0, y = 0;
  return arc.map(p => { x += p[0]; y += p[1]; return [x*t.scale[0]+t.translate[0], y*t.scale[1]+t.translate[1]]; });
});
const ring = ids => ids.flatMap((id,k) => (id<0 ? arcs[~id].slice().reverse() : arcs[id]).slice(k ? 1 : 0));
const project = ([lon,lat]) => [(lon+180)/360*1200,(90-lat)/180*600];
const features = topo.objects.countries.geometries.filter(g=>+g.id!==10).map(g => {
  const polygons = g.type==='Polygon' ? [g.arcs.map(ring)] : g.arcs.map(p=>p.map(ring));
  let d='';
  for (const polygon of polygons) for (const ring of polygon) {
    let prev=null, shift=0;
    const pts=ring.map(([lon,lat])=>{if(prev!==null){if(lon-prev>180)shift-=360;if(lon-prev < -180)shift+=360;}prev=lon;return [lon+shift,lat];});
    const toPath=offset=>pts.map((p,i)=>{const [x,y]=project([p[0]+offset,p[1]]);return `${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`;}).join('')+'Z';
    d+=toPath(0);
    if(pts.some(p=>p[0]>180))d+=toPath(-360);
    if(pts.some(p=>p[0]<-180))d+=toPath(360);
  }
  return {iso:+g.id, name:g.properties.name, d};
});
const countries = DATA.map(rec => ({...rec, slug:CONTENT.find(c=>c.iso===rec.iso)?.slug || null, months:Array.from({length:12},(_,m)=>({score:score(rec,m),band:band(score(rec,m)),tags:monthTags(rec,m),season:seasonOf(rec,m)}))}));
fs.writeFileSync(path.join(root,'data.json'),JSON.stringify({countries,features,canada:CONTENT.find(c=>c.iso===124)}));
console.log(`Restored three prototypes with ${countries.length} countries and ${features.length} map features.`);
