/* ============================================================================
   When To Go: country-page maps.
   Builds the two inline SVG maps for a country page from places.js and the
   outline in geo/<iso>.json: the city heat map (dots rated by month, with a
   month picker and a city by month grid) and the backpacker route map.
   Used by gen.js. Pure string building, no DOM.
   ========================================================================= */
const fs = require('fs');
const path = require('path');
const { score, band } = require('./engine.js');
const { PLACES } = require('./places.js');

const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONF = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

function outline(iso, clip) {
  const p = path.join('geo', iso + '.json');
  if (!fs.existsSync(p)) return null;
  const geo = JSON.parse(fs.readFileSync(p, 'utf8'));
  // Optional frame for the page map (e.g. Japan without the Ryukyu islands):
  // keep only rings whose centre falls inside it.
  if (clip) {
    geo.rings = geo.rings.filter(r => {
      const c = r.reduce((a, q) => [a[0] + q[0] / r.length, a[1] + q[1] / r.length], [0, 0]);
      return inClip(c[0], c[1], clip);
    });
  }
  return geo;
}
function inClip(lon, lat, clip) {
  if (!clip) return true;
  return !(lat < (clip.minLat ?? -90) || lat > (clip.maxLat ?? 90) || lon < (clip.minLon ?? -180) || lon > (clip.maxLon ?? 180));
}

// A marker may be nudged off its true point (off: [dx, dy] in map units) so
// clustered cities stay readable; a thin leader line keeps it honest.
function mark(px, py, off) {
  if (!off) return { x: px, y: py, leader: '' };
  const x = +(px + off[0]).toFixed(1), y = +(py + off[1]).toFixed(1);
  return { x, y, leader: '<line class="leader" x1="' + px + '" y1="' + py + '" x2="' + x + '" y2="' + y + '"/><circle class="pin" cx="' + px + '" cy="' + py + '" r="3"/>' };
}

// Equirectangular projection with longitude scaled by cos(mid latitude), so
// the country keeps its shape. Fits the outline into a W-wide viewBox with
// a little padding; the height follows the country's aspect.
function projector(geo, W) {
  let minLon = 1e9, maxLon = -1e9, minLat = 1e9, maxLat = -1e9;
  for (const r of geo.rings) for (const p of r) {
    if (p[0] < minLon) minLon = p[0]; if (p[0] > maxLon) maxLon = p[0];
    if (p[1] < minLat) minLat = p[1]; if (p[1] > maxLat) maxLat = p[1];
  }
  const k = Math.cos((minLat + maxLat) / 2 * Math.PI / 180);
  const pad = 0.06;
  const spanX = (maxLon - minLon) * k, spanY = maxLat - minLat;
  const scale = W * (1 - 2 * pad) / spanX;
  const H = Math.round(spanY * scale + W * 2 * pad);
  const fn = (lon, lat) => [
    +((lon - minLon) * k * scale + W * pad).toFixed(1),
    +((maxLat - lat) * scale + W * pad).toFixed(1),
  ];
  return { W, H, fn };
}

function landPath(geo, pr) {
  let d = '';
  for (const r of geo.rings) {
    r.forEach((p, i) => { const q = pr.fn(p[0], p[1]); d += (i ? 'L' : 'M') + q[0] + ' ' + q[1]; });
    d += 'Z';
  }
  return '<path class="land" d="' + d + '"/>';
}

function svgOpen(pr, label) {
  return '<svg class="cmap" viewBox="0 0 ' + pr.W + ' ' + pr.H + '" role="img" aria-label="' + esc(label) + '" xmlns="http://www.w3.org/2000/svg">';
}

// Merge a places city with its hub record when it reuses the hub normals.
function cityRecs(iso, rec) {
  return PLACES[iso].cities.map(c => Object.assign({}, c, c.hub ? { hi: rec.hi, lo: rec.lo, pr: rec.pr } : {}));
}

function label(x, y, text, side, cls) {
  const r = side === 'l';
  return '<text class="' + cls + '" x="' + (r ? x - 17 : x + 17) + '" y="' + y + '" text-anchor="' + (r ? 'end' : 'start') + '" dominant-baseline="central">' + esc(text) + '</text>';
}

