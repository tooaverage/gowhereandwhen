// France-only sample: one map, route stops beside it, optional full city comparison.
module.exports=record=>{
 const engine=require('../engine.js');
 const timing=require('./france-travel-timing.cjs');
 let cities=require('./france-season-guide.cjs')(record);
 let route=require('./france-backpacker-route.cjs')();
 const routeMap=route.match(/<svg class="cmap"[\s\S]*?<\/svg>/)[0];
 const routeList=route.match(/<ol class="route"[\s\S]*?<\/ol>/)[0];
 const ranking=cities.match(/<div class="card cm-side">[\s\S]*?<div id="cm-list" class="cm-list"><\/div>\s*<\/div>/)[0];
 const line=routeMap.match(/<polyline[^>]+\/>/)[0];
 const stops=[...routeMap.matchAll(/<g class="stopmk"[\s\S]*?<\/g>/g)].map(m=>m[0].replace(/>[\s\S]*<\/g>$/,'></g>')).join('');
 cities=cities.replace(/(<path class="land"[^>]+\/>)/,'$1'+line+stops)
 .replace('<h2 style="margin-top:14px">France, city by city</h2>','')
 .replace(/<p class="eyebrow">[\s\S]*?<\/p>/,'')
 .replace('Pick a month. Compare six cities on the map.','Pick a month. Green means better sightseeing weather; red means worse.')
 .replace(ranking,'<div class="route-side">'+routeList+'</div>')
 .replace(/<div class="table-wrap hgrid"([\s\S]*?)<\/table>\s*<\/div>/,'<details class="city-year-grid"><summary>Compare weather by city and month</summary>'+ranking+'<div class="table-wrap hgrid"$1</table></div></details>')
 .replace('Higher scores mean better sightseeing weather, not more heat.','Weather comfort, not temperature.');
 route=route.replace(routeList,'')
 .replace('class="guide-section route-section"','class="guide-section route-section combined-trip"')
 .replace('France by train','Plan your France trip')
 .replace('Pick your trip length. See the stops and nights below.','Choose your month and trip length.')
 .replace(routeMap,cities)
 .replace('class="cmapgrid"','class="combined-layout"');
 // Keep both decisions in one control panel, immediately above their map.
 const lengthRow=route.match(/<div class="row" style="gap:14px; margin-bottom:18px">[\s\S]*?<\/div><\/div>/)[0];
 const lengthPicker=lengthRow.match(/<div class="mpick"[\s\S]*?<\/div>/)[0];
 route=route.replace(lengthRow,'').replace(/<p class="route-season">[\s\S]*?<\/p>/,'');
 route=route.replace(/<p class="lead" style="margin:12px 0 20px">Pick a month\.[\s\S]*?<\/p>/,'');
 route=route.replace(/<div class="mpick" id="mpick"[\s\S]*?<\/div>/,monthPicker=>`<div class="trip-controls"><div class="trip-control-group"><p class="control-label" id="trip-length-label">Trip length</p>${lengthPicker}</div><div class="trip-control-group"><div class="month-control-heading"><p class="control-label" id="trip-month-label">Travel month</p><p class="control-tip">Try May–June or September</p></div>${monthPicker}<p class="control-key">Best time to go: weather, seasonal activities and events.</p></div></div>`);
 const map=route.match(/<svg class="cmap"[\s\S]*?<\/svg>/)[0];
 const cityCards=record.cities.map(c=>`<div class="heat-city-card" data-extra-card="${c.name}"><div class="extra-place-title"><strong>${c.name}</strong><span data-city-temperature="${c.name}"></span></div><small class="seasonal-reason" data-seasonal-reason="${c.name}"></small><small data-route-city="${c.name}" hidden></small></div>`).join('');
 route=route.replace(map,require('./france-heat-sample.cjs')(map,record,engine)+`<div class="heat-legend"><span>Less suited</span><span class="heat-ramp" aria-hidden="true"></span><span>Great time to go</span></div><p class="heat-note">Travel rating: weather + activities + events.</p><div class="extra-places"><h3>Extra spots <small>Off your route</small></h3><div class="heat-city-cards">${cityCards}</div></div>`);
 const method=`<details class="guide-sources timing-method"><summary>What the rating includes</summary><p>Weather, seasonal activities and events. Each place shows a reason to go and a trade-off.</p><p>These are editorial recommendations. Event dates vary. Crowds, prices and closures are not rated yet.</p><p>Map colours blend six city samples. They do not describe every mountain or coast. Grey means limited data.</p><p>Sources checked 26 September 2026: ${Object.entries(timing.sources).map(([name,url])=>`<a href="${url}">${name}</a>`).join(' · ')}.</p></details>`;
 const notes=[];
 route=route.replace(/<details class="guide-sources">[\s\S]*?<\/details>/g,n=>{notes.push(n);return '';});
 route=route.replace('<summary>Sources &amp; weather notes</summary>','<summary>Weather sources</summary>');
 route=route.replace(/<p class="disc" style="margin:14px 0 0">Weather comfort, not temperature\.<\/p>/,'');
 const summary=route.match(/<p class="disc" style="margin:10px 0 0"><span id="rt-sum">[\s\S]*?<\/p>/)[0];
 route=route.replace(summary,'').replace('<div class="trip-controls">',summary+'<div class="trip-controls">');
 route=route.replace(' Suggested stop order.','');
 route=route.replace('    <div class="combined-layout">','    <div class="combined-layout">');
 // Keep optional detail in one compact group, within the main section.
 const end=route.indexOf('</div></section>\n  <script>',route.indexOf('id="cities"'));
 route=route.slice(0,end)+`<div class="trip-notes">${method}${notes.join('')}</div>`+route.slice(end);
 const climate=Object.fromEntries(record.cities.map(c=>[c.name,{hi:c.hi,advice:c.hi.map((_,m)=>timing.assess(c.name,m,engine.score(c,m),c)),scores:c.hi.map((_,m)=>timing.rating(c.name,m,engine.score(c,m),c))}]));
 const bands=Array.from({length:101},(_,i)=>engine.band(i).key);
 return route+`<script>(function(){
 const climate=${JSON.stringify(climate)},bands=${JSON.stringify(bands)},names=['January','February','March','April','May','June','July','August','September','October','November','December'];
 function update(){
  const stops=Array.from(document.querySelectorAll('#rt-list>li')).filter(li=>!li.hidden);
  const cities=stops.map(li=>climate[li.dataset.name]);
  const routeNames=stops.map(li=>li.dataset.name);
  document.querySelectorAll('#cities .city').forEach((el,i)=>{const name=Object.keys(climate)[i],extra=!routeNames.includes(name);el.classList.toggle('extra-city',extra);el.querySelector('.lab').textContent=name+(extra?' +':'');});
  document.querySelectorAll('[data-extra-card]').forEach(el=>el.hidden=routeNames.includes(el.dataset.extraCard));
  document.querySelectorAll('[data-route-city]').forEach(el=>el.textContent=routeNames.includes(el.dataset.routeCity)?'On your route':'Extra spot · off route');
  document.querySelectorAll('#mpick button').forEach(b=>{
   const m=+b.dataset.m,score=Math.round(cities.reduce((n,c)=>n+c.scores[m],0)/cities.length);
   b.style.setProperty('--month-colour','var(--s-'+bands[score]+')');
   b.style.setProperty('--month-ink',bands[score]==='avoid'?'#fff':'#17313b');
   const label=score>=82?'Great':score>=65?'Good':score>=44?'Fair':'Poor';
   b.setAttribute('aria-label',names[m].slice(0,3)+' '+label+' for this route ('+names[m]+')');
   b.title=cities.map(c=>c.advice[m].reason).filter((v,i,a)=>a.indexOf(v)===i).join('; ');
   let value=b.querySelector('.month-score');if(!value){value=document.createElement('small');value.className='month-score';b.append(value);}value.textContent=label;
  });
 }
 function showWeather(m){
  document.querySelectorAll('[data-heat-colours]').forEach(el=>el.setAttribute('fill',el.dataset.heatColours.split(',')[m]));
  document.querySelectorAll('[data-city-temperature]').forEach(el=>el.textContent=climate[el.dataset.cityTemperature].hi[m]+'°C high');
  document.querySelectorAll('#rt-list>li[data-name]').forEach(li=>{
   const heading=li.querySelector('h3');if(!heading)return;
   let temperature=heading.querySelector('.route-temperature');
   if(!temperature){temperature=document.createElement('span');temperature.className='route-temperature';heading.insertBefore(temperature,heading.querySelector('.nt'));}
   temperature.textContent=climate[li.dataset.name].hi[m]+'°C';
   temperature.setAttribute('aria-label','Average daytime high '+climate[li.dataset.name].hi[m]+' degrees Celsius');
  });
  document.querySelectorAll('[data-seasonal-reason]').forEach(el=>{const advice=climate[el.dataset.seasonalReason].advice[m];el.hidden=false;el.textContent=advice.reason+'. '+advice.tradeoff+'.';});
  document.querySelectorAll('#rt-list>li[data-name]').forEach(li=>{
   const a=climate[li.dataset.name].advice[m];let why=li.querySelector('.route-why');
   if(!why){why=document.createElement('p');why.className='route-why';li.querySelector('.stop>div').append(why);}
   why.replaceChildren();const label=document.createElement('strong');label.textContent=a.label+' · ';why.append(label,document.createTextNode(a.reason+'. '+a.tradeoff+'.'));
  });
  queueMicrotask(()=>{
   document.querySelectorAll('#cities .city').forEach((g,i)=>{const city=Object.keys(climate)[i],s=climate[city].scores[m];g.querySelector('.sc').textContent='';g.setAttribute('aria-label',city+': '+climate[city].advice[m].label+'; '+climate[city].advice[m].reason);g.querySelector('.dot').setAttribute('fill',getComputedStyle(document.documentElement).getPropertyValue('--s-'+bands[s]));});
  });
  document.querySelector('#cities svg.cmap').setAttribute('aria-label',names[m]+' travel timing across France, with seasonal highlights and the selected route');
 }
 document.addEventListener('guide-month-change',e=>showWeather(e.detail));
 document.getElementById('mpick').addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(b)showWeather(+b.dataset.m);});
 const initial=new URLSearchParams(location.search).get('m');showWeather(initial!==null&&+initial>=0&&+initial<12?+initial:8);
 document.getElementById('rpick').addEventListener('click',()=>{update();});update();
})();</script>`;
};
