// Publish Storybook at the established public URLs while retaining source archives.
const fs=require('node:fs'),path=require('node:path');
const root=__dirname,out=path.join(root,'public-dist');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out);
for(const name of ['styles','geo','images','country','og.png','site.webmanifest','play','cartoon','storybook','bureau','prototypes','archive-v1','versions','CNAME','robots.txt','sitemap.xml','llms.txt']){
 const src=path.join(root,name);if(fs.existsSync(src))fs.cpSync(src,path.join(out,name),{recursive:true});
}
function publicHTML(html){
 return html.replace(/<meta[^>]*content="noindex,nofollow"[^>]*\/>/g,'<meta name="robots" content="index,follow"/>')
 .replace(/<a class="(?:direction-link|versions-link)"[^>]*>.*?<\/a>/gs,'')
 .replace(/<a[^>]*class="(?:direction-link|versions-link)"[^>]*>.*?<\/a>/gs,'')
 .replace(/<span class="storybook-badge">.*?<\/span>/g,'')
 .replace(/<div class="edition-links">.*?<\/div>/gs,'')
 .replace(/<a[^>]*>Explore the design versions[^<]*<\/a>/g,'')
 .replaceAll('View &amp; style','Map controls')
 .replaceAll('View & style for angles and motion','Map controls for angles and motion');
}
let home=fs.readFileSync(path.join(root,'storybook/index.html'),'utf8');
home=publicHTML(home).replace(/<title>[^<]*<\/title>/,'<title>gowhereandwhen.com | Best time to visit anywhere, by month</title>')
 .replaceAll('./assets/logo.svg','./storybook/assets/logo.svg').replaceAll('./game.css?v=storybook13','./storybook/game.css?v=storybook13')
 .replaceAll('./app.js?v=storybook13','./storybook/app.js?v=storybook13').replaceAll('../play/','./play/')
 .replace('storybook:true','storybook:true,public:true')
 .replace('</head>','<meta name="description" content="Explore a playful 3D world map and find the best time to visit 74 countries. Compare monthly weather ratings, cities and seasonal highlights."/><link rel="canonical" href="https://gowhereandwhen.com/"/></head>');
fs.writeFileSync(path.join(out,'index.html'),home);
let count=0;
for(const entry of fs.readdirSync(path.join(root,'storybook/country'),{withFileTypes:true})){
 if(!entry.isDirectory())continue;
 const src=path.join(root,'storybook/country',entry.name,'index.html');if(!fs.existsSync(src))continue;
 let page=publicHTML(fs.readFileSync(src,'utf8')).replaceAll('../../../play/','../../play/').replaceAll('../../../bureau/','../../bureau/').replaceAll('../../../versions/','../../versions/')
 .replaceAll('../../game.css?v=storybook13','../../storybook/game.css?v=storybook13').replaceAll('../../app.js?v=storybook13','../../storybook/app.js?v=storybook13')
 .replaceAll('../../assets/logo.svg','../../storybook/assets/logo.svg').replace('storybook:true','storybook:true,public:true');
 const dest=path.join(out,'country',entry.name);fs.mkdirSync(dest,{recursive:true});fs.writeFileSync(path.join(dest,'index.html'),page);count++;
}
const directory=path.join(out,'country/index.html');
if(fs.existsSync(directory))fs.writeFileSync(directory,fs.readFileSync(directory,'utf8').replaceAll('When To Go','gowhereandwhen.com').replaceAll('When to go','gowhereandwhen.com'));
const manifestPath=path.join(out,'site.webmanifest');
if(fs.existsSync(manifestPath)){const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));manifest.name='gowhereandwhen.com';manifest.short_name='gowhereandwhen.com';fs.writeFileSync(manifestPath,JSON.stringify(manifest));}
fs.copyFileSync(path.join(root,'storybook/assets/logo.svg'),path.join(out,'favicon.svg'));
fs.writeFileSync(path.join(out,'.nojekyll'),'');
if(count!==74)throw Error(`Expected 74 Storybook country guides; found ${count}`);
console.log(`Public website built: Storybook homepage and ${count} country guides. Older editions retained.`);
