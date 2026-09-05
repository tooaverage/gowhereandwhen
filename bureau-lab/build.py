"""Build a separate Travel Bureau edition from the complete guide presentation."""
from pathlib import Path
from bs4 import BeautifulSoup
import json, shutil

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'bureau'
DATA = json.loads((ROOT / 'game-lab/data.json').read_text())
BY_SLUG = {d['slug']: d for d in DATA if d.get('slug')}
FONTS = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap'
PHOTOS = {
    'japan': ('japan-kamikochi.jpg', 'Kamikōchi, Japan', 'Pcs34560 · Public domain', 'https://commons.wikimedia.org/wiki/File:Azusa_river_and_Mount_Hotakadake_as_seen_from_Kamikochi_20110717_0710_photo_by_Pcs34560.jpg'),
    'philippines': ('philippines-el-nido.jpg', 'El Nido, Palawan', 'choypictures · CC0', 'https://commons.wikimedia.org/wiki/File:El_Nido_in_Palawan.jpg'),
}

for source in [ROOT / 'play/index.html', *sorted((ROOT / 'play/country').glob('*/index.html'))]:
    relative = source.relative_to(ROOT / 'play')
    slug = relative.parts[1] if len(relative.parts) > 1 else ''
    prefix = '../../' if slug else ''
    s = BeautifulSoup(source.read_text(), 'html.parser')
    s.body['class'].append('bureau')
    s.title.string = (BY_SLUG[slug]['name'] + ' | ' if slug else '') + 'Travel Bureau | When to go'
    for link in s.select('link[href]'):
        if 'fonts.googleapis.com/css2?' in link['href']:
            link['href'] = FONTS
    s.head.append(s.new_tag('link', rel='stylesheet', href=prefix + 'bureau.css'))
    for script in s.select('script'):
        if 'window.GAME_META=' in script.get_text():
            script.string = script.get_text().replace('root:', 'bureau:true,root:')
    brand = s.select_one('.brand')
    brand.clear()
    brand.append('When to go')
    edition = s.new_tag('span', attrs={'class': 'edition-name'})
    edition.string = 'Travel Bureau'
    brand.append(edition)
    links = s.select_one('.game-nav nav')
    switch = s.new_tag('a', href=prefix + '../play/' + ('country/' + slug + '/' if slug else ''), attrs={'class':'direction-link'})
    switch.string = 'Try Explorer ↗'
    links.select_one('.versions-link').insert_before(switch)
    if slug:
        d = BY_SLUG[slug]
        photo = PHOTOS.get(slug)
        place = d['name'].upper()
        if photo:
            file, caption, credit, credit_url = photo
            media = f'<img class="cover-photo" src="{prefix}assets/{file}" alt="{caption}" fetchpriority="high" width="1400" height="1000"><div class="cover-geography"><img src="{prefix}assets/{slug}-outline.svg" alt="Map of {d["name"]}" width="400" height="600"><span>{d["region"]}</span></div>'
            credit_html = f'<a class="photo-credit" href="{credit_url}" target="_blank" rel="noopener">{caption} · {credit}</a>'
        else:
            media = f'<div class="hero-scene" data-scene="{slug}"></div>'
            credit_html = ''
        hero = f'''<section class="bureau-cover" data-place="{slug}">
          <div class="cover-masthead"><a href="../../index.html?country={d['iso']}">← Back to the world</a><span>A guide for every season</span></div>
          <div class="cover-title"><p>Find your best time to visit</p><h1 class="{'long-place' if len(place)>9 else ''}">{place}</h1></div>
          <div class="cover-window">{media}{credit_html}</div>
          <div class="cover-bottom"><span class="travel-ticket">Your journey, month by month</span><a href="#seasons" class="button primary">Find your best month ↓</a><a href="../../index.html?country={d['iso']}" class="cover-map-link">Explore the map ↗</a></div>
        </section>'''
        s.select_one('.game-hero').replace_with(BeautifulSoup(hero, 'html.parser'))
    else:
        s.select_one('#world-scene')['aria-label'] = 'Interactive world weather map'
        rotate = s.select_one('[data-camera="rotate"]')
        rotate.decompose()
        s.select_one('.world-help').string = 'Drag to explore · scroll to zoom'
    out = OUT / relative
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(str(s))

for name in ['game.css', 'app.js', 'map.js', 'data.json', 'favicon.svg']:
    shutil.copy2(ROOT / 'play' / name, OUT / name)
for directory in ['vendor', 'styles']:
    shutil.copytree(ROOT / 'play' / directory, OUT / directory, dirs_exist_ok=True)
shutil.copy2(ROOT / 'bureau-lab/bureau.css', OUT / 'bureau.css')
shutil.copytree(ROOT / 'bureau-lab/assets', OUT / 'assets', dirs_exist_ok=True)

versions = ROOT / 'versions/index.html'
s = BeautifulSoup(versions.read_text(), 'html.parser')
section = BeautifulSoup('''<section><h2>Travel Bureau, revisited</h2><p>The retro brochure edition, with complete guides and a monthly world heatmap.</p><div class="row"><a class="button primary" href="../bureau/">World map</a><a class="button" href="../bureau/country/japan/">Japan guide</a><a class="button" href="../bureau/country/philippines/">Philippines guide</a></div></section>''', 'html.parser')
s.select_one('.version-library section').insert_after(section)
versions.write_text(str(s))
# Make the current directions immediately accessible from each other.
for p in (ROOT / 'play').rglob('index.html'):
    s = BeautifulSoup(p.read_text(), 'html.parser')
    rel = p.relative_to(ROOT / 'play')
    prefix = '../../../bureau/country/' + rel.parts[1] + '/' if len(rel.parts)>1 else '../bureau/'
    nav = s.select_one('.game-nav nav')
    if nav and not nav.select_one('.direction-link'):
        a = s.new_tag('a', href=prefix, attrs={'class':'direction-link'})
        a.string = 'Travel Bureau ↗'
        nav.select_one('.versions-link').insert_before(a)
        p.write_text(str(s))
print('Built Travel Bureau, 74 complete guides, and links between both current directions.')
