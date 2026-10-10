const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../public-dist'),origin='https://gowhereandwhen.com';
const read=file=>fs.readFileSync(file,'utf8'),attrs=tag=>Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
const urls=[...read(path.join(root,'sitemap.xml')).matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
assert.equal(urls.length,89);assert.equal(new Set(urls).size,89);
const titles=new Set(),linked=new Set();
for(const url of urls){const file=path.join(root,new URL(url).pathname,'index.html'),html=read(file);const tags=[...html.matchAll(/<(?:meta|link|a|script|img|iframe)\b[^>]*>/g)].map(m=>({type:m[0].match(/^<(\w+)/)[1],...attrs(m[0])}));
 const canonical=tags.filter(t=>t.rel==='canonical').map(t=>t.href);assert.deepEqual(canonical,[url],url+' canonical');assert(!tags.some(t=>t.name==='robots'&&t.content.includes('noindex')),url+' indexing');
 const title=html.match(/<title>(.*?)<\/title>/)[1];assert(!titles.has(title),url+' unique title');titles.add(title);assert(html.includes('<h1'),url+' heading');assert(tags.some(t=>t.name==='description'&&t.content.length>40),url+' description');
 assert(!html.includes('fonts.googleapis.com'),url+' external font dependency');assert(!html.includes('delaunator.min.js'),url+' unused triangulator');
 for(const t of tags){const target=t.type==='a'?t.href:['script','img','iframe'].includes(t.type)?t.src:null;if(!target)continue;const dest=new URL(target.replaceAll('&amp;','&'),url);if(dest.origin!==origin)continue;const p=path.join(root,decodeURIComponent(dest.pathname),dest.pathname.endsWith('/')?'index.html':'');assert(fs.existsSync(p),url+' missing '+target);if(t.type==='a'){linked.add(origin+dest.pathname);if(dest.hash&&p.endsWith('.html'))assert(read(p).includes('id="'+decodeURIComponent(dest.hash.slice(1))+'"'),url+' fragment '+target);}}
 for(const json of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))JSON.parse(json[1]);
}
for(const url of urls)assert(linked.has(url),url+' orphaned');
for(const dir of ['storybook','play','cartoon','bureau','prototypes','archive-v1','versions']){function walk(p){for(const d of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,d.name);if(d.isDirectory())walk(f);else if(d.name.endsWith('.html'))assert(read(f).includes('noindex,follow'),f+' draft indexable');}}walk(path.join(root,dir));}
assert(read(path.join(root,'404.html')).includes('noindex'));
const sourceData=JSON.parse(read(path.resolve(__dirname,'../storybook/data.json'))),publicData=JSON.parse(read(path.join(root,'storybook/data.json')));
assert.deepEqual(publicData.map(({lead,...record})=>record),sourceData.map(({lead,...record})=>record),'Weather data, scores, cities and map destinations preserved');
const philippines=read(path.join(root,'country/philippines/index.html'));assert(philippines.includes('id="island-life"'));assert(philippines.includes('island-life.js'));assert(philippines.includes('data-booking-type="accommodation"'));
assert(read(path.join(root,'country/austria/index.html')).includes('late December to early March'));
const germany=read(path.join(root,'country/germany/index.html'));
assert(germany.includes('usually not ICE, IC or EC trains')&&germany.includes('https://int.bahn.de/en/faq/deutschlandticket-which-trains')&&!germany.includes('Deutschland-Ticket or rail pass covers most of it'),'Germany ticket scope and source');
assert(germany.includes('September 19 to October 4, 2026')&&germany.includes('Germany sources and limits'),'Germany dated event and source disclosure');
const usa=read(path.join(root,'country/usa/index.html'));
const usaSection=usa.match(/<section class="guide-section" id="regions">([\s\S]*?)<\/section>/)?.[1];
assert(usaSection,'USA regional table missing');
assert(usa.includes('Choose your region first.')&&!usa.includes('May and September are the best all-round months'),'USA regional lead');
assert(usaSection.includes('1991–2020')&&usaSection.includes('These city stations leave out Alaska'),'USA period and coverage limit');
assert.equal((usaSection.match(/<tr>/g)||[]).length,13,'USA table has header and twelve months');
const usaCities=sourceData.find(r=>r.iso===840).cities.filter(c=>['New York City','Chicago','Miami','Denver','Seattle','San Francisco','Los Angeles','Honolulu'].includes(c.name));
assert.equal(usaCities.length,8);
for(const city of usaCities){assert.equal(city.source.period,'1991–2020');assert(city.source.url.startsWith('https://www.ncei.noaa.gov/'));assert(usaSection.includes(city.source.url));for(const key of ['hi','lo','pr'])assert.equal(city[key].length,12);}
const turkey=read(path.join(root,'country/turkey/index.html'));
const turkeySection=turkey.match(/<section class="guide-section" id="regions">([\s\S]*?)<\/section>/)?.[1];
assert(turkeySection,'Turkey regional table missing');
assert.equal((turkeySection.match(/<tr>/g)||[]).length,13,'Turkey table has header and twelve months');
for(const city of require('../climate/turkey-mgm.json')){
 assert(turkeySection.includes(city.name)&&turkeySection.includes(city.source.replaceAll('&','&amp;')),city.name+' source visible');
 assert.equal(city.period,'1991-2020 seasonal normals');
 assert.equal(city.provider,'Turkish State Meteorological Service (MGM)');
 for(const key of ['hi','lo','pr'])assert.equal(city[key].length,12,city.name+' '+key);
}
assert(turkey.includes('Balloon flights can still be cancelled by weather.')&&!turkey.includes('calmest, clearest mornings'),'Turkey balloon claim');
assert(!/[✿☀🌷]/u.test(turkey),'Turkey pictograph markers');
const italy=read(path.join(root,'country/italy/index.html'));
const italySection=italy.match(/<section class="guide-section" id="regions">([\s\S]*?)<\/section>/)?.[1];
assert(italySection,'Italy regional table missing');
assert.equal((italySection.match(/<tr>/g)||[]).length,13,'Italy table has header and twelve months');
assert(italy.includes('The score above uses Rome.')&&italy.includes('These city estimates cannot describe the Alps'),'Italy score and coverage limits');
assert(!italy.includes('The quietest, cheapest stretch of the year.')&&!/[✿☀🌷]/u.test(italy),'Italy copy and pictographs');
for(const city of require('../climate/italy.json')){
 assert(italySection.includes(city.name)&&italySection.includes(city.source.url.replaceAll('&','&amp;')),city.name+' source visible');
 assert.equal(city.source.period,'2001-2020');
 for(const key of ['hi','lo','pr'])assert.equal(city[key].length,12,city.name+' '+key);
}
const mexico=read(path.join(root,'country/mexico/index.html'));
const china=read(path.join(root,'country/china/index.html'));
const chinaSection=china.match(/<section class="guide-section" id="regions">([\s\S]*?)<\/section>/)?.[1];
assert(chinaSection,'China regional table missing');
assert.equal((chinaSection.match(/<tr>/g)||[]).length,13,'China table has header and twelve months');
assert(china.includes('The score above uses Beijing.')&&chinaSection.includes('Tibet, Xinjiang, Hainan'),'China score and coverage limits');
assert(!china.includes('mild, dry weather across most of the country')&&!/[✿☀🌷]/u.test(china),'China broad claim and pictographs');
for(const city of require('../climate/china.json')){
 assert(chinaSection.includes(city.name.replaceAll("'",'&#39;'))&&chinaSection.includes(city.source.url.replaceAll('&','&amp;')),city.name+' source visible');
 assert.equal(city.source.period,'2001-2020');
 assert(city.lat>18&&city.lat<54&&city.lng>73&&city.lng<135,city.name+' plausible China coordinates');
 assert(city.units?.hi?.includes('degrees C')&&city.units?.pr?.includes('mm'),city.name+' units recorded');
 for(const key of ['hi','lo','pr'])assert.equal(city[key].length,12,city.name+' '+key);
 for(let m=0;m<12;m++)assert(city.hi[m]>=city.lo[m]&&city.hi[m]<50&&city.lo[m]>-40&&city.pr[m]>=0&&city.pr[m]<1000,city.name+' plausible month '+m);
}
const uk=read(path.join(root,'country/uk/index.html'));
const ukSection=uk.match(/<section class="guide-section" id="regions">([\s\S]*?)<\/section>/)?.[1];
assert(ukSection,'UK regional table missing');
assert.equal((ukSection.match(/<tr>/g)||[]).length,13,'UK table has header and twelve months');
assert(uk.includes('The score above uses London.')&&ukSection.includes('cannot describe the Highlands'),'UK score and coverage limits');
for(const city of require('../climate/uk.json')){
 assert(ukSection.includes(city.name)&&ukSection.includes(city.source.url.replaceAll('&','&amp;')),city.name+' source visible');
 assert.equal(city.source.period,'1991–2020');
 assert(city.lat>50&&city.lat<56.5&&city.lng> -6.5&&city.lng<0,city.name+' plausible UK coordinates');
 for(const key of ['hi','lo','pr'])assert.equal(city[key].length,12,city.name+' '+key);
 for(let m=0;m<12;m++)assert(city.hi[m]>=city.lo[m]&&city.hi[m]<40&&city.lo[m]>-20&&city.pr[m]>=0&&city.pr[m]<500,city.name+' plausible month '+m);
}
const mexicoSection=mexico.match(/<section class="guide-section" id="regions">([\s\S]*?)<\/section>/)?.[1];
assert(mexicoSection,'Mexico regional table missing');
assert.equal((mexicoSection.match(/<tr>/g)||[]).length,13,'Mexico table has header and twelve months');
assert(mexico.includes('The score above uses Mexico City.')&&mexico.includes('Storm dates show a season, not a local forecast.'),'Mexico score and storm limits');
assert(!mexico.includes('The quietest, cheapest stretch of the year.')&&!/[✿☀🌷]/u.test(mexico),'Mexico copy and pictographs');
for(const city of require('../climate/mexico.json')){
 assert(mexicoSection.includes(city.name)&&mexicoSection.includes(city.source.url.replaceAll('&','&amp;')),city.name+' source visible');
 assert.equal(city.source.period,'2001-2020');
 assert(city.lat>14&&city.lat<33&&city.lng> -118&&city.lng< -86,city.name+' inside Mexico bounds');
 assert(city.units?.hi?.includes('degrees C')&&city.units?.pr?.includes('mm'),city.name+' units recorded');
 for(const key of ['hi','lo','pr'])assert.equal(city[key].length,12,city.name+' '+key);
 for(let m=0;m<12;m++)assert(city.hi[m]>=city.lo[m]&&city.hi[m]<50&&city.lo[m]>-20&&city.pr[m]>=0&&city.pr[m]<1000,city.name+' plausible month '+m);
}
console.log('Passed: 89 canonical pages, unique metadata, crawlable internal links/assets/fragments, schema JSON, archive noindex, 404 and retained island/booking surfaces.');
