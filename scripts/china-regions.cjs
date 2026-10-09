const cities = require('../climate/china.json');
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

module.exports = function chinaRegions(){
 if (cities.length !== 7) throw Error('China city sample count changed');
 for (const city of cities) {
  if (city.iso !== 156 || !Number.isFinite(city.lat) || !Number.isFinite(city.lng) || !city.source?.url ||
   !['hi','lo','pr'].every(key => city[key]?.length === 12 && city[key].every(Number.isFinite))) throw Error('China climate missing: '+city.name);
  for (let m=0; m<12; m++) if (city.hi[m] < city.lo[m] || city.pr[m] < 0) throw Error('China climate invalid: '+city.name+' '+m);
 }
 const rows = months.map((month,m) => `<tr><th scope="row">${month}</th>${cities.map(city => `<td>${Math.round(city.hi[m])}°C<br><small>${Math.round(city.pr[m])} mm rain</small></td>`).join('')}</tr>`).join('');
 return `<section class="guide-section" id="regions"><div class="wrap"><h2>China weather, city by city</h2><p>The score above uses Beijing. Compare seven cities before choosing a month.</p><p class="disc">Swipe the table sideways on a small screen.</p><p id="china-weather-caption"><strong>Average daytime high and monthly rain, 2001–2020</strong></p><div class="table-scroll"><table class="weather-table" aria-labelledby="china-weather-caption"><thead><tr><th scope="col">Month</th>${cities.map(city => `<th scope="col">${esc(city.name)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><p>In July, Kunming is cooler than Chengdu. Harbin has a far colder January than Guangzhou.</p><p>These city estimates miss Tibet, Xinjiang, Hainan and mountain conditions. Check a local forecast before travel.</p><details class="guide-sources"><summary>Sources and weather notes</summary><p>NASA POWER / MERRA-2 estimates use daily data from 2001–2020. Highs are average daily highs; rain is the average monthly total. This is map-based climate data, not station readings or a forecast. The Beijing score above uses separate weather inputs.</p><p>${cities.map(city => `<a href="${esc(city.source.url)}">${esc(city.name)} data</a>`).join(' · ')} · <a href="https://en.bjhd.gov.cn/workinginhaidian/supportingservices/publicholidays/202512/t20251211_4797062.shtml">2026 public holiday dates</a> · <a href="https://english.www.gov.cn/archive/statistics/202610/02/content_WS6abf80b9c6d00ca5f9a0d910.html">National Day rail demand</a> · <a href="https://english.www.gov.cn/news/202402/20/content_WS65d45149c6d0868f4e8e42e4.html">Harbin ice tourism</a> · Checked October 2026</p></details></div></section>`;
};
