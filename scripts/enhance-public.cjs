// SEO and public delivery are built together; never mutate the source archives.
const fs=require('node:fs'),path=require('node:path'),{buildSync,transformSync}=require('esbuild');
const origin='https://gowhereandwhen.com',reviewed='2026-09-08';
const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain=value=>String(value||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&');
const link=(url,label)=>`<a data-canonical-link href="${url}">${esc(label)}</a>`;
module.exports=function enhancePublic(root,out){
 const all=JSON.parse(fs.readFileSync(path.join(root,'storybook/data.json')));
 const austria=all.find(r=>r.iso===40);austria.lead='<strong>Spring or autumn for cities, June–September for lakes and mountain holidays, and winter for skiing.</strong> Vienna’s weather score does not describe Alpine snow conditions. Compare the activity-specific seasons in the guide.';
 fs.writeFileSync(path.join(out,'storybook/data.json'),JSON.stringify(all));
 const guides=all.filter(r=>r.slug&&fs.existsSync(path.join(out,'country',r.slug,'index.html'))).sort((a,b)=>a.name.localeCompare(b.name));
 const css=fs.readFileSync(path.join(root,'storybook/fonts.css'),'utf8')+fs.readFileSync(path.join(root,'storybook/game.css'),'utf8')+fs.readFileSync(path.join(root,'scripts/seo.css'),'utf8');
 const style=`<style>${transformSync(css,{loader:'css',minify:true}).code}</style>`;
 const fontPreload='<link rel="preload" href="/storybook/assets/fonts/nunito-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>';
 const manifest=buildSync({entryPoints:[path.join(root,'storybook/app.js')],outdir:path.join(out,'storybook'),bundle:true,splitting:true,format:'esm',target:['es2022'],minify:true,sourcemap:'linked',metafile:true,entryNames:'app-[hash]',chunkNames:'chunk-[hash]',alias:{three:path.join(root,'play/vendor/three.module.js')},logLevel:'warning'}).metafile;
 const appOutput=Object.entries(manifest.outputs).find(([name,info])=>info.entryPoint?.endsWith('storybook/app.js')&&name.endsWith('.js'))[0];
 const appURL='/'+path.relative(out,path.resolve(appOutput)).split(path.sep).join('/');
 const schemas=(items)=>items.map(item=>`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org',...item}).replace(/</g,'\\u003c')}</script>`).join('');
 function common(html){
  html=html.replace(/<link\b[^>]*href="https:\/\/fonts\.[^"]*"[^>]*>/g,'').replace(/<link\b[^>]*href="[^"]*game\.css[^"]*"[^>]*>/,style+fontPreload);
  html=html.replace(/<script[^>]*type="importmap"[^>]*>.*?<\/script>/gs,'').replace(/<script[^>]*src="[^"]*delaunator[^>]*><\/script>/g,'');
  html=html.replace(/<script[^>]*src="[^"]*\/app\.js[^>]*><\/script>/g,`<script type="module" src="${appURL}"></script>`);
  // Existing Google Fonts connections and prototype navigation add no public value.
  html=html.replace(/<div class="version-return">\s*<\/div>/g,'');
  html=html.replace(/<div\b(?=[^>]*id="rpick")[^>]*>/g,tag=>tag.replace('role="tablist"','role="group"'));
  html=html.replace('</nav>',link('/country/','All guides')+'</nav>');
  html=html.replace(/<meta\b(?=[^>]*\bname="robots")[^>]*>/g,'<meta name="robots" content="index,follow,max-image-preview:large">');
  return html;
 }
 const monthLinks=()=>`<nav class="month-links" aria-label="Travel guides by month">${months.map(m=>link('/when/'+m.toLowerCase()+'/',m)).join('')}</nav>`;
 const footer=()=>`<footer class="seo-footer"><p>${link('/','World map')} · ${link('/country/','All country guides')} · ${link('/methodology/','How our ratings work')}</p><p>Seasonal planning estimates, not a forecast. Compare the named city and region before choosing your travel dates.</p></footer>`;
 function shell(title,description,url,body,extra=[]){return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | GoWhereAndWhen</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${origin+url}"><link rel="icon" href="/favicon.svg">${style+fontPreload}${schemas(extra)}</head><body class="directory-page"><header class="game-nav">${link('/','gowhereandwhen.com')}<nav aria-label="Main navigation">${link('/','World map')}${link('/country/','All guides')}</nav></header><main class="seo-content">${body}</main>${footer()}</body></html>`;}
 function save(url,html){const dest=path.join(out,url,'index.html');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,html);}
 function directory(){return [...new Set(guides.map(r=>r.region))].map(region=>`<section class="destination-region"><h2>${esc(region)}</h2><ul class="destination-list">${guides.filter(r=>r.region===region).map(r=>`<li>${link('/country/'+r.slug+'/','Best time to visit '+r.name)}<span>Monthly weather for ${esc(r.city)}</span></li>`).join('')}</ul></section>`).join('');}
 // Keep legacy designs accessible, but keep them out of search results.
 function excludeDrafts(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(item.isDirectory())excludeDrafts(p);else if(item.name.endsWith('.html')){let s=fs.readFileSync(p,'utf8');s=s.replace(/<meta\b(?=[^>]*\bname="robots")[^>]*>/g,'');s=s.replace('</head>','<meta name="robots" content="noindex,follow"></head>');fs.writeFileSync(p,s);}}}
 for(const dir of ['storybook','play','cartoon','bureau','prototypes','archive-v1','versions'])if(fs.existsSync(path.join(out,dir)))excludeDrafts(path.join(out,dir));
 let home=common(fs.readFileSync(path.join(out,'index.html'),'utf8'));
 home=home.replace(/<title>.*?<\/title>/,'<title>Best Time to Visit Anywhere: Travel Weather by Month | GoWhereAndWhen</title>');
 home=home.replace('</head>',schemas([{'@type':'WebSite','@id':origin+'/#website',name:'GoWhereAndWhen',url:origin+'/',description:'Compare monthly travel weather on an interactive world map and read destination guides.',inLanguage:'en'}])+'</head>');
 home=home.replace('</main>',`</main><section class="seo-content" id="travel-guides"><h1>Find the best time to visit your next destination</h1><p>Explore the map above or compare ${guides.length} country guides below. Each guide combines monthly weather for a named city with regional advice and seasonal activities. A high comfort score can help with sightseeing; it does not measure ski snow, hotel prices or crowds.</p><h2>Where to go by month</h2>${monthLinks()}<p>${link('/methodology/','Understand the weather ratings and their limits')}</p><h2>Browse country guides</h2>${directory()}</section>${footer()}`);
 home=home.replace('<body class="world-page">','<body class="world-page"><a class="skip-link" href="#travel-guides">Skip the map and browse travel guides</a>');
 fs.writeFileSync(path.join(out,'index.html'),home);
 for(const r of guides){
  const file=path.join(out,'country',r.slug,'index.html');let html=common(fs.readFileSync(file,'utf8'));
  const title=r.slug==='austria'?'Best Time to Visit Austria: Cities, Alps & Skiing':`Best Time to Visit ${r.name}: Weather by Month`;
  html=html.replace(/<title>.*?<\/title>/,`<title>${esc(title)} | GoWhereAndWhen</title>`);
  html=html.replace('Find your best time to visit','Best time to visit');
  html=html.replace(/(<div class="guide-intro">[\s\S]*?<\/div>)/,`$1<p class="rating-context">Weather scores use ${esc(r.city)} as a reference. They are not forecasts or measures of snow, prices or crowds. ${link('/methodology/','How to use these ratings')}</p>`);
  html=html.replace('Either side of peak, with thinner crowds and better rates.','Other months to compare; prices and crowds depend on your destination and dates.');
  html=html.replace('Rates climb in peak season, so the best-weather months pay to book early. Shoulder and low months are the value windows.','Compare actual rates for your travel dates. The weather scores above do not predict accommodation prices or availability.');
  html=html.replace('<span>Best month</span>','<span>Top weather score</span>');
  html=html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(tag,json)=>{const item=JSON.parse(json);if(item['@type']==='FAQPage')return '';if(item['@type']==='Article'){item.headline=title;item.dateModified=reviewed;item.author.url=origin+'/methodology/';}return schemas([item]);});
  // A visible breadcrumb matches the existing BreadcrumbList data.
  html=html.replace('<div class="guide-opening">',`<nav class="seo-breadcrumb" aria-label="Breadcrumb">${link('/','Home')} / ${link('/country/','Country guides')} / <span aria-current="page">${esc(r.name)}</span></nav><div class="guide-opening">`);
  html=html.replace('</main>',`<section class="guide-section"><div class="wrap"><h2>Plan another month or destination</h2>${monthLinks()}<p>${link('/country/','Browse all '+guides.length+' country guides')} · ${link('/methodology/','Sources, editorial approach and weather methodology')}</p></div></section></main>`);
  if(r.slug==='austria'){
   html=html.replace(/(<div class="guide-intro"><p class="lead">)[\s\S]*?(<\/p>)/,'$1<strong>Choose spring or autumn for a city break, June–September for lakes and mountain holidays, or winter for skiing.</strong> Austria has no single best month for every trip: Vienna weather does not describe conditions on an Alpine ski slope.$2');
   html=html.replace('Austria month by month','Austria weather by month: Vienna');
   html=html.replace('<section class="guide-section" id="months">',fs.readFileSync(path.join(root,'scripts/austria-season-guide.html'),'utf8')+'<section class="guide-section" id="months">');
   html=html.replace('December to March across the Tyrol and western Alps, with the deepest, most reliable snow at the higher resorts.','Late December to early March is the core ski season, according to Austria Tourism. Individual resorts can open earlier or close later; check their snow reports and lift openings.');
   html=html.replace('The quiet shoulder seasons are mild and cheaper.','Spring and autumn are useful options for city breaks; compare prices for your dates.');
  }
  fs.writeFileSync(file,html);
 }
 save('/country/',shell('Best Time to Visit by Country','Compare 74 destination guides with monthly weather, regional seasons and activity advice. Find the right month for your next trip.','/country/',`<h1>Best time to visit, country by country</h1><p>Start with a destination, then compare the months. The weather figures refer to the city named in each guide; the regional and activity sections help you plan beyond it.</p>${monthLinks()}${directory()}`));
 months.forEach((month,m)=>{
  const ranked=guides.slice().sort((a,b)=>b.months[m].score-a.months[m].score||a.name.localeCompare(b.name));
  const description=`Compare ${month} travel weather in ${guides.length} destinations. See daytime temperatures, precipitation and seasonal tradeoffs before choosing where to go.`;
  const rows=ranked.map(r=>`<tr><th scope="row">${link('/country/'+r.slug+'/',r.name)}<small>${esc(r.city)}</small></th><td>${r.hi[m]}°C</td><td>${r.lo[m]}°C</td><td>${r.pr[m]} mm</td><td>${r.months[m].score}/100</td></tr>`).join('');
  save('/when/'+month.toLowerCase()+'/',shell(`Where to Go in ${month}: Weather by Destination`,description,'/when/'+month.toLowerCase()+'/',`<nav class="seo-breadcrumb" aria-label="Breadcrumb">${link('/','Home')} / <span>${month}</span></nav><h1>Where to go in ${month}</h1><p>Compare ${month} weather for ${guides.length} destinations, ordered by the site's outdoor comfort score. ${ranked.slice(0,3).map(r=>link('/country/'+r.slug+'/',r.name)).join(', ')} are among the highest-scoring options for the representative cities in our dataset.</p><p>This is a starting point for a trip, not a list of guaranteed best destinations. A colder month can be excellent for skiing, and the rainiest season can differ between coasts of the same country. Open a country guide for regional seasons and activities.</p><p>${link('/?m='+m,'Explore '+month+' on the interactive world map')} · ${link('/methodology/','How these scores are calculated')}</p><h2>${month} weather comparison</h2><p>High and low temperatures are in Celsius; precipitation is the monthly total in millimetres. These are approximate, curated planning values. The dataset does not yet document a verified station and reference period for every city.</p><div class="table-scroll"><table class="weather-table"><caption>${month} weather for each guide's reference city</caption><thead><tr><th scope="col">Destination / city</th><th scope="col">Daytime high</th><th scope="col">Nighttime low</th><th scope="col">Precipitation</th><th scope="col">Comfort score</th></tr></thead><tbody>${rows}</tbody></table></div><h2>Choose a different month</h2>${monthLinks()}`));
 });
 save('/methodology/',shell('How Our Travel Weather Ratings Work','Understand GoWhereAndWhen weather scores, source limitations, regional differences and the editorial approach behind the country guides.','/methodology/',fs.readFileSync(path.join(root,'scripts/methodology.html'),'utf8')));
 const urls=['/','/country/',...guides.map(r=>'/country/'+r.slug+'/'),...months.map(m=>'/when/'+m.toLowerCase()+'/'),'/methodology/'];
 require('./add-analytics.cjs')(root,out,urls);
 fs.writeFileSync(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url=>`  <url><loc>${origin+url}</loc><lastmod>${reviewed}</lastmod></url>`).join('\n')}\n</urlset>\n`);
 fs.writeFileSync(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
 fs.writeFileSync(path.join(out,'404.html'),shell('Page Not Found','Find a destination guide or return to the world map.','/404.html','<h1>That page could not be found</h1><p>'+link('/','Open the world map')+' or '+link('/country/','browse country guides')+'.</p>').replace('index,follow,max-image-preview:large','noindex,follow').replace(/<link rel="canonical"[^>]*>/,''));
 fs.writeFileSync(path.join(out,'llms.txt'),`# GoWhereAndWhen\n\nSeasonal travel planning with an interactive map and ${guides.length} country guides. Weather values are representative-city estimates, not forecasts, snow reports, crowd or price measurements.\n\n- [Country guides](${origin}/country/)\n- [Methodology and limitations](${origin}/methodology/)\n${guides.map(r=>`- [${r.name}](${origin}/country/${r.slug}/)`).join('\n')}\n`);
 console.log(`SEO build: ${urls.length} canonical pages, local fonts, bundled map, discoverable guide and month directories.`);
};
