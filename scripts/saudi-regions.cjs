const cities = require('../climate/saudi-arabia.json');
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

module.exports = function saudiRegions() {
 if (cities.map(city => city.name).join(',') !== 'Riyadh,Jeddah,AlUla') throw Error('Saudi climate sample changed');
 for (const city of cities) {
  if (city.iso !== 682 || !Number.isFinite(city.lat) || !Number.isFinite(city.lng) || !city.source?.url ||
   !['hi','lo','pr'].every(key => city[key]?.length === 12 && city[key].every(Number.isFinite))) throw Error('Saudi climate missing: '+city.name);
  for (let m=0;m<12;m++) if (city.hi[m] < city.lo[m] || city.pr[m] < 0) throw Error('Saudi climate invalid: '+city.name+' '+m);
 }
 const rows = months.map((month,m) => `<tr><th scope="row">${month}</th>${cities.map(city => `<td>${Math.round(city.hi[m])}°C<br><small>${Math.round(city.pr[m])} mm rain</small></td>`).join('')}</tr>`).join('');
 return `<section class="guide-section" id="regions"><div class="wrap"><h2>Saudi Arabia weather by place</h2><p>The score above uses Riyadh. Compare the coast and northwest desert before choosing a month.</p><p class="disc">Swipe the table sideways on a small screen.</p><p id="saudi-weather-caption"><strong>Average daytime high and monthly rain, 2001–2020</strong></p><div class="table-scroll"><table class="weather-table" aria-labelledby="saudi-weather-caption"><thead><tr><th scope="col">Month</th>${cities.map(city => `<th scope="col">${esc(city.name)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><p>Jeddah stays warmer than Riyadh in winter. All three samples have very hot summer days.</p><p>Aseer highlands are outside this table. These map-based estimates cannot show mountain, sea or street-level conditions.</p><details class="guide-sources"><summary>Sources and weather limits</summary><p>NASA POWER / MERRA-2 estimates use daily data from 2001–2020. Highs are average daily highs; rain is the average monthly total. They are planning averages, not forecasts or weather-station records. Riyadh's score above uses separate curated inputs.</p><p>${cities.map(city => `<a href="${esc(city.source.url)}">${esc(city.name)} data</a>`).join(' · ')} · <a href="https://www.visitsaudi.com/en/stories/climate-and-seasons">Visit Saudi climate guide</a> · <a href="https://www.visitsaudi.com/en/destinations/aseer">Visit Saudi Aseer</a> · <a href="https://www.visitsaudi.com/en/destinations/alula?lang=en">Visit Saudi AlUla</a> · Checked October 2026</p></details></div></section>`;
};
