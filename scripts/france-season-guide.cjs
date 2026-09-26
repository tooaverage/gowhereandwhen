const maps=require('../gen-maps.js');
module.exports=function franceGuide(record){
 maps.PLACES[250]={clip:{minLon:-6,maxLon:10,minLat:41,maxLat:52},cities:record.cities.map(c=>({...c,off:undefined,lab:undefined}))};
 return maps.citySection({iso:250,name:'France'},record,{best:8})
 .replace(/(<text class="lab"[^>]*)(>Avignon<\/text>)/,'$1 dy="-12"$2')
 .replace('class="section--tight"','class="guide-section"')
 .replace('Which city, which month','France, city by city')
 .replace(/The strip above rates[^<]+/,'Pick a month. Compare eight travel bases on the map.')
 .replace('Same 0 to 100 rating as the strip above, from each city\'s own long-run normals.', 'Higher scores mean better sightseeing weather, not more heat.')
 .replace('</div></section>',`<details class="guide-sources"><summary>Sources &amp; weather notes</summary><p>City weather uses averages from 2001 to 2020. The Paris chart uses older data. Scores exclude sea warmth and snow.</p><p><a href="https://power.larc.nasa.gov/docs/services/api/temporal/daily/">NASA data</a> · <a href="https://www.france.fr/fr/article/climat-geographie/">France climate guide</a> · Checked September 2026</p></details></div></section>`);
};
