// Interpolate only within the selected country's own samples. Never borrow
// a neighbouring country's season or blend missing data into a good score.
export function climateSamples(record, australia = []) {
 if (!record) return [];
 if (record.iso === 36 && australia.length) return australia.map(p => ({lng:p.x,lat:p.y,scores:p.s}));
 const cities=(record.cities||[]).map(c=>({lng:c.lng,lat:c.lat,scores:c.months.map(m=>m.score)}));
 if(record.hub && !cities.some(c=>Math.abs(c.lng-record.hub.lng)<.2 && Math.abs(c.lat-record.hub.lat)<.2))
  cities.push({lng:record.hub.lng,lat:record.hub.lat,scores:record.months.map(m=>m.score)});
 return cities;
}
export function travelScore(samples, lng, lat, month, fallback) {
 if(!samples.length)return fallback;
 let total=0,weights=0;
 for(const p of samples){
  const dx=(((lng-p.lng+540)%360)-180)*Math.cos((lat+p.lat)*Math.PI/360),dy=lat-p.lat;
  const d=dx*dx+dy*dy;
  if(d<1e-10)return p.scores[month];
  const weight=1/Math.pow(d,1.4);total+=weight*p.scores[month];weights+=weight;
 }
 return total/weights;
}
