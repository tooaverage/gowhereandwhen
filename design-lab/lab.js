/* Design layer: retain original map, country content and all generated behaviors. */
(() => {
'use strict';
const meta=window.LAB_META, $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const params=new URLSearchParams(location.search);
let theme=document.documentElement.dataset.theme;
const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
const palette={ideal:'#32785d',great:'#a2b966',good:'#e1ce82',fair:'#96b8c8',avoid:'#596f8c'};
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let gl=null, world=null, baseStyle=null, loaded=false, pendingCamera=null, popup=null;
function urlFor(path){const u=new URL(meta.root+path,location.href);u.searchParams.set('theme',theme);if(meta.map){u.searchParams.set('m',state.month);u.searchParams.set('country',state.selIso||392);}else if(params.has('m'))u.searchParams.set('m',params.get('m'));return u;}
function links(){const japan=$('.lab-japan');if(japan)japan.href=urlFor('country/japan/').href;$$('a[href]').forEach(a=>{const href=a.getAttribute('href');if(!href||href.startsWith('#'))return;const u=new URL(href,location.href);if(u.origin!==location.origin||!u.pathname.includes('/prototypes/'))return;u.searchParams.set('theme',theme);if(meta.map){u.searchParams.set('m',state.month);}else if((u.pathname.endsWith('/index.html')||u.pathname.endsWith('/prototypes/'))&&meta.iso)u.searchParams.set('country',meta.iso);a.href=u.href;});}
function updateAddress(){const u=new URL(location.href);u.searchParams.set('theme',theme);if(meta.map){u.searchParams.set('m',state.month);u.searchParams.set('country',state.selIso||392);u.searchParams.delete('month');u.hash='';}history.replaceState(null,'',u);links();}
function switchTheme(next){theme=next;document.documentElement.dataset.theme=theme;$$('[data-lab-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.labTheme===theme)));if(gl&&baseStyle){loaded=false;pendingCamera=null;gl.setStyle(styleForTheme());gl.easeTo({pitch:theme==='explorer'?58:0,bearing:theme==='explorer'?-18:0,duration:reduced()?0:700});}updateAddress();}
$$('[data-lab-theme]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.labTheme===theme));b.addEventListener('click',()=>switchTheme(b.dataset.labTheme));});
links();
if(!meta.map){
  const cover=$('.cover');
  if(cover&&meta.slug==='japan'){
    const text=document.createElement('div');text.className='lab-cover-text';while(cover.firstChild)text.append(cover.firstChild);cover.append(text);cover.classList.add('lab-japan-cover');
    const title=$('h1',cover);title.textContent='Japan';title.setAttribute('aria-label','When to go to Japan');
    const figure=document.createElement('figure');figure.className='lab-cover-photo';figure.innerHTML='<img src="https://upload.wikimedia.org/wikipedia/commons/c/cd/Azusa_river_and_Mount_Hotakadake_as_seen_from_Kamikochi_20110717_0710_photo_by_Pcs34560.jpg" width="2736" height="3648" alt="The turquoise Azusa River beneath the Hotaka mountains in Kamikochi, Japan"><figcaption><a href="https://commons.wikimedia.org/wiki/File:Azusa_river_and_Mount_Hotakadake_as_seen_from_Kamikochi_20110717_0710_photo_by_Pcs34560.jpg" target="_blank" rel="noopener">Kamikōchi, Japanese Alps. Photograph by Pcs34560.</a></figcaption>';cover.append(figure);
    $('img',figure).addEventListener('error',()=>{figure.classList.add('photo-unavailable');$('figcaption',figure).textContent='Kamikōchi, Japanese Alps. Photograph unavailable.';});
  }
  $$('.strip .tile').forEach((tile,i)=>{const score=Number($('.sc',tile)?.textContent)||0;tile.style.setProperty('--graph-height',Math.max(7,score*1.2)+'px');tile.setAttribute('tabindex','0');tile.setAttribute('role','button');tile.setAttribute('aria-label',monthNames[i]+': weather comfort '+score+' out of 100. See month details.');const jump=()=>{const rows=$$('#months tbody tr');rows[i]?.scrollIntoView({behavior:reduced()?'instant':'smooth',block:'center'});rows[i]?.classList.add('lab-month-selected');setTimeout(()=>rows[i]?.classList.remove('lab-month-selected'),2400);};tile.addEventListener('click',jump);tile.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();jump();}});});
  $$('.mpick').forEach(p=>{p.setAttribute('role','group');$$('button',p).forEach(b=>{b.setAttribute('aria-pressed',String(b.classList.contains('on')));b.addEventListener('click',()=>{$$('button',p).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});});});
  $$('.embed[data-stay22]').forEach(el=>{const note=document.createElement('p');note.className='disc';note.textContent='If the accommodation map does not load, use the hotel search link alongside it.';el.after(note);});
  updateAddress();return;
}
// Keep the original source data and engine. Only the palette and presentation change.
CFG.bands.forEach(b=>{b[3]=palette[b[1]];});
Object.keys(TAGSTYLE).forEach(k=>{TAGSTYLE[k]=['#dbe5dd','#183c37'];});
const originalRender=renderDetail;
renderDetail=function(iso){originalRender(iso);const rec=byIso.get(iso);if(!rec)return;$$('.arc .swatch',detailEl).forEach((bar,i)=>{const s=score(rec,i);bar.textContent='';bar.style.height=Math.max(6,s*.78)+'px';bar.setAttribute('role','button');bar.setAttribute('tabindex','0');bar.setAttribute('aria-label',`${monthNames[i]}: ${s} out of 100`);bar.setAttribute('aria-pressed',String(i===state.month));bar.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setMonth(i);}});});$$('.arc .lab',detailEl).forEach((lab,i)=>lab.textContent=monthNames[i].slice(0,3));const verdict=$('.verdict .pill',detailEl);if(verdict)verdict.textContent=band(score(rec,state.month)).label+' weather';const button=$('#zoomCountry');if(button){const clone=button.cloneNode(true);button.replaceWith(clone);clone.addEventListener('click',()=>focusCountry(iso));}$$('.areas .r',detailEl).forEach(row=>{const name=row.children[1]?.textContent;const c=PLACES[iso]?.cities.find(c=>c.name===name);if(!c)return;row.setAttribute('role','button');row.setAttribute('tabindex','0');row.setAttribute('aria-label','Explore '+name);row.style.cursor='pointer';const go=()=>{if(gl)gl.flyTo({center:[c.lng,c.lat],zoom:9,pitch:theme==='explorer'?60:0,duration:reduced()?0:1300});};row.addEventListener('click',go);row.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go();}});});$('#closeDetail').addEventListener('click',()=>updateGeo());updateAddress();};
const originalMonth=setMonth;
setMonth=function(m){originalMonth(m);updateGeo();updateAddress();$$('#months button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.m===m)));};
const originalSelect=select;
select=function(iso,zoom){originalSelect(iso,false);updateGeo();if(zoom)focusCountry(iso);};
const originalView=setView;
setView=function(v){originalView(v);if(gl&&v==='map')gl.resize();const options=$('.lab-map-options');if(options)options.hidden=v==='grid';};
const requestedMonth=params.has('m')?Number(params.get('m')):params.has('month')?Number(params.get('month'))-1:10;
setMonth(Number.isInteger(requestedMonth)&&requestedMonth>=0&&requestedMonth<12?requestedMonth:10);
const initialIso=byIso.has(Number(params.get('country')))&&Number(params.get('country'))!==124?Number(params.get('country')):392;
select(initialIso,false);
// Retain the original local SVG as a usable map if detailed tiles or WebGL fail.
const fallbackLoad=buildMap;
buildMap=function(topo){fallbackLoad(topo);if(!gl)zoomToCountry(initialIso,true);};
const search=$('#search');search.placeholder='Search countries or cities';search.setAttribute('aria-label','Search countries or cities');
const controls=document.createElement('div');controls.className='lab-map-options';controls.setAttribute('aria-label','Explore the map');controls.innerHTML='<button data-camera="world">World</button><button data-camera="japan">Japan</button><button data-camera="alps">Japanese Alps</button><button data-camera="philippines">Philippines</button>';
document.body.append(controls);
const caption=document.createElement('div');caption.className='lab-map-caption';caption.setAttribute('role','status');document.body.append(caption);
controls.addEventListener('click',e=>{const k=e.target.closest('[data-camera]')?.dataset.camera;if(!k)return;if(state.view!=='map')setView('map');if(!gl){select(k==='philippines'?608:392,true);return;}if(k==='world'){gl.flyTo({center:[30,20],zoom:1.5,pitch:0,bearing:0,duration:reduced()?0:1100});return;}if(k==='japan'){select(392,false);focusCountry(392);}if(k==='philippines'){select(608,false);focusCountry(608);}if(k==='alps'){select(392,false);gl.flyTo({center:[137.63,36.29],zoom:10.4,pitch:theme==='explorer'?66:0,bearing:-20,duration:reduced()?0:1400});}});
function boundsFor(iso){const feature=world?.features.find(f=>Number(f.id)===iso);if(!feature)return null;const points=feature.geometry.coordinates.flat(2).filter(p=>Array.isArray(p)&&Math.abs(p[0])<=180);if(!points.length)return null;if(iso===392)return [[128,30],[146,46]];const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);return [[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]];}
function focusCountry(iso){if(!gl||!loaded){if(gl)pendingCamera=iso;else zoomToCountry(iso,true);return;}const bounds=boundsFor(iso);if(!bounds)return;const mobile=innerWidth<=700;gl.fitBounds(bounds,{padding:mobile?{top:250,right:35,bottom:innerHeight*.39+30,left:35}:{top:170,right:100,bottom:80,left:430},pitch:theme==='explorer'?48:0,bearing:theme==='explorer'?-12:0,maxZoom:6,duration:reduced()?0:1100});}
function unwrapped(ring){let prev=null,shift=0;return ring.map(([x,y])=>{if(prev!==null){if(x-prev>180)shift-=360;if(x-prev< -180)shift+=360;}prev=x;return [x+shift,Math.max(-85,Math.min(85,y))];});}
function geoFromTopo(topo){return {type:'FeatureCollection',features:decodeTopo(topo,'countries').filter(f=>f.id!==10).map(f=>{const rec=resolveCountry(f);return {type:'Feature',id:rec?.iso||f.id,properties:{iso:rec?.iso||f.id,name:rec?.name||f.name},geometry:{type:'MultiPolygon',coordinates:f.polys.map(poly=>poly.map(unwrapped))}};})};}
function citiesGeo(){const features=[];for(const [iso,places] of Object.entries(PLACES)){const rec=byIso.get(+iso);for(const c of places.cities){const r=c.hub?rec:c;features.push({type:'Feature',geometry:{type:'Point',coordinates:[c.lng,c.lat]},properties:{iso:+iso,name:c.name,area:c.area||'',score:score(r,state.month),color:palette[band(score(r,state.month)).key],hi:r.hi[state.month],lo:r.lo[state.month],rain:r.pr[state.month]}});}}return {type:'FeatureCollection',features};}
function updateGeo(){if(!gl||!loaded||!world)return;world.features.forEach(f=>{const rec=byIso.get(f.properties.iso);f.properties.color=rec?palette[band(score(rec,state.month)).key]:'#bec8ae';f.properties.selected=f.properties.iso===state.selIso;});gl.getSource('seasons')?.setData(world);gl.getSource('travel-cities')?.setData(citiesGeo());}
function styleForTheme(){const s=structuredClone(baseStyle);const vintage=theme==='brochure',game=theme==='explorer';const water=vintage?'#88bcc6':game?'#75a9ad':'#d2e3ec',ground=vintage?'#e2d8a9':game?'#c2c79a':'#eef0e4',wood=vintage?'#8bab74':game?'#739467':'#b0c2a6',line=vintage?'#5e7965':game?'#52694d':'#7d9695';
 s.layers=s.layers.filter(l=>l.id!=='natural_earth'&&!l.id.includes('shield')&&!l.id.startsWith('poi')&&l.id!=='airport');
 for(const l of s.layers){l.paint=l.paint||{};if(l.type==='background')l.paint['background-color']=['interpolate',['linear'],['zoom'],0,water,5,water,7,ground];if(l.type==='raster')continue;
 if(l.type==='fill'){let c=ground;if(l.id.includes('water'))c=water;else if(/wood|park|cemetery/.test(l.id))c=wood;else if(/grass|pitch/.test(l.id))c=vintage?'#b1bc6a':game?'#a3b078':'#c9d2b4';else if(/ice/.test(l.id))c='#f0efe2';else if(/sand/.test(l.id))c='#ddce96';else if(/building/.test(l.id))c=vintage?'#c3b88b':game?'#c5be9d':'#c9d0cc';l.paint['fill-color']=c;delete l.paint['fill-pattern'];if(l.paint['fill-outline-color'])l.paint['fill-outline-color']=line;}
 if(l.type==='line'){l.paint['line-color']=l.id.includes('water')?water:l.id.includes('casing')?'#7f8064':/rail|boundary/.test(l.id)?line:vintage?'#f1e6b5':game?'#ded9b7':'#fcfcf0';if(l.id==='boundary_2')l.paint['line-width']=1.2;}
 if(l.type==='fill-extrusion'){l.paint['fill-extrusion-color']=game?'#d0c4a0':'#c4cbbf';}
 if(l.type==='symbol'){l.layout=l.layout||{};l.layout['text-transform']='none';if(l.layout['text-field']){l.paint['text-color']='#264c42';l.paint['text-halo-color']=vintage?'#e9e2be':game?'#dce3c4':'#f4f7ee';l.paint['text-halo-width']=1.3;if(l.id.includes('country'))l.layout['text-font']=['Noto Serif Regular'];}delete l.layout['icon-image'];}
 }
 s.sources.elevation={type:'raster-dem',tiles:['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],encoding:'terrarium',tileSize:256,maxzoom:14,attribution:'Elevation: Mapzen / AWS Terrain Tiles'};
 s.sources['elevation-shading']={...s.sources.elevation};const landIndex=s.layers.findIndex(l=>l.id==='water');s.layers.splice(landIndex,0,{id:'terrain-shading',type:'hillshade',source:'elevation-shading',minzoom:6,paint:{'hillshade-shadow-color':game?'#314e37':'#61745a','hillshade-highlight-color':'#f1edcc','hillshade-accent-color':'#8b9770','hillshade-exaggeration':game?.7:.3,'hillshade-illumination-direction':315}});
 if(game){if(!gl||gl.getZoom()>=6)s.terrain={source:'elevation',exaggeration:2.3};s.light={anchor:'viewport',color:'#fff6d9',intensity:.5,position:[1.5,210,45]};}
 return s;
}
function addLayers(){loaded=true;gl.addSource('seasons',{type:'geojson',data:world});gl.addLayer({id:'base-land',type:'fill',source:'seasons',maxzoom:7,paint:{'fill-color':theme==='brochure'?'#e2d8a9':theme==='explorer'?'#c2c79a':'#eef0e4'}},'park');const firstLabel=gl.getStyle().layers.find(l=>l.type==='symbol')?.id;gl.addLayer({id:'season-fill',type:'fill',source:'seasons',paint:{'fill-color':['coalesce',['get','color'],'#bdc9ae'],'fill-opacity':['interpolate',['linear'],['zoom'],0,.68,3,.52,5,.2,7,0]}},firstLabel);gl.addLayer({id:'country-selection',type:'line',source:'seasons',paint:{'line-color':'#234f4b','line-width':['case',['boolean',['get','selected'],false],2,0],'line-opacity':['interpolate',['linear'],['zoom'],0,1,6,.55,8,0]}},firstLabel);
 gl.addSource('travel-cities',{type:'geojson',data:citiesGeo()});
 gl.addLayer({id:'city-weather-halo',type:'circle',source:'travel-cities',minzoom:4,paint:{'circle-radius':18,'circle-color':['get','color'],'circle-opacity':.25}});
 gl.addLayer({id:'city-weather',type:'circle',source:'travel-cities',minzoom:4,paint:{'circle-radius':['interpolate',['linear'],['zoom'],4,5,6,8],'circle-color':['get','color'],'circle-stroke-width':2,'circle-stroke-color':'#fff9e8'}});
 gl.addLayer({id:'city-weather-label',type:'symbol',source:'travel-cities',minzoom:4,layout:{'text-field':['get','name'],'text-font':['Noto Sans Regular'],'text-size':14,'text-anchor':'left','text-offset':[.9,0],'text-allow-overlap':false},paint:{'text-color':'#173b35','text-halo-color':'#f7f6e7','text-halo-width':2}});
 updateGeo();if(pendingCamera){focusCountry(pendingCamera);pendingCamera=null;}document.body.classList.add('mapgl-ready');caption.textContent=theme==='explorer'?'Scroll to explore. Right-drag to rotate and tilt.':'';
}
async function initMap(){if(!window.maplibregl){caption.textContent='Detailed map unavailable. The country map and city data remain available.';return;}try{const [styleResponse,topoResponse]=await Promise.all([fetch(meta.root+'lab/assets/basemap.json'),fetch(meta.root+'lab/assets/world.json')]);if(!styleResponse.ok||!topoResponse.ok)throw Error('Map source unavailable');baseStyle=await styleResponse.json();world=geoFromTopo(await topoResponse.json());const el=document.createElement('div');el.id='terrain-map';$('#stage').prepend(el);
 gl=new maplibregl.Map({container:el,style:styleForTheme(),center:theme==='explorer'?[137.63,36.29]:[138.1,37.2],zoom:theme==='explorer'?9.2:4.4,pitch:theme==='explorer'?64:0,bearing:theme==='explorer'?-20:0,maxPitch:75,maxZoom:16,minZoom:1,attributionControl:{compact:true},canvasContextAttributes:{antialias:true}});
 window.LAB_MAP=gl;
 gl.addControl(new maplibregl.NavigationControl({visualizePitch:true}),'top-right');gl.addControl(new maplibregl.ScaleControl({unit:'metric'}),'bottom-left');
 gl.on('style.load',addLayers);
 gl.on('click',e=>{const city=gl.queryRenderedFeatures(e.point,{layers:['city-weather','city-weather-label']})[0];if(city){const p=city.properties;select(Number(p.iso),false);popup?.remove();popup=new maplibregl.Popup({offset:14}).setLngLat(city.geometry.coordinates).setHTML(`<h3>${escape(p.name)}</h3><p>${monthNames[state.month]} · ${escape(p.area)}</p><p>High ${p.hi}°C · Low ${p.lo}°C<br>Rain ${p.rain} mm · Weather comfort ${p.score}/100</p>`).addTo(gl);return;}const hit=gl.queryRenderedFeatures(e.point,{layers:['season-fill']})[0];if(hit&&byIso.has(Number(hit.properties.iso)))select(Number(hit.properties.iso),gl.getZoom()<4);});
 gl.on('mousemove',e=>{if(!loaded)return;const hits=gl.queryRenderedFeatures(e.point,{layers:['season-fill','city-weather']});gl.getCanvas().style.cursor=hits.length?'pointer':'';});
 let errors=0;gl.on('error',()=>{errors++;if(errors===8)caption.textContent='Some map detail could not load. Country weather and guide information are still available.';});
 gl.on('moveend',()=>{if(!loaded)return;if(theme==='explorer'){const terrain=gl.getTerrain();if(gl.getZoom()<6&&terrain)gl.setTerrain(null);else if(gl.getZoom()>=6&&!terrain)gl.setTerrain({source:'elevation',exaggeration:2.3});}const features=gl.queryRenderedFeatures(gl.project(gl.getCenter()),{layers:['season-fill']});const iso=Number(features[0]?.properties.iso);if(gl.getZoom()>4&&iso&&byIso.has(iso)&&state.selIso!==iso)select(iso,false);});
 }catch(error){caption.textContent='Detailed terrain could not load. You can still explore the country map and city weather.';gl?.remove();gl=null;$('#terrain-map')?.remove();document.body.classList.remove('mapgl-ready');}}
initMap();
})();
