const {source,places}=require('../climate/australia-bom.json');
const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

module.exports=function australiaRegions(){
 if(places.map(p=>p.name).join(',')!=='Sydney,Melbourne,Perth,Alice Springs,Darwin,Cairns')throw Error('Australia place sample changed');
 if(!source.url.startsWith('https://www.bom.gov.au/')||!source.period.includes('1981-2010'))throw Error('Australia BOM source missing');
 for(const p of places){
  if(!Number.isFinite(p.lat)||!Number.isFinite(p.lng)||p.lat>0||p.lng<110||p.lng>155)throw Error('Australia place coordinates invalid: '+p.name);
  for(const k of ['hi','lo','pr'])if(p[k]?.length!==12||!p[k].every(Number.isFinite))throw Error('Australia monthly '+k+' missing: '+p.name);
  for(let m=0;m<12;m++)if(p.hi[m]<p.lo[m]||p.hi[m]>50||p.lo[m]<-20||p.pr[m]<0||p.pr[m]>1000)throw Error('Australia value invalid: '+p.name+' '+m);
 }
 const rows=months.map((month,m)=>`<tr><th scope="row">${month}</th>${places.map(p=>`<td>${Math.round(p.hi[m])}°C<br><small>${Math.round(p.pr[m])} mm rain</small></td>`).join('')}</tr>`).join('');
 return `<section class="guide-section" id="regions"><div class="wrap"><h2>Australia weather by place</h2><p>Sydney's score above cannot rate the whole country. Compare six places across the south, west, centre and tropical north.</p><p class="disc">Swipe the table sideways on a small screen.</p><p id="australia-weather-caption"><strong>Average daytime high and monthly rain</strong></p><div class="table-scroll"><table class="weather-table" aria-labelledby="australia-weather-caption"><thead><tr><th scope="col">Month</th>${places.map(p=>`<th scope="col">${esc(p.name)}<small>${esc(p.region)}</small></th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><p>Darwin gets about 466 mm of rain in January and 1 mm in July. Perth has the opposite pattern: about 18 mm in January and 148 mm in July.</p><p>These city averages do not describe Uluru, the reef, Tasmania, mountain trails or sea conditions. Check local forecasts and park advice before a trip.</p><details class="guide-sources"><summary>Sources and weather limits</summary><p><a href="${esc(source.url)}">Australian Bureau of Meteorology city averages</a> use 1981–2010 for these places, except Perth (1994–2021). The bureau may use a nearby site when a main city site lacks data. Highs are average daily highs; rain is the average monthly total. These are past averages, not forecasts. Sydney's comfort score uses older separate inputs.</p><p><a href="https://www.australia.com/en-us/facts-and-planning/when-to-go/australias-seasons.html">Tourism Australia: seasons</a> · <a href="https://www.australia.com/en/places/alice-springs-and-surrounds/guide-to-uluru-and-kata-tjuta.html">Tourism Australia: Uluru timing</a> · Checked November 2026</p></details></div></section>`;
};
