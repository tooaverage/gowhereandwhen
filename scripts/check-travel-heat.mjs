import assert from 'node:assert/strict';
import fs from 'node:fs';
import {climateSamples,travelScore} from '../storybook-lab/travel-heat.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../storybook/data.json',import.meta.url)));
const featured=data.flatMap(r=>r.cities.filter(c=>c.featuredOrder));
assert.equal(featured.length,20);assert.equal(new Set(featured.map(c=>c.featuredOrder)).size,20);
for(const c of featured){for(const key of ['hi','lo','pr','months'])assert.equal(c[key].length,12);for(let m=0;m<12;m++){assert(c.hi[m]>=c.lo[m]);assert(c.pr[m]>=0);assert(c.months[m].score>=0&&c.months[m].score<=100);}assert.equal(c.source.period,'2001-2020');assert(c.source.url.startsWith('https://power.larc.nasa.gov/'));}
const paris=featured.find(c=>c.name==='Paris');assert(paris.hi[0]>3&&paris.hi[0]<9,'daily average high, not monthly extreme');assert(paris.hi[6]>20&&paris.hi[6]<29);
const samples=[{lng:-10,lat:0,scores:Array(12).fill(0)},{lng:10,lat:0,scores:Array(12).fill(100)}];
assert.equal(travelScore(samples,-10,0,0),0);assert.equal(travelScore(samples,10,0,0),100);assert.equal(travelScore(samples,0,0,0),50);
assert.equal(travelScore([],0,0,0,37),37);assert.equal(travelScore([{lng:179,lat:0,scores:Array(12).fill(72)}],-179,0,0),72);
for(const rec of data){const p=climateSamples(rec);for(let m=0;m<12;m++){const score=travelScore(p,rec.hub?.lng||0,rec.hub?.lat||0,m,rec.months[m].score);assert(Number.isFinite(score)&&score>=0&&score<=100);}}
assert(featured.find(c=>c.name==='Dubai').months[0].score>featured.find(c=>c.name==='Dubai').months[6].score,'Dubai winter is more comfortable than summer');
console.log('Passed: 20 sourced cities, complete monthly data, plausible daily averages, heat interpolation, missing-data fallback and seasonal contrast.');

const poor=samples.map(p=>({...p,scores:Array(12).fill(12)}));
const good=samples.map(p=>({...p,scores:Array(12).fill(92)}));
for(const x of [-20,0,20]){assert(Math.abs(travelScore(poor,x,0,0)-12)<1e-8,'uniform poor countries stay poor');assert(Math.abs(travelScore(good,x,0,0)-92)<1e-8,'uniform good countries stay good');}
