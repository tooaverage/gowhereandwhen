const cities=require('../climate/india-imd.json');
const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));

module.exports=function indiaRegions(){
 if(cities.map(city=>city.name).join(',')!=='Delhi,Jaipur,Mumbai,Goa (Panjim),Kochi')throw Error('India comparison places changed');
 for(const city of cities){
  if(city.iso!==356||city.source?.period!=='1991-2020'||!city.source?.url||!Number.isFinite(city.lat)||!Number.isFinite(city.lng)||!Number.isFinite(city.elevationM))throw Error('India station source missing: '+city.name);
  for(const key of ['hi','lo','pr'])if(city[key]?.length!==12||!city[key].every(Number.isFinite))throw Error('India monthly data missing: '+city.name+' '+key);
  for(let m=0;m<12;m++)if(city.hi[m]<city.lo[m]||city.hi[m]>50||city.lo[m]<-10||city.pr[m]<0||city.pr[m]>1100)throw Error('India station data invalid: '+city.name+' '+m);
 }
 const rows=months.map((month,m)=>`<tr><th scope="row">${month}</th>${cities.map(city=>`<td>${Math.round(city.hi[m])}°C<br><small>${Math.round(city.pr[m])} mm rain</small></td>`).join('')}</tr>`).join('');
 return `<section class="guide-section" id="regions"><div class="wrap"><h2>India weather by place</h2><p>Delhi and Jaipur have hot spring days. Mumbai, Goa and Kochi get heavy summer rain.</p><p>The score above uses older Delhi inputs. It does not rate the other places.</p><p id="india-weather-caption"><strong>Average daytime high and monthly rain, 1991–2020</strong></p><p class="disc">Swipe the table sideways on a small screen.</p><div class="table-scroll"><table class="weather-table" aria-labelledby="india-weather-caption"><thead><tr><th scope="col">Month</th>${cities.map(city=>`<th scope="col">${esc(city.name)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><p>These five stations miss the Himalaya, east India and many other regions. They do not show sea conditions or a forecast.</p><details class="guide-sources"><summary>Sources and weather limits</summary><p>India Meteorological Department 1991–2020 station averages. Highs and lows are daily averages; rain is the mean monthly total. Mumbai uses Santacruz, Goa uses Panjim, and Kochi uses the airport. The Delhi score above uses older separate weather inputs.</p><p>${cities.map(city=>`<a href="${esc(city.source.url)}">${esc(city.name)} station</a>`).join(' · ')} · <a href="https://mausam.imd.gov.in/responsive/monsooninformation_onset.php">IMD monsoon timing</a> · <a href="https://www.incredibleindia.gov.in/en/plan-your-trip/weather">India Tourism seasons</a> · Checked November 2026</p></details></div></section>`;
};
