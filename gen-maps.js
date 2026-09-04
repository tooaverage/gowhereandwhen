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
    <h2 style="margin-top:14px">Which city, which month</h2>
    <p class="lead" style="margin:12px 0 20px">The strip above rates ${esc(rec.city)}. Pick a month to see how ${cities.length} cities compare.</p>
    <div class="mpick" id="mpick" role="tablist" aria-label="Choose a month">${chips}</div>
    <div class="cmapgrid" style="margin-top:18px">
      <div>${svg}${offMap.length ? '<p class="disc" style="margin:10px 0 0">Off the frame: ' + offMap.join(', ') + '. It is in the grid below.</p>' : ''}</div>
      <div class="card cm-side">
        <div class="cardhd" id="cm-title">${MONF[m0]}</div>
        <p id="cm-note" style="margin:10px 0 0; color:var(--ink-2)"></p>
        <div id="cm-list" class="cm-list"></div>
      </div>
    </div>
    <div class="table-wrap hgrid" style="margin-top:22px"><table>
      <thead>${head}</thead><tbody>${rows}</tbody>
    </table></div>
    <p class="disc" style="margin:14px 0 0">Same 0 to 100 rating as the strip above, from each city's own long-run normals.</p>
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

/* ---- Backpacker route map and stop list, with a trip-length filter ----
   Each stop carries a tier: the shortest trip (in days) that includes it.
   Nights are written for two weeks and rescaled to the chosen length by the
   page script, which also redraws the line and renumbers the stops. */
