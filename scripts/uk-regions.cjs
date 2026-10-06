const cities = require('../climate/uk.json');
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

module.exports = function ukRegions(){
 for(const city of cities){
  if(!Number.isFinite(city.lat)||!Number.isFinite(city.lng)||!city.source?.url||!['hi','lo','pr'].every(key=>city[key]?.length===12&&city[key].every(Number.isFinite)))throw Error('UK climate missing: '+city.name);
  for(let m=0;m<12;m++)if(city.hi[m]<city.lo[m]||city.pr[m]<0)throw Error('UK climate invalid: '+city.name+' '+m);
 }
 const rows=months.map((month,m)=>`<tr><th scope="row">${month}</th>${cities.map(city=>`<td>${Math.round(city.hi[m])}°C<br><small>${Math.round(city.pr[m])} mm rain</small></td>`).join('')}</tr>`).join('');
 return `<section class="guide-section" id="regions"><div class="wrap"><h2>UK weather, city by city</h2><p>The score above uses London. Compare all four nations before choosing a month.</p><p class="disc">Swipe the table sideways on a small screen.</p><p id="uk-weather-caption"><strong>Average daytime high and monthly rain, 1991–2020</strong></p><div class="table-scroll"><table class="weather-table" aria-labelledby="uk-weather-caption"><thead><tr><th scope="col">Month</th>${cities.map(city=>`<th scope="col">${esc(city.name)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><p>July is warmer in London than Edinburgh or Belfast. Cardiff has much more winter rain than Heathrow.</p><p>These four stations cannot describe the Highlands, coasts or every town. Check local forecasts before travel.</p><details class="guide-sources"><summary>Sources and weather notes</summary><p>Met Office station averages cover 1991–2020. Highs are average daily highs; rain is the average monthly total. Heathrow is used for London. Station records are not a forecast. The London score above uses separate weather data.</p><p>${cities.map(city=>`<a href="${esc(city.source.url)}">${esc(city.name)} data</a>`).join(' · ')} · <a href="https://www.visitbritain.com/en/things-to-do/summer-britain-festivals-events-and-activities">VisitBritain summer travel</a> · Checked October 2026</p></details></div></section>`;
};
