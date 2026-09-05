from pathlib import Path
from bs4 import BeautifulSoup
import json,shutil,re
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'play'; OUT.mkdir(exist_ok=True)
data=json.loads((ROOT/'game-lab/data.json').read_text()); byslug={d['slug']:d for d in data if d.get('slug')}
fonts='https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito+Sans:wght@400;600;700;800;900&display=swap'
def head(prefix,title):
 return f'''<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{title}</title><meta name="robots" content="noindex,nofollow"><link rel="icon" href="{prefix}favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="{fonts}"><link rel="stylesheet" href="{prefix}game.css?v=world7final"><script type="importmap">{{"imports":{{"three":"./{prefix}vendor/three.module.js"}}}}</script>'''
def nav(prefix):
 return f'''<header class="game-nav"><a class="brand" href="{prefix}index.html"><span class="brand-symbol" aria-hidden="true">✦</span> When to go</a><nav aria-label="Main navigation"><a href="{prefix}index.html">World map</a><a href="{prefix}country/japan/">Japan</a><a href="{prefix}country/philippines/">Philippines</a><a class="versions-link" href="{prefix}../versions/">Versions</a></nav></header>'''
def footer(prefix):return f'''<footer class="game-footer"><a class="brand" href="{prefix}index.html">✦ When to go</a><p>A little planning. A big adventure.</p><a href="{prefix}../versions/">Explore the design versions ↗</a></footer>'''
def scripts(prefix,slug=''):
 return f'''<script>window.GAME_META={{root:{json.dumps(prefix)},slug:{json.dumps(slug)}}};</script><script src="{prefix}vendor/delaunator.min.js"></script><script type="module" src="{prefix}app.js?v=world7final"></script>'''
for slug,d in byslug.items():
 p=ROOT/'country'/slug/'index.html'
 if not p.exists(): continue
 s=BeautifulSoup(p.read_text(),'html.parser'); sections=s.main.find_all('section',recursive=False)
 # A new layout reuses the actual article words, including all route variants.
 for e in s.select('[style]'):
  if e.name!='svg' and not ('k-' in ' '.join(e.get('class',[]))):
   # Preserve geographic marker/data colors, remove all old layout declarations.
   if e.find_parent('svg') is None: e.attrs.pop('style',None)
 for e in s.select('.eyebrow,.orn'):
  if e.get_text(strip=True)=='Watch out':
   parent=e.parent; heading=s.new_tag('h2');heading.string='Watch out';e.insert_after(heading);e.find_parent('section')['id']='watch-out'
  e.decompose()
 cover=s.select_one('.cover'); lead=cover.select_one('.lead'); hero=f'''<section class="game-hero"><div class="hero-scene" data-scene="{slug}" role="img" aria-label="Explore an illustrative low-poly landscape of {d['name']}"></div><div class="hero-heading"><a href="../../index.html" class="back-map">← Back to the world</a><p>Find your best time to visit</p><h1 class="{'long-place' if len(d['name'])>9 else ''}">{d['name'].upper()}</h1><div class="hero-actions"><a class="button primary" href="#seasons">Find your season ↓</a><a class="button secondary" href="../../index.html?country={d['iso']}">Explore the map ↗</a></div></div><span class="scene-note">Illustrative landscape · drag to explore</span></section>'''
 graph=s.select_one('.strip').parent
 graph['class']=['season-graph'];graph['id']='seasons';graph.select_one('.cardhd').string='Your year in '+d['name']
 for bar in graph.select('.tile'):bar['type']='button';bar.name='button'
 intro=s.new_tag('div',attrs={'class':'guide-intro'});intro.append(lead.extract())
 # Original full month information in accessible, expandable rows.
 monthsec=s.select_one('#months');table=monthsec.select_one('table');rows=[]
 for i,row in enumerate(table.select('tbody tr')):
  td=row.find_all('td');rows.append(f'''<details class="month-detail" data-month="{i}"><summary><strong>{td[0].get_text()}</strong><span class="month-summary">{td[5].get_text(' ',strip=True).split('. ')[0]}</span>{str(td[4].select_one('.badge'))}<span aria-hidden="true">+</span></summary><div class="month-inside"><dl><div><dt>Daytime high</dt><dd>{td[1].decode_contents()}</dd></div><div><dt>Overnight low</dt><dd>{td[2].decode_contents()}</dd></div><div><dt>Rainfall</dt><dd>{td[3].decode_contents()}</dd></div></dl><p>{td[5].decode_contents()}</p></div></details>''')
 table.parent.replace_with(BeautifulSoup('<div class="month-details">'+''.join(rows)+'</div>','html.parser'))
 # Season summaries use the original labels and full explanations.
 stubs=s.select_one('.stubs');stubs.parent.parent['class']=['season-summary']
 rest=[]
 for sec in sections[2:]:
  sec['class']=['guide-section']
  if sec.select_one('#rt-list'): sec['class'].append('route-section')
  if sec.get('id')=='stay':sec['class'].append('stay-section')
  if sec.select_one('details'):sec['class'].append('faq-section') if not sec.get('id') else None
  if sec.select_one('.cm-side'):
   holder=sec.select_one('.cmapgrid > div');scene=s.new_tag('div',attrs={'class':'city-scene','data-country-scene':str(d['iso']),'aria-label':d['name']+' city weather map'});holder.insert(0,scene)
  rest.append(str(sec))
 # Keep original page behavior and FAQ/Article structured data.
 inline=''.join(str(x) for x in s.select('main > script') if "var MONF" not in x.get_text())
 schemas=''.join(str(x) for x in s.select('script[type="application/ld+json"]'))
 desc=str(s.select_one('meta[name="description"]'))+str(s.select_one('link[rel="canonical"]'))
 bottom=s.find('footer');bottom=str(bottom) if bottom else ''
 bottom=re.sub(r'<script[\s\S]*?</script>','',bottom)
 html=f'''<!doctype html><html lang="en"><head>{head('../../',d['name']+' | When to go Explorer')}{desc}{schemas}</head><body class="game-guide">{nav('../../')}<main>{hero}<nav class="guide-tabs" aria-label="Guide sections"><div><a href="#seasons">Seasons</a><a href="#months">By month</a><a href="#cities">By city</a><a href="#route">Route</a><a href="#watch-out">Watch out</a></div><a href="#stay" class="stay-shortcut">Where to stay ↗</a></nav><div class="guide-opening">{intro}{graph}{str(stubs.parent.parent)}</div>{''.join(rest)}</main>{bottom}<div class="version-return"><a href="../../../versions/">Explore the design versions ↗</a></div>{inline}<script src="../../styles/affiliates.js"></script>{scripts('../../',slug)}</body></html>'''
 # Only show section navigation that exists in this destination.
 for anchor_id,label in [('cities','By city'),('route','Route'),('watch-out','Watch out')]:
  if not s.select_one('#'+anchor_id):html=html.replace(f'<a href="#{anchor_id}">{label}</a>','')
 # Relative links continue within this iteration. Named anchors stay on this page.
 html=html.replace('href="../../index.html"',f'href="../../index.html?country={d["iso"]}"')
 out=OUT/'country'/slug;out.mkdir(parents=True,exist_ok=True);(out/'index.html').write_text(html)
