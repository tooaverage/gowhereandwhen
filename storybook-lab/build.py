from pathlib import Path
import shutil, subprocess
subprocess.run(["python3", str(Path(__file__).resolve().parent/"build-islands.py")],check=True)
subprocess.run(["node", str(Path(__file__).resolve().parent/"build-canada.cjs")],check=True,cwd=Path(__file__).resolve().parent.parent)
subprocess.run(["node", str(Path(__file__).resolve().parent/"build-usa.cjs")],check=True,cwd=Path(__file__).resolve().parent.parent)
r=Path(__file__).resolve().parent
out=r.parent/'storybook'
out.mkdir(exist_ok=True)
for name in ['index.html','app.js','map.js','game.css','world-details.js','traffic.js','reveal.js','canada-snow.js','data.json','island-life.css','island-life.js','fonts.css','meshopt-decoder.js']:
 shutil.copy2(r/name,out/name)
shutil.copytree(r/'assets',out/'assets',dirs_exist_ok=True)
print('Built separate Storybook edition.')

# Keep every guide's editorial content and SVG city map in the Storybook edition.
import re
for source in sorted((r.parent/'play/country').glob('*/index.html')):
 slug=source.parent.name
 page=source.read_text()
 page=page.replace('../../game.css?v=world7final','../../game.css?v=storybook32').replace('../../app.js?v=world7final','../../app.js?v=storybook32')
 page=page.replace('./../../vendor/three.module.js','../../../play/vendor/three.module.js').replace('../../vendor/delaunator.min.js','../../../play/vendor/delaunator.min.js').replace('../../styles/affiliates.js','../../../play/styles/affiliates.js').replace('../../favicon.svg','../../assets/logo.svg')
 page=page.replace('root:"../../",slug:"'+slug+'"','root:"../../../play/",slug:"'+slug+'",storybook:true,rounded:true')
 page=page.replace('When to go Explorer','When to go').replace('<span aria-hidden="true" class="brand-symbol">✦</span>','<img class="brand-mark" src="../../assets/logo.svg" alt="" width="34" height="34">')
 page=page.replace('Explore an illustrative low-poly landscape of','Explore the Storybook map around').replace('Illustrative landscape · drag to explore','Drag to explore · select a country' if slug!='japan' else 'Drag to explore Japan')
 page=re.sub(r'<div[^>]*data-country-scene="[^"]*"[^>]*></div>','',page)
 if slug not in ['japan','canada']:page=page.replace('class="game-hero"','class="game-hero map-guide-hero"')
 page=page.replace('When to go','gowhereandwhen.com').replace('When To Go','gowhereandwhen.com')
 if slug=='canada':
  page=page.replace('class="game-hero"','class="game-hero canada-scene-hero"').replace('Drag to explore · select a country','Drag to explore Vancouver’s harbour').replace('Explore the Storybook map around Canada','Explore a Storybook scene inspired by Vancouver')
 if slug in ['japan','canada']:
  poster=f'../../assets/{slug}-hero.webp?v=storybook32'
  page=page.replace('</head>',f'<link rel="preload" as="image" href="{poster}" fetchpriority="high"/><link rel="preload" as="fetch" href="../../assets/{slug}-storybook-optimized.glb.gz?v=seo1" crossorigin/>\n</head>')
  page=re.sub(r'(<div[^>]*class="hero-scene"[^>]*>)',lambda m:m.group(1)+f'<img class="scene-poster" src="{poster}" alt="" width="1280" height="1000" fetchpriority="high" decoding="async"/>',page)
 if slug in ['canada','usa']:
  page=page.replace('<section class="guide-section" id="watch-out">',(r/(slug+'-guide.html')).read_text()+'<section class="guide-section" id="watch-out">')
  page=page.replace('<a href="#months">By month</a>','<a href="#months">By month</a><a href="#cities">By city</a>')
 if slug=='philippines':
  page=page.replace('../../app.js?v=storybook32','../../app.js?v=storybook32-islands2')
  page=page.replace('<a href="#seasons">Seasons</a>','<a href="#island-life">Island life</a><a href="#seasons">Seasons</a>')
  page=page.replace('<section class="guide-section" id="months">',(r/'philippines-guide.html').read_text()+'<section class="guide-section" id="months">')
  page=page.replace('</head>','<link rel="stylesheet" href="../../island-life.css?v=2"/><script defer src="../../island-life.js?v=2"></script></head>')
  page=page.replace('Go in the <strong>dry season, December to May</strong>, for sunny days and calm seas across the islands. The <strong>wet season, June to November</strong>, brings the rains and overlaps the typhoon season, which peaks from July to October.','<strong>Choose the island as well as the month.</strong> Manila’s drier December–May pattern is a starting point, not a promise for every coast. Siargao is wetter in winter; beach conditions also depend on wind and tides. <a href="#island-life">Explore island life below ↓</a>')
  page=page.replace('The Philippines is over seven thousand islands, hot and tropical, with a clear dry and wet season. We rate on Manila, where the dry months from December to May are the time for the beaches, diving and island hopping.','The Philippines has thousands of islands with different rainfall patterns. The weather scores on this page use Manila; use the island portraits and city comparison for a more local picture.')
  page=page.replace('The best time to visit the Philippines is the dry season, December to May, with sunny weather and calm seas for the islands and beaches.','Explore Philippines islands by season, beach conditions, local vibe and room costs. Compare bases in Bohol, Palawan, Siquijor, Camiguin and beyond.')
 target=out/'country'/slug;target.mkdir(parents=True,exist_ok=True);(target/'index.html').write_text(page)
print('Built',len(list((out/'country').glob('*/index.html'))),'Storybook country guides.')
