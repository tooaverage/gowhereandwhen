const stations=require('../climate/ireland-met-eireann.json');
const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

module.exports=function irelandRegions(){
 if(stations.map(s=>s.name).join(',')!=='Dublin,Shannon,Cork')throw Error('Ireland station sample changed');
 for(const s of stations){
  if(s.iso!==372||!Number.isFinite(s.lat)||!Number.isFinite(s.lng)||!s.station||s.source?.provider!=='Met Éireann'||s.source.period!=='1991-2020'||!s.source.url.startsWith('https://www.met.ie/'))throw Error('Ireland station metadata missing: '+s.name);
  for(const key of ['hi','lo','pr'])if(s[key]?.length!==12||!s[key].every(Number.isFinite))throw Error('Ireland monthly '+key+' missing: '+s.name);
  for(let m=0;m<12;m++)if(s.hi[m]<s.lo[m]||s.hi[m]>50||s.lo[m]<-20||s.pr[m]<0||s.pr[m]>1000)throw Error('Ireland station value invalid: '+s.name+' '+m);
 }
 const rows=months.map((month,m)=>`<tr><th scope="row">${month}</th>${stations.map(s=>`<td>${Math.round(s.hi[m])}°C<br><small>${Math.round(s.pr[m])} mm rain</small></td>`).join('')}</tr>`).join('');
 return `<section class="guide-section" id="regions"><div class="wrap"><h2>Ireland weather by place</h2><p>The score above uses Dublin weather. Compare the east, midwest and south before choosing a month.</p><p class="disc">Swipe the table sideways on a small screen.</p><p id="ireland-weather-caption"><strong>Average daytime high and monthly rain, 1991–2020</strong></p><div class="table-scroll"><table class="weather-table" aria-labelledby="ireland-weather-caption"><thead><tr><th scope="col">Month</th>${stations.map(s=>`<th scope="col">${esc(s.name)}<small>${esc(s.region)}</small></th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><p>In January, Cork gets about twice Dublin's rain. In July, all three stations average 19–20°C by day.</p><p>These stations miss the wetter Atlantic coast, mountains and sea conditions.</p><details class="guide-sources"><summary>Sources and weather limits</summary><p>Met Éireann station averages cover 1991–2020. Highs are average daily highs; rain is the monthly total. These are past averages, not forecasts. The Dublin score above uses older separate weather inputs.</p><p>${stations.map(s=>`<a href="${esc(s.source.url)}">${esc(s.station)} averages</a>`).join(' · ')} · <a href="https://www.met.ie/climate/what-we-measure/rainfall">Met Éireann regional rainfall</a> · Checked October 2026</p></details></div></section>`;
};
