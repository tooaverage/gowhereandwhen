const assert=require('node:assert/strict'),timing=require('./france-travel-timing.cjs'),engine=require('../engine.js');
const cities=require('../storybook-lab/data.json').find(c=>c.iso===250).cities;
const get=(name,m)=>{const c=cities.find(c=>c.name===name);return timing.assess(name,m,engine.score(c,m),c);};
assert.equal(get('Strasbourg',11).label,'Great');
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
