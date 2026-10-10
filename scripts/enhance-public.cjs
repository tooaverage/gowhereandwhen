const guideIcon=require('./guide-icon.cjs');
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
 const featured=all.flatMap(r=>r.cities.filter(c=>c.featuredOrder).map(c=>({...c,country:r.name,iso:r.iso}))).sort((a,b)=>a.featuredOrder-b.featuredOrder);
 const cityDirectory=`<section class="featured-cities" id="popular-cities-guide"><h2>20 popular cities: find your best month</h2><p>The first ten are Euromonitor’s 2025 leaders by international arrivals. The remaining ten are additional major destinations, not verified ranks 11–20. <a href="https://www.euromonitor.com/newsroom/press-releases/december-2025/euromonitor-international-unveils-worlds-top-100-city-destinations-for-2025">Ranking source</a>.</p><p>Compare each city’s highest-scoring months for outdoor sightseeing, then open it on the heatmap. Weather comfort does not measure crowds, prices or the best season for every activity.</p><div class="table-scroll"><table><caption>City weather comparisons, using NASA POWER 2001–2020 averages</caption><thead><tr><th scope="col">City</th><th scope="col">Best weather window</th><th scope="col">Explore</th></tr></thead><tbody>${featured.map(c=>`<tr><th scope="row">${esc(c.name)}<small>${esc(c.country)}</small></th><td>${esc(c.bestTime)}</td><td>${link('/?'+new URLSearchParams({country:c.iso,city:c.name,m:c.months.reduce((best,x,i,a)=>x.score>a[best].score?i:best,0),heat:1}),'See monthly weather')}</td></tr>`).join('')}</tbody></table></div><p>${link('/methodology/','Climate sources and heatmap coverage')}</p></section>`;
 home=home.replace('</main>',`</main><section class="seo-content" id="travel-guides"><h1>Find the best time to visit your next destination</h1><p>Explore the map above or compare ${guides.length} country guides below. Each guide combines monthly weather for a named city with regional advice and seasonal activities. A high comfort score can help with sightseeing; it does not measure ski snow, hotel prices or crowds.</p>${cityDirectory}<h2>Where to go by month</h2>${monthLinks()}<p>${link('/methodology/','Understand the weather ratings and their limits')}</p><h2>Browse country guides</h2>${directory()}</section>${footer()}`);
 home=home.replace('<body class="world-page">','<body class="world-page"><a class="skip-link" href="#travel-guides">Skip the map and browse travel guides</a>');
 fs.writeFileSync(path.join(out,'index.html'),home);
 for(const r of guides){
  const file=path.join(out,'country',r.slug,'index.html');let html=common(fs.readFileSync(file,'utf8'));
  const title=r.slug==='france'?'Best Time to Visit France: Paris, Riviera & Regional Weather':r.slug==='austria'?'Best Time to Visit Austria: Cities, Alps & Skiing':r.slug==='mexico'?'Best Time to Visit Mexico: Weather by City and Month':r.slug==='uk'?'Best Time to Visit the UK: Weather by City and Month':r.slug==='china'?'Best Time to Visit China: Weather by City and Month':r.slug==='germany'?'Best Time to Visit Germany: Cities, Oktoberfest & Alps':`Best Time to Visit ${r.name}: Weather by Month`;
  html=html.replace(/<title>.*?<\/title>/,`<title>${esc(title)} | GoWhereAndWhen</title>`);
  html=html.replace('Find your best time to visit','Best time to visit');
  html=html.replace(/(<div class="guide-intro">[\s\S]*?<\/div>)/,`$1<p class="rating-context">Weather scores use ${esc(r.city)} as a reference. They are not forecasts or measures of snow, prices or crowds. ${link('/methodology/','How to use these ratings')}</p>`);
  html=html.replace('Either side of peak, with thinner crowds and better rates.','Other months to compare; prices and crowds depend on your destination and dates.');
  html=html.replace('Rates climb in peak season, so the best-weather months pay to book early. Shoulder and low months are the value windows.','Compare actual rates for your travel dates. The weather scores above do not predict accommodation prices or availability.');
  html=html.replace('<span>Best month</span>','<span>Top weather score</span>');
  html=html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(tag,json)=>{const item=JSON.parse(json);if(item['@type']==='FAQPage')return '';if(item['@type']==='Article'){item.headline=title;item.dateModified=r.slug==='japan'?'2026-10-07':reviewed;item.author.url=origin+'/methodology/';}return schemas([item]);});
  // A visible breadcrumb matches the existing BreadcrumbList data.
  html=html.replace('<div class="guide-opening">',`<nav class="seo-breadcrumb" aria-label="Breadcrumb">${link('/','Home')} / ${link('/country/','Country guides')} / <span aria-current="page">${esc(r.name)}</span></nav><div class="guide-opening">`);
  html=html.replace('</main>',`<section class="guide-section"><div class="wrap"><h2>Plan another month or destination</h2>${monthLinks()}<p>${link('/country/','Browse all '+guides.length+' country guides')} · ${link('/methodology/','Sources, editorial approach and weather methodology')}</p></div></section></main>`);
  if(r.slug==='china'){
   html=html.replace('<span class="brand-symbol" aria-hidden="true">✦</span>','<img class="brand-mark" src="/storybook/assets/logo.svg" alt="" width="34" height="34">');
   html=html.replace('class="game-guide"','class="game-guide china-guide"');
   html=html.replace('<a data-canonical-link href="/country/">All guides</a></nav>','</nav>');
   html=html.replace('<section class="guide-section" id="months">',require('./china-regions.cjs')()+'<section class="guide-section" id="months">');
   html=html.replace('<a href="#months">By month</a>','<a href="#regions">Cities</a><a href="#months">Months</a>');
   html=html.replace('<a href="#seasons">Seasons</a>','<a href="#seasons">Scores</a>').replace('<a href="#watch-out">Watch out</a>','').replace('<a href="#stay" class="stay-shortcut">Where to stay ↗</a>','<a href="#stay" class="stay-shortcut">Stay</a>');
   html=html.replace(/<section class="season-summary">[\s\S]*?<\/section>/,'<section class="season-summary"><div class="wrap"><div class="stubs"><div class="stub"><div class="stub__band k-ideal">Top Beijing scores</div><span class="stub__v">Apr–May · Sep–Oct</span><p>Compare heat and rain before you choose.</p></div><div class="stub"><div class="stub__band k-good">Other months</div><span class="stub__v">Mar · Jun–Aug</span><p>Summer gets hotter and wetter in Beijing.</p></div><div class="stub"><div class="stub__band k-fair">Cold in Beijing</div><span class="stub__v">Nov–Feb</span><p>Harbin can still suit an ice trip.</p></div></div></div></section>');
   html=html.replace('Your year in China','Beijing weather by month').replace('<div class="k">Best month</div>','<div class="k">Beijing top score</div>');
   html=html.replace('<div class="k">Warmest, Jul</div>','<div class="k">Beijing Jul high</div>').replace('<div class="k">Wettest, Aug</div>','<div class="k">Beijing Aug rain</div>').replace('<div class="k">Coldest, Jan</div>','<div class="k">Beijing Jan low</div>');
   html=html.replace('<h3>Rainy season</h3>','<h3>Beijing rain</h3>').replace('<h3>Hard cold</h3>','<h3>Beijing cold</h3>');
   html=html.replace('Pick a month, see where the weather is good. A planning guide built from climate normals, not a forecast.','Choose a city and month. Past weather is a guide, not a forecast.');
   html=html.replace('The quietest, cheapest stretch of the year.','Compare prices for your dates. Weather cannot show the cheapest month.');
   html=html.replace(/"dateModified":"[^" ]+"/g,'"dateModified":"2026-10-09"');
  }
  if(r.slug==='japan'){
   html=html.replace('<span class="brand-symbol" aria-hidden="true">✦</span>','<img class="brand-mark" src="/storybook/assets/logo.svg" alt="" width="34" height="34">');
   html=html.replace('Your year in Japan','Tokyo weather by month').replace('<div class="k">Best month</div>','<div class="k">Tokyo top score</div>');
   html=html.replace(/<section class="guide-section" id="watch-out">[\s\S]*?<\/section>/,'<section class="guide-section" id="watch-out"><div class="wrap"><h2>Seasonal travel notes</h2><p>Rainy-season dates differ by region. Okinawa can start in May; much of Japan gets rain in June and July.</p><p>Typhoons are most frequent near Japan from July to October. Check current weather alerts before travel.</p></div></section>');
  }
  if(r.slug==='france'){
   html=html.replace('class="game-guide"','class="game-guide france-design-sample"');
  html=html.replace('Pick a month, see where the weather is good. A planning guide built from climate normals, not a forecast.','Pick a month. Find your next trip.');
  html=html.replace(/Figures are long run averages for a hub city, here ([^.]+)\. Real conditions vary by region and year\. (?:Some booking links earn us a commission, at no extra cost to you|Some links are affiliate links)\./,'Weather guide for $1, not a forecast. Other regions may differ.</p><p>Booking links may earn us a commission, at no extra cost to you.');


   html=html.replace('Spring brings lavender fields and gentler heat.','Lavender flowers in summer; dates vary by altitude and the season.');
   html=html.replace('far shorter queues than the July to August peak','a different balance of weather and seasonal demand');
   html=html.replace(/(<div class="guide-intro"><p class="lead">)[\s\S]*?(<\/p>)/,'$1<strong>Try May–June or September.</strong> Explore cities, coast and wine country. Use the map below to choose your stops.$2');
   html=html.replace('<section class="guide-section" id="months">',require('./france-combined-guide.cjs')(r)+'<section class="guide-section" id="months">');
   html=html.replace('France month by month','France weather by month: Paris');
   html=html.replace('Your year in France','Paris weather, by month');
   html=html.replace(/<section class="season-summary">[\s\S]*?<\/section>/,`<section class="season-summary"><div class="wrap"><div class="stubs"><div class="stub"><div class="stub__band k-ideal">City breaks</div><span class="stub__v">Spring · Autumn</span><p>Walks, parks and local food.</p></div><div class="stub"><div class="stub__band k-great">Seasonal trips</div><span class="stub__v">Choose a reason</span><p>Carnival, harvest visits or Christmas markets.</p></div><div class="stub"><div class="stub__band k-good">How we rate</div><span class="stub__v">More than weather</span><p>Weather + activities + events. <a href="#route">See each city's reason</a>.</p></div></div></div></section>`);
   html=html.replace('Try May–June or September.</strong> Explore cities, coast and wine country. Use the map below to choose your stops.','Choose a month for your kind of trip.</strong> Our travel ratings combine weather, seasonal activities and events. Each city shows why.');

   html=html.replace('<a href="#months">By month</a>','<a href="#route">Plan your trip</a><a href="#months">By month</a>');
   html=html.replace('December to April in the Alps, with the most reliable snow in January and February.','Winter is the ski season, but opening dates and snow vary by resort and altitude. Check the resort’s current lift and snow reports.');
   html=html.replace("June and September for warm seas without the peak August crush along the Cote d'Azur.",'Compare June and September for a coastal trip. Air-temperature scores do not measure sea warmth or beach conditions.');
   html=html.replace(/<section class="guide-section"><div class="wrap prose">\s*<h2>Best time to visit France for<\/h2>[\s\S]*?<\/section>/,`<section class="guide-section"><div class="wrap"><h2>When to go, by trip</h2><div class="trip-grid"><article>${guideIcon('building')}<h3>City walks</h3><p class="visit-window">April–June · September</p><p>Explore Paris and Lyon in mild weather.</p></article><article>${guideIcon('sun')}<h3>The coast</h3><p class="visit-window">June · September</p><p>Try the Riviera. Sea warmth varies.</p></article><article>${guideIcon('grape')}<h3>Wine country</h3><p class="visit-window">September–October</p><p>Harvest time in the vineyards.</p></article><article>${guideIcon('snowflake')}<h3>Skiing</h3><p class="visit-window">Winter</p><p>Check snow and lift openings before you book.</p></article></div></div></section>`);
   html=html.replace(/<section class="guide-section" id="watch-out">[\s\S]*?<\/section>/,`<section class="guide-section" id="watch-out"><div class="wrap"><h2>Before you go</h2><div class="trip-grid"><article>${guideIcon('snowflake')}<h3>Winter chill</h3><p>Pack warm layers for Paris in December and January.</p></article><article>${guideIcon('umbrella')}<h3>Autumn rain</h3><p>Keep a rainy-day plan for Nice in October.</p></article></div></div></section>`);
   html=html.replace('>Watch out</a>','>Before you go</a>');
   html=html.replace(/"dateModified":"[^" ]+"/g,'"dateModified":"2026-09-26"');
  }
  if(r.slug==='austria'){
   html=html.replace(/(<div class="guide-intro"><p class="lead">)[\s\S]*?(<\/p>)/,'$1<strong>Choose spring or autumn for a city break, June–September for lakes and mountain holidays, or winter for skiing.</strong> Austria has no single best month for every trip: Vienna weather does not describe conditions on an Alpine ski slope.$2');
   html=html.replace('Austria month by month','Austria weather by month: Vienna');
   html=html.replace('<section class="guide-section" id="months">',fs.readFileSync(path.join(root,'scripts/austria-season-guide.html'),'utf8')+'<section class="guide-section" id="months">');
   html=html.replace('December to March across the Tyrol and western Alps, with the deepest, most reliable snow at the higher resorts.','Late December to early March is the core ski season, according to Austria Tourism. Individual resorts can open earlier or close later; check their snow reports and lift openings.');
   html=html.replace('The quiet shoulder seasons are mild and cheaper.','Spring and autumn are useful options for city breaks; compare prices for your dates.');
  }
  if(r.slug==='germany'){
   html=html.replace('<span class="brand-symbol" aria-hidden="true">✦</span>','<img class="brand-mark" src="/storybook/assets/logo.svg" alt="" width="34" height="34">');
   html=html.replace('<a href="#months">By month</a>','<a href="#months">Months</a>');
   html=html.replace('<a href="#cities">By city</a>','<a href="#cities">Cities</a>').replace('<a href="#route">Route</a>','<a href="#route">Trip</a>');
   html=html.replace('href="#stay" class="stay-shortcut">Where to stay ↗','href="#stay" class="stay-shortcut">Stay');
   html=html.replace('Your year in Germany','Berlin weather by month').replace('<div class="k">Best month</div>','<div class="k">Berlin top score</div>');
   html=html.replace(/<section class="season-summary">[\s\S]*?<\/section>/,'<section class="season-summary"><div class="wrap"><div class="stubs"><div class="stub"><div class="stub__band k-ideal">Berlin weather</div><span class="stub__v">Apr–Oct</span><p>Higher outdoor comfort scores.</p></div><div class="stub"><div class="stub__band k-good">Cooler in Berlin</div><span class="stub__v">Mar · Nov</span><p>Pack for cool days.</p></div><div class="stub"><div class="stub__band k-fair">Cold in Berlin</div><span class="stub__v">Dec–Feb</span><p>Markets can still suit a winter trip.</p></div></div></div></section>');
   html=html.replace('The quietest, cheapest stretch of the year.','Compare prices for your dates. Weather cannot show the cheapest month.');
   html=html.replace('<a href="#watch-out">Watch out</a>','<a href="#watch-out">Info</a>');
   html=html.replace('<section class="guide-section" id="months">','<section class="guide-section"><div class="wrap"><details class="guide-sources"><summary>Germany sources and limits</summary><p>The 2027 <a href="https://www.oktoberfest.de/en">Oktoberfest dates</a> are September 18 to October 3. <a href="https://www.germany.travel/de/kampagne/weihnachtsmaerkte/weihnachtsmaerkte.html">Germany Travel</a> lists Christmas markets; check each market’s current dates. <a href="https://zugspitze.de/en/Service-information/Opening-hours-timetables">Zugspitze</a> gives expected ski and lift dates, subject to conditions. <a href="https://int.bahn.de/en/faq/deutschlandticket-which-trains">Deutsche Bahn</a> explains Deutschland-Ticket limits. Berlin weather scores and the city map use older curated inputs; this update does not verify each station record or change the scores. Checked October 2026.</p></details></div></section><section class="guide-section" id="months">');
   html=html.replace(/"dateModified":"[^" ]+"/g,'"dateModified":"2026-10-10"');
  }
  if(r.slug==='spain'){
   html=html.replace('<section class="guide-section" id="months">',require('./spain-regions.cjs')(r)+'<section class="guide-section" id="months">');
   html=html.replace('<a href="#months">By month</a>','<a href="#regions">By city</a><a href="#months">By month</a>');
   html=html.replace('November, January and February, outside the holidays, when crowds thin and prices fall, with mild weather on the coast.','Compare current prices for your dates. Weather averages cannot show the cheapest month.');
   html=html.replace('The quietest, cheapest stretch of the year.','Check local events and prices for your dates.');
   html=html.replace('June and September along the Mediterranean, with warm seas before and after the August peak.','Compare June and September for the Mediterranean coast. Air temperature does not show sea warmth.');
   html=html.replace('Warm seas and long days on the Mediterranean, on either side of the August crowds.','Try the Mediterranean coast in June or September. Check sea conditions locally.');
   html=html.replace(/"dateModified":"[^" ]+"/g,'"dateModified":"2026-09-27"');
  }
  if(r.slug==='turkey'){
   html=html.replace('<section class="guide-section" id="months">',require('./turkey-regions.cjs')()+'<section class="guide-section" id="months">');
   html=html.replace('<a href="#months">By month</a>','<a href="#regions">Regions</a><a href="#months">Months</a>');
   html=html.replace('class="stay-shortcut">Where to stay ↗','class="stay-shortcut">Stay ↗');
   html=html.replace('The quietest, cheapest stretch of the year.','Compare weather by region and prices for your dates.');
   html=html.replace(/"dateModified":"[^" ]+"/g,'"dateModified":"2026-10-03"');
  }
  if(r.slug==='italy'){
   html=html.replace('<section class="guide-section" id="months">',require('./italy-regions.cjs')()+'<section class="guide-section" id="months">');
   html=html.replace('<a href="#months">By month</a>','<a href="#regions">Cities</a><a href="#months">Months</a>');
   html=html.replace('class="stay-shortcut" href="#stay">Where to stay ↗','class="stay-shortcut" href="#stay">Stay ↗');
   html=html.replace('Go in <strong>spring, April to June</strong>, or <strong>September to October</strong>, for warm, dry days and thinner crowds. <strong>July and August</strong> are hot and packed, and <strong>winter</strong> is cool and quiet, ideal for art cities without the queues.','<strong>Choose your city first.</strong> Spring and autumn can suit city walks. Summer is hot in Rome and the south.');
   html=html.replace('Italy is at its best in the shoulder seasons. The ratings key off Rome, where spring and early autumn bring warm, dry, comfortable weather and the great sights without the August crush. Locals take their own holidays in August, so cities can feel both crowded with tourists and shut for the season.','The ratings above use Rome weather. They cannot rate the whole country. Compare cities below before choosing a month.');
   html=html.replace('The country stretches from Alpine peaks to the hot Mediterranean south, so conditions vary. The north is cooler and greener, Tuscany glows in late spring and at harvest, and Sicily and the south stay warm well into autumn.','Italy spans mountains, cities and islands. City weather does not tell you mountain snow or sea warmth.');
   html=html.replace('<div class="k">Best month</div>','<div class="k">Top Rome score</div>');
   html=html.replace('<div class="k">Warmest, Aug</div>','<div class="k">Rome Aug high</div>');
   html=html.replace('<div class="k">Wettest, Nov</div>','<div class="k">Rome Nov rain</div>');
   html=html.replace('<div class="k">Coldest, Jan</div>','<div class="k">Rome Jan low</div>');
   html=html.replace('The quietest, cheapest stretch of the year.','Compare prices for your dates. Weather cannot show the cheapest month.');
   html=html.replace('Spring wildflowers and a golden September harvest. Summer is hot in Florence and Rome, but the hill country stays pleasant.','Florence and Rome heat up in summer. Check the city table for your month.');
   html=html.replace('April to June and September to October for Rome, Florence and Venice, with warm days and shorter queues.','Compare spring and autumn for Rome, Florence and Venice. Check local events for busy dates.');
   html=html.replace('June and September for the Amalfi Coast, Sardinia and Sicily, with warm seas and fewer crowds than August.','Compare June and September for coastal trips. Air temperature does not show sea warmth.');
   html=html.replace('September and October bring the grape and olive harvests, truffle season and a calendar of food festivals.','Check local harvest and food event dates for autumn trips.');
   html=html.replace('December to March in the Dolomites and the northern Alps.','Check each resort’s lift and snow reports before you book a winter trip.');
   html=html.replace('Wildflowers across Tuscany and Umbria, and warm, clear days in the art cities.','Try city walks in spring. Weather still varies by place and day.');
   html=html.replace('The vendemmia and olive harvest fill the countryside with festivals and new wine.','Look for local harvest events in autumn. Check dates before you go.');
   html=html.replace('Spring, April to June, and September to October, when the weather is warm and dry and the crowds are lighter than in high summer.','Compare spring and autumn for city walks. The best month depends on where you go.');
   html=html.replace(/"dateModified":"[^" ]+"/g,'"dateModified":"2026-10-04"');
  }
  if(r.slug==='uk'){
   html=html.replace('<section class="guide-section" id="months">',require('./uk-regions.cjs')()+'<section class="guide-section" id="months">');
   html=html.replace('<a href="#months">By month</a>','<a href="#regions">Cities</a><a href="#months">Months</a>');
   html=html.replace('The quietest, cheapest stretch of the year.','Compare prices for your dates. Weather cannot show the cheapest month.');
   html=html.replace(/"dateModified":"[^" ]+"/g,'"dateModified":"2026-10-06"');
  }
  if(r.slug==='mexico'){
   html=html.replace('<section class="guide-section" id="months">',require('./mexico-regions.cjs')()+'<section class="guide-section" id="months">');
   html=html.replace('<a href="#months">By month</a>','<a href="#regions">Cities</a><a href="#months">Months</a>');
   html=html.replace('<a href="#watch-out">Watch out</a>','<a href="#watch-out">Notes</a>');
   html=html.replace('class="stay-shortcut" href="#stay">Where to stay ↗','class="stay-shortcut" href="#stay">Stay ↗');
   html=html.replace('The quietest, cheapest stretch of the year.','Compare prices for your dates. Weather cannot show the cheapest month.');
   html=html.replace(/"dateModified":"[^" ]+"/g,'"dateModified":"2026-10-05"');
  }
  if(r.slug==='usa'){
   html=html.replace('<section class="guide-section" id="months">',require('./usa-regions.cjs')(r)+'<section class="guide-section" id="months">');
   html=html.replace('<a href="#months">By month</a>','<a href="#regions">Weather</a><a href="#months">By month</a>');
   html=html.replace('For most of the country, <strong>May, June, September and October</strong> are the window you want. Summer is peak in the north and the parks, winter suits Florida and the desert, and <strong>late summer</strong> brings heat and storms.','<strong>Choose your region first.</strong> Compare eight cities below. Summer suits many northern trips; winter can suit Florida.');
   html=html.replace('The USA is too big for a single season. New York stands in for the temperate Northeast in the ratings here, where spring and autumn are the gentlest times and the leaves in October are famous, but the right month depends entirely on where you are headed.','The score above uses New York weather. It cannot rate the whole USA. Check the city table for a closer match to your trip.');
   html=html.replace('As a rule, May and September travel well almost everywhere: warm enough for the north, past the worst desert heat, and clear of the summer crowds. The two dates to plan around are the Atlantic hurricane season, which runs June to November and peaks from August to October, and the western wildfire season in late summer.','Atlantic hurricane season runs June through November. Activity peaks around September 10. Check current forecasts before coastal travel.');
   html=html.replace('June to September for Yellowstone, the Rockies and the Pacific Northwest. The desert Southwest is best in spring and autumn, avoiding the summer heat.','Check each park’s road dates. Yellowstone has limited winter access, and roads can close with weather.');
   html=html.replace('May and September are the best all-round months, comfortable across most of the country. Beyond that it depends on the region: summer for the north and the parks, winter for Florida and the desert.','It depends on your region. Compare the eight cities below, then check local conditions for your travel dates.');
   html=html.replace('June to September, when high-country roads and trails are open and the weather is reliably warm. Book far ahead for the marquee parks.','For Yellowstone, check current road and facility dates. Summer has wider access, but weather can still close roads.');
   html=html.replace('The Atlantic hurricane season runs June to November and peaks from August to October, affecting the Southeast, the Gulf coast and the Caribbean side.','The Atlantic season runs June through November. Activity usually peaks around September 10. Check current forecasts for coastal trips.');
   html=html.replaceAll('May and September are the best all-round months to visit the USA, with mild weather across most regions.','Compare monthly weather in eight US cities. The best month depends on your region and plans.');
   html=html.replace(/"dateModified":"[^" ]+"/g,'"dateModified":"2026-10-01"');
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
 fs.writeFileSync(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url=>`  <url><loc>${origin+url}</loc><lastmod>${url==='/country/germany/'?'2026-10-10':url==='/country/china/'?'2026-10-09':url==='/country/japan/'?'2026-10-07':url==='/country/uk/'?'2026-10-06':url==='/country/mexico/'?'2026-10-05':url==='/country/italy/'?'2026-10-04':url==='/country/turkey/'?'2026-10-03':url==='/country/usa/'?'2026-10-01':url==='/country/spain/'?'2026-09-27':url==='/country/france/'?'2026-09-26':reviewed}</lastmod></url>`).join('\n')}\n</urlset>\n`);
 fs.writeFileSync(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
 fs.writeFileSync(path.join(out,'404.html'),shell('Page Not Found','Find a destination guide or return to the world map.','/404.html','<h1>That page could not be found</h1><p>'+link('/','Open the world map')+' or '+link('/country/','browse country guides')+'.</p>').replace('index,follow,max-image-preview:large','noindex,follow').replace(/<link rel="canonical"[^>]*>/,''));
 fs.writeFileSync(path.join(out,'llms.txt'),`# GoWhereAndWhen\n\nSeasonal travel planning with an interactive map and ${guides.length} country guides. Weather values are representative-city estimates, not forecasts, snow reports, crowd or price measurements.\n\n- [Country guides](${origin}/country/)\n- [Methodology and limitations](${origin}/methodology/)\n${guides.map(r=>`- [${r.name}](${origin}/country/${r.slug}/)`).join('\n')}\n`);
 console.log(`SEO build: ${urls.length} canonical pages, local fonts, bundled map, discoverable guide and month directories.`);
};
