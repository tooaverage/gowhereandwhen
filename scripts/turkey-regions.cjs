const cities=require('../climate/turkey-mgm.json');
const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

module.exports=function turkeyRegions(){
 for(const city of cities){
  if(!Number.isFinite(city.lat)||!Number.isFinite(city.lng)||!['hi','lo','pr'].every(key=>city[key]?.length===12&&city[key].every(Number.isFinite)))throw Error('Turkey climate missing: '+city.name);
  for(let m=0;m<12;m++)if(city.hi[m]<city.lo[m]||city.pr[m]<0)throw Error('Turkey climate invalid: '+city.name+' '+m);
 }
 const rows=months.map((month,m)=>`<tr><th scope="row">${month}</th>${cities.map(city=>`<td>${Math.round(city.hi[m])}°C<br><small>${Math.round(city.pr[m])} mm rain</small></td>`).join('')}</tr>`).join('');
 return `<section class="guide-section" id="regions"><div class="wrap"><h2>Turkey weather, region by region</h2><p>The score above uses Istanbul. Compare four other places before you choose a month.</p><p class="disc">Swipe the table sideways on a small screen.</p><div class="table-scroll"><table class="weather-table"><caption>Monthly high and rain by city</caption><thead><tr><th scope="col">Month</th>${cities.map(city=>`<th scope="col">${esc(city.name)}<small>${esc(city.region)}</small></th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><p>Antalya and İzmir are hottest in July and August. Nevşehir has colder winters. Trabzon gets more October rain than these other samples.</p><p>These city averages cannot describe every coast, valley or mountain. Balloon flights also depend on daily weather.</p><details class="guide-sources"><summary>Sources and weather notes</summary><p>The Turkish State Meteorological Service publishes 1991–2020 city averages for daily highs, lows and monthly rain. This table uses those figures. The Istanbul score above uses different weather input. These are planning averages, not forecasts.</p><p>${cities.map(city=>`<a href="${esc(city.source)}">${esc(city.name)} weather</a>`).join(' · ')} · <a href="https://goturkiye.com/blog/cappadocia-hot-air-balloons-things-to-know-before-you-fly">Cappadocia balloon guidance</a> · Checked October 2026</p></details></div></section>`;
};
