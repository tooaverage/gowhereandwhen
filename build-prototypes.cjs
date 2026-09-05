// Preserve original generated pages and behaviors, then apply the design layer.
const fs = require('node:fs');
const path = require('node:path');
const {CONTENT} = require('./content.js');
const ROOT = __dirname;
const OUT = path.join(ROOT, 'prototypes');
const read = p => fs.readFileSync(path.join(ROOT,p),'utf8');
fs.mkdirSync(OUT,{recursive:true});
for(const name of ['styles','geo','images','country'])fs.cpSync(path.join(ROOT,name),path.join(OUT,name),{recursive:true});
for(const name of ['favicon.svg','og.png','site.webmanifest'])fs.copyFileSync(path.join(ROOT,name),path.join(OUT,name));
fs.cpSync(path.join(ROOT,'design-lab'),path.join(OUT,'lab'),{recursive:true});
const themes = `<nav class="lab-switcher" aria-label="Design comparison"><span class="lab-switcher-label">Design study</span><button data-lab-theme="explorer">Explorer</button><button data-lab-theme="brochure">Travel Bureau</button><button data-lab-theme="atlas">Field Atlas</button><a class="lab-japan">Japan guide ↗</a></nav>`;
const colors = {'#e23b2e':'#596f8c','#ee4338':'#596f8c','#ef8a2c':'#96b8c8','#ff8f2e':'#96b8c8','#f2cf2e':'#e1ce82','#f3c218':'#e1ce82','#7cc24a':'#a2b966','#74c043':'#a2b966','#1f9e57':'#32785d','#0f8145':'#32785d','#b5462c':'#29657a','#9e3d24':'#29657a','#ea4335':'#596f8c'};
function neutralizeRed(c){const n=parseInt(c.slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255;if(r>g*1.2&&r>b*1.15&&r-g>25)return (r+g+b)/3>185?'#dae5df':(r+g+b)/3>100?'#8fabb4':'#305c71';return c;}
function colorize(html){return html.replace(/#[0-9a-fA-F]{6}\b/g,c=>colors[c.toLowerCase()]||neutralizeRed(c));}
function decorate(html,depth,meta){const prefix='../'.repeat(depth);html=colorize(html);html=html.replace('<html lang="en">','<html lang="en" data-theme="brochure">');html=html.replace(/<meta name="robots"[^>]*>/g,'');html=html.replace('</head>',`<meta name="robots" content="noindex,nofollow"><link href="https://fonts.googleapis.com/css2?family=Chicle&family=Vollkorn:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet"><link rel="stylesheet" href="${prefix}lab/assets/maplibre-gl.css"><link rel="stylesheet" href="${prefix}lab/lab.css"><script>window.LAB_META=${JSON.stringify({...meta,root:prefix})};document.documentElement.dataset.theme=['explorer','brochure','atlas'].includes(new URLSearchParams(location.search).get('theme'))?new URLSearchParams(location.search).get('theme'):'brochure';</script></head>`);html=html.replace('<body>',`<body class="${meta.map?'lab-map':'lab-guide'}">${themes}`);return html.replace('</body>',`<script src="${prefix}lab/assets/maplibre-gl.js"></script><script src="${prefix}lab/lab.js"></script></body>`);}
let index=read('index.html');
index=index.replace(/const CDNS = \[[\s\S]*?\];/,'const CDNS = ["./lab/assets/world.json"];');
index=index.replace(/<span class="kicker">The best time to visit<\/span><h1>Anywhere on earth<\/h1>/,'<h1>When to go</h1>');
index=index.replace('class="guides" href="country/"','class="guides" href="country/japan/"').replace('>Guides</a>','>Japan guide ↗</a>');
fs.writeFileSync(path.join(OUT,'index.html'),decorate(index,0,{map:true}));
function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())visit(full);else if(entry.name.endsWith('.html')){const rel=path.relative(OUT,full),depth=rel.split(path.sep).length-1;const slug=path.basename(path.dirname(full));const c=CONTENT.find(c=>c.slug===slug);fs.writeFileSync(full,decorate(fs.readFileSync(full,'utf8'),depth,{map:false,slug,iso:c?.iso,name:c?.name}));}}}
visit(path.join(OUT,'country'));
fs.writeFileSync(path.join(OUT,'styles/wtg.css'),colorize(read('styles/wtg.css')));
for(const name of ['prototype.css','prototype.js','data.json','assets']){const p=path.join(OUT,name);if(fs.existsSync(p))fs.rmSync(p,{recursive:true});}
const dist=path.join(ROOT,'dist');fs.mkdirSync(dist,{recursive:true});fs.cpSync(OUT,dist,{recursive:true});
console.log(`Built design variations from the original map and ${CONTENT.length} complete country guides.`);