/* ---- City heat map, month picker and city by month grid ---- */
function citySection(c, rec, D) {
  const P = PLACES[c.iso];
  const geo = P && outline(c.iso, P.clip);
  if (!P || !geo) return '';
  const pr = projector(geo, 600);
  const cities = cityRecs(c.iso, rec);
  const offMap = cities.filter(x => !inClip(x.lng, x.lat, P.clip)).map(x => x.name + (x.area ? ' (' + x.area + ')' : ''));
  const m0 = D.best;
  const keys = cities.map(x => { const ks = [], ss = []; for (let m = 0; m < 12; m++) { const s = score(x, m); ss.push(s); ks.push(band(s).key); } return { ks, ss }; });

  let svg = svgOpen(pr, c.name + ' map with cities rated for the chosen month') + landPath(geo, pr);
  cities.forEach((x, i) => {
    const k = keys[i].ks[m0];
    // Off-frame cities still get a (hidden) group so the month script indexes line up.
    if (!inClip(x.lng, x.lat, P.clip)) { svg += '<g class="city" data-ks="' + keys[i].ks.join(',') + '" data-ss="' + keys[i].ss.join(',') + '" style="display:none"><circle class="halo"/><circle class="dot"/><text class="sc"></text></g>'; return; }
    const [px, py] = pr.fn(x.lng, x.lat);
    const M = mark(px, py, x.off);
    svg += '<g class="city" data-ks="' + keys[i].ks.join(',') + '" data-ss="' + keys[i].ss.join(',') + '">' + M.leader
      + '<circle class="halo" cx="' + M.x + '" cy="' + M.y + '" r="27" fill="var(--s-' + k + ')"/>'
      + '<circle class="dot" cx="' + M.x + '" cy="' + M.y + '" r="13" fill="var(--s-' + k + ')"/>'
      + '<text class="sc" x="' + M.x + '" y="' + M.y + '"' + ((k === 'ideal' || k === 'avoid') ? ' fill="#fff"' : '') + '>' + keys[i].ss[m0] + '</text>'
      + label(M.x, M.y, x.name, x.lab, 'lab') + '</g>';
  });
  svg += '</svg>';

  const chips = MON.map((m, i) => '<button type="button" data-m="' + i + '"' + (i === m0 ? ' class="on"' : '') + '>' + m + '</button>').join('');
  const head = '<tr><th class="c">City</th>' + MON.map((m, i) => '<th data-m="' + i + '"' + (i === m0 ? ' class="on"' : '') + '>' + m + '</th>').join('') + '</tr>';
  const rows = cities.map((x, i) => '<tr><td class="c">' + esc(x.name) + (x.area ? ' <small>' + esc(x.area) + '</small>' : '') + '</td>'
    + keys[i].ss.map((s, m) => '<td data-m="' + m + '" class="k-' + keys[i].ks[m] + (m === m0 ? ' on' : '') + '">' + s + '</td>').join('') + '</tr>').join('');

  return `
  <section class="section--tight" id="cities"><div class="wrap">
    <p class="eyebrow"><i data-lucide="map-pinned" class="ic"></i> By city</p>
    <h2 style="margin-top:14px">Where ${esc(c.name)} is good, month by month</h2>
    <p class="lead" style="margin:12px 0 20px">One hub city does not cover a country this size. Pick a month to rate ${cities.length} cities and areas on the same 0 to 100 scale.</p>
    <div class="mpick" id="mpick" role="tablist" aria-label="Choose a month">${chips}</div>
    <div class="cmapgrid" style="margin-top:18px">
      <div>${svg}${offMap.length ? '<p class="disc" style="margin:10px 0 0">Off the frame: ' + offMap.join(', ') + '. Rated in the grid below.</p>' : ''}</div>
      <div class="card cm-side">
        <div class="cardhd" id="cm-title">${MONF[m0]}</div>
        <p id="cm-note" style="margin:10px 0 0; color:var(--ink-2)"></p>
        <div id="cm-list" class="cm-list"></div>
      </div>
    </div>
    <div class="table-wrap hgrid" style="margin-top:22px"><table>
      <thead>${head}</thead><tbody>${rows}</tbody>
    </table></div>
    <p class="disc" style="margin:14px 0 0">Same rating as the strip above: daytime heat, overnight chill, rainfall and storm risk, from long-run normals for each city. Add <code>?m=6</code> to the address to open on July.</p>
  </div></section>
  <script>
  (function(){
    var MONF=${JSON.stringify(MONF)};
    var cities=[].slice.call(document.querySelectorAll('#cities .city'));
    var names=${JSON.stringify(cities.map(x => x.name))};
    var pick=document.getElementById('mpick');
    var q=+new URLSearchParams(location.search).get('m');
    function set(m){
      cities.forEach(function(g,i){
        var k=g.dataset.ks.split(',')[m], s=g.dataset.ss.split(',')[m];
        g.querySelector('.halo').setAttribute('fill','var(--s-'+k+')');
        g.querySelector('.dot').setAttribute('fill','var(--s-'+k+')');
        var t=g.querySelector('.sc'); t.textContent=s; t.setAttribute('fill',(k==='ideal'||k==='avoid')?'#fff':'#14130f');
      });
      pick.querySelectorAll('button').forEach(function(b){b.classList.toggle('on',+b.dataset.m===m);});
      document.querySelectorAll('#cities .hgrid [data-m]').forEach(function(el){el.classList.toggle('on',+el.dataset.m===m);});
      var rows=cities.map(function(g,i){return {n:names[i],s:+g.dataset.ss.split(',')[m],k:g.dataset.ks.split(',')[m]};}).sort(function(a,b){return b.s-a.s;});
      document.getElementById('cm-title').textContent=MONF[m];
      document.getElementById('cm-note').textContent=rows[0].n+' rates highest at '+rows[0].s+(rows[rows.length-1].s<rows[0].s?', '+rows[rows.length-1].n+' lowest at '+rows[rows.length-1].s+'.':'.');
      document.getElementById('cm-list').innerHTML=rows.map(function(r){return '<div class="r"><span class="badge badge--'+r.k+'">'+r.s+'</span><span>'+r.n+'</span></div>';}).join('');
    }
    pick.addEventListener('click',function(e){var b=e.target.closest('button');if(b)set(+b.dataset.m);});
    document.querySelector('#cities .hgrid').addEventListener('click',function(e){var el=e.target.closest('[data-m]');if(el)set(+el.dataset.m);});
    set(q>=0&&q<12&&location.search.indexOf('m=')!==-1?q:${m0});
  })();
  </script>`;
}

