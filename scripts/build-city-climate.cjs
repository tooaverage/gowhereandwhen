const fs=require('node:fs'),path=require('node:path'),E=require('../engine.js');
const root=path.resolve(__dirname,'..'),file=path.join(root,'storybook-lab/data.json');
const data=JSON.parse(fs.readFileSync(file)),featured=require('../climate/top-cities.json'),regional=require('../climate/france.json'),spain=require('../climate/spain.json'),cities=[...featured,...regional,...spain];
for(const [index,city] of cities.entries()){
 const record=data.find(r=>r.iso===city.iso);if(!record)throw Error('Unknown country '+city.iso);
 const c={...city,...(index<featured.length?{featuredOrder:index+1}:{}),area:record.name,off:[0,-10]};
 c.months=c.hi.map((_,m)=>({score:E.score(c,m),band:E.band(E.score(c,m)),tags:E.monthTags(c,m),season:E.seasonOf(c,m)}));
 const sorted=E.monthRanking(c).sorted, best=sorted.filter(x=>x.s>=sorted[0].s-5).map(x=>x.m);
 c.bestTime=E.rangeText(best);c.visitNote='Highest weather comfort scores for outdoor sightseeing. Climate averages cannot predict a specific trip.';
 const existing=record.cities.findIndex(x=>x.name===c.name);if(existing<0)record.cities.push(c);else record.cities[existing]=c;
}
fs.writeFileSync(file,JSON.stringify(data));
console.log('Built monthly climate and sightseeing windows for '+cities.length+' sourced cities.');
