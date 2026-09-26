const assert=require('node:assert/strict'),timing=require('./france-travel-timing.cjs'),engine=require('../engine.js');
const cities=require('../storybook-lab/data.json').find(c=>c.iso===250).cities;
const get=(name,m)=>{const c=cities.find(c=>c.name===name);return timing.assess(name,m,engine.score(c,m),c);};
assert.equal(get('Strasbourg',11).label,'Great');
assert.equal(get('Paris',6).label,'Great','Comfortable July sightseeing is not capped by missing event tags');
assert.match(get('Paris',6).tradeoff,/Mild to warm days/);
assert.equal(timing.assess('Paris',0,65,{hi:Array(12).fill(15),pr:Array(12).fill(50)}).label,'Good');
assert.equal(timing.assess('Paris',0,20,{hi:Array(12).fill(5),pr:Array(12).fill(100)}).label,'Poor');
assert.notEqual(get('Strasbourg',0).label,'Great');
assert.equal(get('Nice',1).reason,'Nice Carnival');
assert.equal(get('Nice',1).label,'Great');
assert.notEqual(get('Paris',11).reason,'Christmas markets');
assert.equal(get('Bordeaux',9).reason,'Wine country in harvest season');
const heat={hi:Array(12).fill(36),pr:Array(12).fill(0)};
assert.equal(timing.assess('Strasbourg',11,90,heat).key,'avoid');
for(const c of cities)for(let m=0;m<12;m++){
 const a=get(c.name,m);assert.ok(a.reason&&a.tradeoff);assert.ok(a.value>=0&&a.value<=100);
 if(a.event)assert.ok(a.source.startsWith('https://'));
}
console.log('Passed France timing: seasonal reasons, no event leakage, heat override, complete month advice.');

const routePlan=require('./france-route-plan.cjs');
for(const [days,stays] of Object.entries(routePlan.plans)){
 assert.equal(stays.reduce((sum,s)=>sum+s[1],0),Number(days)-1,'Nights match trip length');
 assert.equal(new Set(stays.map(s=>s[0])).size,stays.length,'No repeated overnight bases');
 for(const [i,stay] of stays.entries()){
  assert(stay[1]>=2&&stay[1]<=5,'Deliberate 2–5 night stays');
  assert(routePlan.stops.some(s=>s.name===stay[0]));
  if(i)assert(routePlan.legs[stays[i-1][0]+'|'+stay[0]],'Every travel leg has a planning note');
 }
}
assert(routePlan.plans[30].some(s=>s[0]==='Bayeux'),'Normandy belongs in the longer route');
assert(routePlan.plans[30].some(s=>s[0]==='Tours'),'Loire Valley belongs in the longer route');
for(const city of require('../climate/france-route.json')){
 for(const key of ['hi','lo','pr'])assert.equal(city[key].length,12);
 for(let m=0;m<12;m++){assert(city.hi[m]>=city.lo[m]);assert(city.pr[m]>=0);}
 assert.equal(city.source.period,'2001-2020');
 assert(city.source.url.startsWith('https://power.larc.nasa.gov/'));
}
console.log('Passed France routes: explicit stays, complete legs, traveller-selected bases and sourced climate.');

assert.equal(timing.assess('Avignon',6,90,{hi:Array(12).fill(31.6),pr:Array(12).fill(20)}).label,'Good','Hot months retain their heat trade-off');

assert.equal(get('Paris',9).label,'Good','An ordinary autumn activity does not override cooler conditions');
assert.match(get('Paris',9).tradeoff,/Cool days/);
