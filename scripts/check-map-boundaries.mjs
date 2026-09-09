import assert from 'node:assert/strict';
import fs from 'node:fs';
import {repairBoundaryHeights,countryLabelAnchors} from './map-boundaries.mjs';
const fixture={'40-756':[[0,4,0],[1,.69,0],[1,.69,0],[2,4.2,0],[8,2,0],[9,.69,0]]};
const repaired=repairBoundaryHeights(fixture).output;
assert.equal(repaired['40-756'][1][1],4.1);
assert.equal(repaired['40-756'][3][1],4.2);
assert.equal(repaired['40-756'][5][1],2,'Disconnected arcs must not interpolate across the gap');
assert.equal(fixture['40-756'][1][1],.69,'Source remains unchanged');
const source=JSON.parse(fs.readFileSync(new URL('../storybook-lab/assets/borders.json',import.meta.url)));
const generated=JSON.parse(fs.readFileSync(new URL('../storybook/assets/borders.json',import.meta.url)));
assert.deepEqual(Object.keys(source),Object.keys(generated));
for(const [pair,points] of Object.entries(source)){
 assert.equal(points.length,generated[pair].length);
 for(let i=0;i<points.length;i++){
  assert.equal(points[i][0],generated[pair][i][0]);assert.equal(points[i][2],generated[pair][i][2]);
  assert.ok(Number.isFinite(generated[pair][i][1]));
  if(points[i][1]!==.69)assert.equal(points[i][1],generated[pair][i][1]);
 }
}
for(const pair of ['40-756','40-380','40-276'])assert.ok(generated[pair].every(p=>p[1]!==.69),'Austria border floor spikes removed');
const anchors=countryLabelAnchors(JSON.parse(fs.readFileSync(new URL('../play/vendor/world.json',import.meta.url))));
assert.ok(anchors[40][0]>13&&anchors[40][0]<15.5&&anchors[40][1]>47&&anchors[40][1]<48.5);
assert.ok(anchors[250][0]>0&&anchors[250][0]<5&&anchors[250][1]>45&&anchors[250][1]<49,'France label uses its European landmass');
console.log('Passed boundary regression: planar coordinates and topology retained, missing terrain samples repaired, country anchors correct.');
