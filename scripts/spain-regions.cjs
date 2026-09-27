const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

module.exports=function spainRegions(record){
 const names=['Madrid','Barcelona','Seville','Bilbao','Malaga','Las Palmas'];
 const cities=names.map(name=>{
  const city=record.cities.find(c=>c.name===name);
  if(!city||!city.source||!['hi','lo','pr'].every(key=>city[key]?.length===12))throw Error('Spain climate missing: '+name);
  return city;
 });
 const rows=months.map((month,m)=>`<tr><th scope="row">${month}</th>${cities.map(city=>`<td>${Math.round(city.hi[m])}°C<br><small>${Math.round(city.pr[m])} mm rain</small></td>`).join('')}</tr>`).join('');
 return `<section class="guide-section" id="regions"><div class="wrap"><h2>Spain weather, city by city</h2><p>Madrid is the guide's score city. Compare other regions before you pick a month.</p><p class="disc">Swipe the table sideways on a small screen.</p><div class="table-scroll"><table class="weather-table"><caption>Average daytime high and monthly rain, 2001–2020</caption><thead><tr><th scope="col">Month</th>${cities.map(city=>`<th scope="col">${esc(city.name)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><p>Bilbao is cooler and wetter in summer than Madrid or Seville. Las Palmas stays milder in winter. These city estimates do not cover mountains, beaches or every island.</p><details class="guide-sources"><summary>Sources and weather notes</summary><p>City figures are NASA POWER estimates from daily data, 2001–2020. Highs are the average daily high; rain is the average monthly total. These are planning averages, not forecasts. The original Madrid chart uses a different dataset.</p><p><a href="https://power.larc.nasa.gov/docs/services/api/temporal/daily/">NASA POWER data and method</a> · <a href="https://www.spain.info/en/weather/">Spain tourism climate guide</a> · Checked September 2026</p></details></div></section>`;
};
