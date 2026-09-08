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
const philippines=read(path.join(root,'country/philippines/index.html'));assert(philippines.includes('id="island-life"'));assert(philippines.includes('island-life.js'));assert(philippines.includes('affiliates.js'));
assert(read(path.join(root,'country/austria/index.html')).includes('late December to early March'));
console.log('Passed: 89 canonical pages, unique metadata, crawlable internal links/assets/fragments, schema JSON, archive noindex, 404 and retained island/booking surfaces.');