/* ---- Backpacker route map and stop list ---- */
function routeSection(c) {
  const P = PLACES[c.iso];
  const geo = P && P.route && outline(c.iso, P.clip);
  if (!geo) return '';
  const R = P.route;
  const pr = projector(geo, 600);
  const pts = R.stops.map(s => pr.fn(s.lng, s.lat));
  let svg = svgOpen(pr, c.name + ' backpacker route map') + landPath(geo, pr);
  svg += '<polyline class="leg" points="' + pts.map(p => p.join(',')).join(' ') + '"/>';
  let n = 0;
  R.stops.forEach((s, i) => {
    if (s.pass) return;
    n++;
    const M = mark(pts[i][0], pts[i][1], s.off);
    svg += '<g class="stopmk">' + M.leader + '<circle class="stop" cx="' + M.x + '" cy="' + M.y + '" r="12"/>'
      + '<text class="no" x="' + M.x + '" y="' + M.y + '">' + n + '</text>'
      + label(M.x, M.y, s.name, s.lab, 'lab') + '</g>';
  });
  svg += '</svg>';

  let k = 0;
  const list = R.stops.map(s => {
    if (s.pass) return '<li class="pass"><span class="via">' + esc(s.via || 'Back through ' + s.name) + '</span></li>';
    k++;
    return '<li>' + (s.via ? '<span class="via">' + esc(s.via) + '</span>' : '')
      + '<div class="stop"><span class="no">' + k + '</span><div><h3>' + esc(s.name) + ' <small>' + s.nights + (s.nights === 1 ? ' night' : ' nights') + '</small></h3>'
      + '<p>' + esc(s.p) + '</p></div></div></li>';
  }).join('');
  const nights = R.stops.reduce((a, s) => a + (s.nights || 0), 0);
  const srcs = (R.sources || []).map(s => '<a href="' + esc(s.u) + '" rel="nofollow noopener" target="_blank">' + esc(s.t) + '</a>').join(', ');

  return `
  <section class="section band" id="route"><div class="wrap">
    <p class="eyebrow eyebrow--coral"><i data-lucide="route" class="ic"></i> Backpacker route</p>
    <h2 style="margin-top:14px">${esc(R.title)}</h2>
    <p class="lead" style="margin:12px 0 20px">${esc(R.lead)}</p>
    <div class="cmapgrid">
      <div>${svg}<p class="disc" style="margin:10px 0 0">${esc(R.length)}, about ${nights} nights. Lines are the order of stops, not exact roads or ferry tracks.</p></div>
      <ol class="route">${list}</ol>
    </div>
    ${srcs ? '<p class="disc" style="margin:18px 0 0">Route drawn from ' + srcs + '. Check ferry and rail timetables for the month you travel.</p>' : ''}
  </div></section>`;
}

// The world map app inlines PLACES. gen.js swaps the block between the two
// markers in index.html for the current places.js, so the copies never drift.
function placesInline() {
  const src = fs.readFileSync('places.js', 'utf8');
  const start = src.indexOf('const PLACES');
  const end = src.indexOf('if (typeof module');
  return src.slice(start, end).trimEnd();
}

module.exports = { citySection, routeSection, placesInline, PLACES };
