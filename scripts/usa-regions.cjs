const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

module.exports=function usaRegions(record){
 const names=['New York City','Chicago','Miami','Denver','Seattle','San Francisco','Los Angeles','Honolulu'];
 const cities=names.map(name=>{
  const city=record.cities.find(c=>c.name===name);
  if(!city?.source||!['hi','lo','pr'].every(key=>city[key]?.length===12))throw Error('USA climate missing: '+name);
  return city;
 });
 const rows=months.map((month,m)=>`<tr><th scope="row">${month}</th>${cities.map(city=>`<td>${Math.round(city.hi[m])}°C<br><small>${Math.round(city.pr[m])} mm rain</small></td>`).join('')}</tr>`).join('');
 return `<section class="guide-section" id="regions"><div class="wrap"><h2>USA weather, city by city</h2><p>New York sets the weather score above. Compare cities before you choose a month.</p><p class="disc">Swipe the table sideways on a small screen.</p><div class="table-scroll"><table class="weather-table"><caption>US city weather, 1991–2020</caption><thead><tr><th scope="col">Month</th>${cities.map(city=>`<th scope="col">${esc(city.name)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><p>Miami stays warm in winter. Seattle has drier summers. These city stations leave out Alaska, the desert Southwest and mountain conditions.</p><details class="guide-sources"><summary>Sources and weather notes</summary><p>City figures are NOAA weather-station averages for 1991–2020. Highs are average daily highs; rain is the average monthly total. These are planning averages, not forecasts. The New York weather score above uses different input values.</p><p>${cities.map(city=>`<a href="${esc(city.source.url)}">${esc(city.name)} station</a>`).join(' · ')}</p><p><a href="https://www.nhc.noaa.gov/climo/">Atlantic hurricane season</a> · <a href="https://www.nps.gov/yell/planyourvisit/seasons.htm">Yellowstone seasons and road access</a> · Checked October 2026</p></details></div></section>`;
};
