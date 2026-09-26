// A reproducible inventory for the daily editorial queue, never a quality claim.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),data=require('../storybook/data.json');
const ranking=require('../docs/destination-priority.json'),priority=ranking.orderedIso;
const rows=data.map(r=>({iso:r.iso,name:r.name,arrivalsRank:priority.includes(r.iso)?priority.indexOf(r.iso)+1:null,slug:r.slug||null,region:r.region,hasGuide:!!r.slug,cityCount:r.cities.length,sourcedCityCount:r.cities.filter(c=>c.source?.url).length,regionalPrototype:r.iso===36,editorialStatus:'needs-review'}));
rows.sort((a,b)=>{const rank=r=>priority.includes(r.iso)?priority.indexOf(r.iso):r.hasGuide?100:200;return rank(a)-rank(b)||a.name.localeCompare(b.name);});
fs.writeFileSync(path.join(root,'docs/content-coverage.json'),JSON.stringify({prioritySource:ranking,note:'Inventory only. Completion requires the source and editorial checks in CONTENT-FACTORY.md; multiple cities do not imply full national coverage.',destinations:rows},null,2)+'\n');
console.log('Updated coverage backlog for '+rows.length+' countries and territories.');