maphtml=f'''<!doctype html><html lang="en"><head>{head('','Explore the world | When to go')}</head><body class="world-page">{nav('')}<main class="world-workspace"><div id="world-scene" role="region" aria-label="Interactive low-poly world map"></div><div class="world-tools"><label class="search-label"><span aria-hidden="true">⌕</span><input id="country-search" type="search" placeholder="Where are you dreaming of?" list="destinations" aria-label="Search countries"><datalist id="destinations"></datalist></label><div class="camera-tools"><button data-camera="world">World</button><button data-camera="392">Japan</button><button data-camera="608">Philippines</button><button data-camera="rotate" aria-label="Rotate map">↻</button><button data-camera="in" aria-label="Zoom in">+</button><button data-camera="out" aria-label="Zoom out">−</button></div></div><aside class="country-panel" aria-label="Selected destination"><button class="panel-toggle" aria-label="Expand or collapse destination details"><span></span></button><div id="country-panel-content"></div></aside><div class="world-months"><div class="month-heading"><span>When will you go?</span><strong id="active-month">November</strong></div><div class="weather-key" aria-label="Weather colors"><span><i style="background:var(--s-avoid)"></i>Bad</span><span><i style="background:var(--s-fair)"></i>Poor</span><span><i style="background:var(--s-good)"></i>Okay</span><span><i style="background:var(--s-great)"></i>Great</span><span><i style="background:var(--s-ideal)"></i>Best</span></div><div id="world-month-picker" class="month-picker"></div></div><span class="world-help">Drag to explore · scroll to zoom · right-drag to rotate</span></main>{scripts('')}</body></html>'''
(OUT/'index.html').write_text(maphtml)
for name in ['game.css','app.js','map.js','blender-map.js','world-details.js','data.json']:
 if (ROOT/'game-lab'/name).exists():shutil.copy2(ROOT/'game-lab'/name,OUT/name)
shutil.copytree(ROOT/'game-lab/vendor',OUT/'vendor',dirs_exist_ok=True)
if (ROOT/'game-lab/japan-diorama.js').exists():shutil.copy2(ROOT/'game-lab/japan-diorama.js',OUT/'japan-diorama.js')
shutil.copytree(ROOT/'styles',OUT/'styles',dirs_exist_ok=True);shutil.copy2(ROOT/'favicon.svg',OUT/'favicon.svg')
versions=ROOT/'versions';versions.mkdir(exist_ok=True)
(versions/'index.html').write_text(f'''<!doctype html><html lang="en"><head>{head('../play/','Design versions | When to go')}</head><body>{nav('../play/')}<main class="version-library"><h1>Find your favourite.</h1><p>Every design round has its own home. Come back to any of them.</p><section><h2>Low-poly Explorer</h2><p>The newest map and full country guides.</p><div class="row"><a class="button primary" href="../play/">World map</a><a class="button" href="../play/country/japan/">Japan guide</a><a class="button" href="../play/country/philippines/">Philippines guide</a></div></section><section><h2>The first three directions</h2><p>The original Canada designs, including the brochure header.</p><div class="row">{''.join(f'<a class="button" href="../archive-v1/?theme={t}#canada">{n}</a>' for t,n in [('explorer','Explorer'),('brochure','Travel Bureau'),('atlas','Field Atlas')])}</div></section><section><h2>The second iteration</h2><p>Detailed terrain and the Japan guide with the existing page layout.</p><div class="row"><a class="button" href="../prototypes/?theme=explorer&m=10&country=392">Terrain map</a><a class="button" href="../prototypes/country/japan/?theme=brochure&m=10">Brochure Japan</a></div></section><section><h2>The original site</h2><a class="button" href="../">Original world map</a><a class="button" href="../country/philippines/">Original Philippines guide</a></section></main></body></html>''')
print('Built the new Explorer and',len(byslug),'complete country guides; older versions preserved.')

shutil.copytree(ROOT/'game-lab/assets',OUT/'assets',dirs_exist_ok=True)
