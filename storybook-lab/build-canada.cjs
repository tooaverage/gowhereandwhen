// Storybook's city additions are independent of the saved earlier editions.
const fs=require('node:fs'),path=require('node:path'),E=require('../engine.js');
const r=__dirname,root=path.dirname(r);
const cities=require('./canada-cities.json').map(c=>({...c,months:c.hi.map((_,m)=>({score:E.score(c,m),band:E.band(E.score(c,m)),tags:E.monthTags(c,m),season:E.seasonOf(c,m)}))}));
const data=JSON.parse(fs.readFileSync(path.join(root,'play/data.json')));
const canada=data.find(c=>c.iso===124);canada.cities=cities;
canada.lead='For a first trip, aim for <strong>June to September</strong>. The west coast, Rockies, eastern cities and Yukon have different seasons. Compare eight cities, or plan a separate winter trip for skiing and northern lights.';
fs.writeFileSync(path.join(r,'data.json'),JSON.stringify(data));
// Decode the same Natural Earth outline used by the world map.
const topo=JSON.parse(fs.readFileSync(path.join(root,'play/vendor/world.json'))),t=topo.transform;
const arcs=topo.arcs.map(arc=>{let x=0,y=0;return arc.map(p=>{x+=p[0];y+=p[1];return [+(x*t.scale[0]+t.translate[0]).toFixed(3),+(y*t.scale[1]+t.translate[1]).toFixed(3)];});});
const country=topo.objects.countries.geometries.find(g=>+g.id===124);
const polygons=country.type==='Polygon'?[country.arcs]:country.arcs;
const rings=polygons.map(p=>p[0].flatMap((id,i)=>{const a=id<0?arcs[~id].slice().reverse():arcs[id];return i?a.slice(1):a;}));
fs.writeFileSync(path.join(root,'geo/124.json'),JSON.stringify({iso:124,name:'Canada',rings}));
const {PLACES}=require('../places.js');PLACES[124]={cities};
const {citySection}=require('../gen-maps.js');
let html=citySection({iso:124,name:'Canada'},canada,{best:6}).replace(/<script>[\s\S]*?<\/script>/g,'');
html=html.replace('class="section--tight"','class="guide-section canada-cities"');
html=html.replace('Same 0 to 100 rating as the strip above, from each city\'s own long-run normals.','Colours and numbers show weather comfort, not how good a ski or northern-lights trip will be.');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
html+=`<section class="guide-section canada-seasons" id="canada-seasons"><div class="wrap"><h2>Canada, one region at a time</h2><p>These windows suit general sightseeing. Mountain snow, lake ice and autumn colour vary each year.</p><div class="canada-visit-grid">${cities.map(c=>`<article><h3>${esc(c.name)}</h3><p class="visit-window">${esc(c.bestTime)}</p><p>${esc(c.visitNote)}</p></article>`).join('')}</div><h3>Make room for somewhere special</h3><div class="canada-sights"><a href="../../index.html?country=124&amp;sight=rockies">Snow-capped Rockies &amp; Lake Louise</a><a href="../../index.html?country=124&amp;sight=cn-tower">Toronto’s CN Tower</a><a href="../../index.html?country=124&amp;sight=frontenac">Château Frontenac</a><a href="../../index.html?country=124&amp;sight=peggys-cove">Peggy’s Cove lighthouse</a><a href="../../index.html?country=124&amp;sight=vancouver">Canada Place, Vancouver</a></div><p><strong>Rockies:</strong> July and August are a good starting point for alpine lakes and hiking; winter is for snow sports. Check local trail and avalanche conditions before heading into the mountains.</p><details class="canada-sources"><summary>About the city ratings and seasons</summary><p>Monthly city figures are rounded Environment and Climate Change Canada station normals for 1981–2010. They describe a historical baseline, not a forecast. Airport readings can differ from downtown and mountain conditions. Precipitation includes the water equivalent of snow. The country overview retains Toronto’s existing series.</p><ul>${cities.map(c=>`<li><a href="${c.source.url}">${esc(c.name)}: ${esc(c.source.station)}</a></li>`).join('')}</ul><p>Season guidance: <a href="https://travel.destinationcanada.com/en-us/things-to-do/8-places-to-visit-in-canada-during-the-summer">Destination Canada</a>, <a href="https://www.banfflakelouise.com/seasons-climate">Banff &amp; Lake Louise</a>, <a href="https://www.travelyukon.com/en/media/northern-lights">Travel Yukon</a>, <a href="https://travel.destinationcanada.com/en-us/things-to-do/top-fall-destinations-across-canada">autumn in Canada</a>.</p></details></div></section>`;
fs.writeFileSync(path.join(r,'canada-guide.html'),html);
console.log('Built Canada: '+cities.length+' cities with 12 months each.');
