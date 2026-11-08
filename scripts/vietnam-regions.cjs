const cities=require('../climate/vietnam-wmo.json');
const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const esc=value=>String(value).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

module.exports=function vietnamRegions(){
 if(cities.map(c=>c.name).join(',')!=='Hanoi,Da Nang,Ho Chi Minh City')throw Error('Vietnam sample changed');
 for(const city of cities){
  if(city.iso!==704||city.source?.period!=='1991-2020'||!city.source?.url||!Number.isFinite(city.lat)||!Number.isFinite(city.lng)||city.lat<8||city.lat>24||city.lng<102||city.lng>110)throw Error('Vietnam station missing: '+city.name);
  for(const key of ['hi','lo','pr'])if(city[key]?.length!==12||!city[key].every(Number.isFinite))throw Error('Vietnam monthly data missing: '+city.name+' '+key);
  for(let m=0;m<12;m++)if(city.hi[m]<city.lo[m]||city.hi[m]>45||city.lo[m]<0||city.pr[m]<0||city.pr[m]>1000)throw Error('Vietnam climate invalid: '+city.name+' '+m);
 }
 const rows=months.map((month,m)=>`<tr><th scope="row">${month}</th>${cities.map(city=>`<td>${Math.round(city.hi[m])}°C<br><small>${Math.round(city.pr[m])} mm rain</small></td>`).join('')}</tr>`).join('');
 return `<section class="guide-section" id="regions"><div class="wrap"><h2>Vietnam weather by place</h2><p>The score above uses Hanoi. Compare the central coast and south before choosing a month.</p><p class="disc">Swipe the table sideways on a small screen.</p><p id="vietnam-weather-caption"><strong>Average daytime high and monthly rain, 1991–2020</strong></p><div class="table-scroll"><table class="weather-table" aria-labelledby="vietnam-weather-caption"><thead><tr><th scope="col">Month</th>${cities.map(city=>`<th scope="col">${esc(city.name)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><p>Da Nang has its rain peak in October and November. Ho Chi Minh City is wettest from May to October.</p><p>These city stations miss mountains, islands and sea conditions. Check local forecasts before travel.</p><details class="guide-sources"><summary>Sources and weather limits</summary><p>WMO publishes 1991–2020 station averages from Viet Nam's weather service. Highs are average daily highs; rain is the average monthly total. These are past averages, not forecasts. The Hanoi score uses older separate inputs.</p><p>${cities.map(city=>`<a href="${esc(city.source.url)}">${esc(city.name)} data</a>`).join(' · ')} · <a href="https://vietnam.travel/things-to-do/weather-and-climate-vietnam/">Vietnam Tourism: regional seasons</a> · Checked November 2026</p></details></div></section>`;
};
