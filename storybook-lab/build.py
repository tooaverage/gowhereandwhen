from pathlib import Path
import shutil, subprocess
subprocess.run(["node", str(Path(__file__).resolve().parent/"build-canada.cjs")],check=True,cwd=Path(__file__).resolve().parent.parent)
subprocess.run(["node", str(Path(__file__).resolve().parent/"build-usa.cjs")],check=True,cwd=Path(__file__).resolve().parent.parent)
r=Path(__file__).resolve().parent
out=r.parent/'storybook'
out.mkdir(exist_ok=True)
for name in ['index.html','app.js','map.js','game.css','world-details.js','data.json']:
 shutil.copy2(r/name,out/name)
shutil.copytree(r/'assets',out/'assets',dirs_exist_ok=True)
print('Built separate Storybook edition.')

# Keep every guide's editorial content and SVG city map in the Storybook edition.
import re
for source in sorted((r.parent/'play/country').glob('*/index.html')):
 slug=source.parent.name
 page=source.read_text()
 page=page.replace('../../game.css?v=world7final','../../game.css?v=storybook13').replace('../../app.js?v=world7final','../../app.js?v=storybook13')
 page=page.replace('./../../vendor/three.module.js','../../../play/vendor/three.module.js').replace('../../vendor/delaunator.min.js','../../../play/vendor/delaunator.min.js').replace('../../styles/affiliates.js','../../../play/styles/affiliates.js').replace('../../favicon.svg','../../assets/logo.svg')
 page=page.replace('root:"../../",slug:"'+slug+'"','root:"../../../play/",slug:"'+slug+'",storybook:true,rounded:true')
 page=page.replace('When to go Explorer','When to go').replace('<span aria-hidden="true" class="brand-symbol">✦</span>','<img class="brand-mark" src="../../assets/logo.svg" alt="" width="34" height="34">')
 page=page.replace('Explore an illustrative low-poly landscape of','Explore the Storybook map around').replace('Illustrative landscape · drag to explore','Drag to explore · select a country' if slug!='japan' else 'Drag to explore Japan')
 page=re.sub(r'<div[^>]*data-country-scene="[^"]*"[^>]*></div>','',page)
 if slug not in ['japan','canada']:page=page.replace('class="game-hero"','class="game-hero map-guide-hero"')
 page=page.replace('When to go','gowhereandwhen.com').replace('When To Go','gowhereandwhen.com')
 if slug=='canada':
  page=page.replace('class="game-hero"','class="game-hero canada-scene-hero"').replace('Drag to explore · select a country','Drag to explore Vancouver’s harbour').replace('Explore the Storybook map around Canada','Explore a Storybook scene inspired by Vancouver')
 if slug in ['canada','usa']:
  page=page.replace('<section class="guide-section" id="watch-out">',(r/(slug+'-guide.html')).read_text()+'<section class="guide-section" id="watch-out">')
  page=page.replace('<a href="#months">By month</a>','<a href="#months">By month</a><a href="#cities">By city</a>')
 target=out/'country'/slug;target.mkdir(parents=True,exist_ok=True);(target/'index.html').write_text(page)
print('Built',len(list((out/'country').glob('*/index.html'))),'Storybook country guides.')