const LENGTHS = [[3, '3 days'], [7, '1 week'], [14, '2 weeks'], [30, '1 month']];
function routeSection(c) {
  const P = PLACES[c.iso];
  const geo = P && P.route && outline(c.iso, P.clip);
  if (!geo) return '';
  const R = P.route;
  const pr = projector(geo, 600);
  let svg = svgOpen(pr, c.name + ' backpacker route map') + landPath(geo, pr) + '<polyline class="leg" id="rt-line" points=""/>';
  R.stops.forEach((s, i) => {
    const on = inClip(s.lng, s.lat, P.clip);
    const [x, y] = on ? pr.fn(s.lng, s.lat) : [0, 0];
    const M = mark(x, y, s.off);
    svg += '<g class="stopmk" data-i="' + i + '" data-tier="' + (s.tier || 14) + '" data-xy="' + x + ',' + y + '"' + (on ? '' : ' data-off="1"') + (s.pass ? ' data-pass="1"' : '') + '>'
      + (s.pass || !on ? '' : M.leader + '<circle class="stop" cx="' + M.x + '" cy="' + M.y + '" r="12"/><text class="no" x="' + M.x + '" y="' + M.y + '"></text>' + label(M.x, M.y, s.name, s.lab, 'lab'))
      + '</g>';
  });
  svg += '</svg>';

  const list = R.stops.map((s, i) => {
    const on = inClip(s.lng, s.lat, P.clip);
    const prevName = i ? R.stops[i - 1].name : '';
    const vias = Object.assign({}, s.alt || {}, s.via ? { [s.from || prevName]: s.via } : {});
    const attrs = ' data-i="' + i + '" data-tier="' + (s.tier || 14) + '" data-n="' + (s.nights || 0) + '" data-name="' + esc(s.name) + '" data-via="' + esc(JSON.stringify(vias)) + '"';
    if (s.pass) return '<li class="pass"' + attrs + ' data-pass="1"><span class="via">' + esc(s.via || 'Back through ' + s.name) + '</span></li>';
    return '<li' + attrs + '><span class="via"></span>'
      + '<div class="stop"><span class="no"></span><div><h3>' + esc(s.name) + ' <small class="nt"></small>' + (on ? '' : ' <small>off the map</small>') + '</h3>'
      + '<p>' + esc(s.p) + '</p></div></div></li>';
  }).join('');
  const chips = LENGTHS.map(([d, t]) => '<button type="button" data-d="' + d + '"' + (d === 14 ? ' class="on"' : '') + '>' + t + '</button>').join('');
  const srcs = (R.sources || []).map(s => '<a href="' + esc(s.u) + '" rel="nofollow noopener" target="_blank">' + esc(s.t) + '</a>').join(', ');

  return `
  <section class="section band" id="route"><div class="wrap">
    <p class="eyebrow eyebrow--coral"><i data-lucide="route" class="ic"></i> Backpacker route</p>
    <h2 style="margin-top:14px">${esc(R.title)}</h2>
    <p class="lead" style="margin:12px 0 20px">${esc(R.lead)}</p>
    <div class="row" style="gap:14px; margin-bottom:18px"><span class="eyebrow eyebrow--sun">How long have you got?</span><div class="mpick" id="rpick" role="tablist" aria-label="Trip length">${chips}</div></div>
    <div class="cmapgrid">
      <div>${svg}<p class="disc" style="margin:10px 0 0"><span id="rt-sum"></span> Lines show the order of stops, not the roads or ferry tracks.</p></div>
      <ol class="route" id="rt-list" data-onward="${esc(R.onward || 'Onward')}">${list}</ol>
    </div>
    ${srcs ? '<p class="disc" style="margin:18px 0 0">Route drawn from ' + srcs + '. Check timetables for the month you travel.</p>' : ''}
  </div></section>
  <script>
  (function(){
    var LEN=${JSON.stringify(Object.fromEntries(LENGTHS))};
    var pick=document.getElementById('rpick'), list=document.getElementById('rt-list'), line=document.getElementById('rt-line');
    var marks=[].slice.call(document.querySelectorAll('#route .stopmk')), items=[].slice.call(list.children);
    function vias0(li){ var v=JSON.parse(li.dataset.via||'{}'); return v[Object.keys(v)[0]]||''; }
    function set(d){
      pick.querySelectorAll('button').forEach(function(b){b.classList.toggle('on',+b.dataset.d===d);});
      var on=items.map(function(li){return +li.dataset.tier<=d;});
      // Nights: scale the two-week baseline to the trip, at least one night each.
      var T=d-1, idx=[], B=0;
      items.forEach(function(li,i){ if(on[i]&&!li.dataset.pass){ idx.push(i); B+=+li.dataset.n; } });
      var nights={}, sum=0, big=idx[0];
      idx.forEach(function(i){ var n=Math.max(1,Math.round(+items[i].dataset.n*T/B)); nights[i]=n; sum+=n; if(+items[i].dataset.n>+items[big].dataset.n) big=i; });
      nights[big]=Math.max(1,nights[big]+T-sum);
      var k=0, prev=-1, pts=[];
      items.forEach(function(li,i){
        li.hidden=!on[i];
        var mk=marks[i];
        mk.style.display=on[i]?'':'none';
        if(!on[i]) return;
        if(!mk.dataset.off) pts.push(mk.dataset.xy);
        var via=li.querySelector('.via');
        if(li.dataset.pass){ via.textContent=vias0(li); prev=i; return; }
        var vias=JSON.parse(li.dataset.via||'{}'), pn=prev<0?'':items[prev].dataset.name;
        via.textContent = prev<0 ? '' : (vias[pn] || list.dataset.onward);
        via.hidden = prev<0;
        k++;
        li.querySelector('.no').textContent=k;
        var t=mk.querySelector('.no'); if(t) t.textContent=k;
        li.querySelector('.nt').textContent=nights[i]+(nights[i]===1?' night':' nights');
        prev=i;
      });
      line.setAttribute('points',pts.join(' '));
      document.getElementById('rt-sum').textContent=LEN[d]+': '+k+(k===1?' stop, ':' stops, ')+T+' nights.';
    }
    pick.addEventListener('click',function(e){var b=e.target.closest('button');if(b)set(+b.dataset.d);});
    set(14);
  })();
  </script>`;
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
