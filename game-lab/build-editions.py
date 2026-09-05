from pathlib import Path
from bs4 import BeautifulSoup
r=Path(__file__).resolve().parents[1]
p=r/'play/index.html';s=BeautifulSoup(p.read_text(),'html.parser')
options=BeautifulSoup('''<details class="map-options"><summary>View &amp; style</summary><div class="map-options-content"><div class="edition-links"><a href="/play/" aria-current="page">Low poly</a><a href="/cartoon/">Cartoon</a></div><button id="map-top" type="button">Top view ↓</button><label><input id="map-orbit" type="checkbox">Orbit when dragging</label><small id="drag-instruction">Drag to pan · pinch to zoom</small><label><input id="map-motion" type="checkbox" checked>Gentle motion</label><label><input id="map-regional" type="checkbox">Australia regional gradient</label><small>Seasonal sights appear as you zoom in.</small></div></details>''','html.parser')
s.select_one('[data-camera=rotate]').replace_with(options)
s.select_one('.world-months').append(BeautifulSoup('<p class="regional-note" hidden>Australia trial: a smooth blend of 10 regional travel-season estimates. <a href="https://www.australia.com/en/facts-and-planning/when-to-go/australias-seasons.html" target="_blank" rel="noopener">About the seasons ↗</a></p>','html.parser'))
s.select_one('.world-help').string='Drag to pan · View & style for angles and motion'
p.write_text(str(s))
# The second world is a separate edition, sharing all travel copy and the existing guides.
c=BeautifulSoup(str(s),'html.parser');c.title.string='Cartoon world | When to go'
for tag in c.select('[src],[href]'):
 for attr in ['src','href']:
  val=tag.get(attr)
  if val and not val.startswith(('/', '#','http','data:')):tag[attr]='../play/'+val
for script in c.select('script'):
 if script.get('type')=='importmap':script.string=script.string.replace('./vendor/','../play/vendor/')
 if script.string and 'window.GAME_META=' in script.string:script.string='window.GAME_META={root:"../play/",slug:"",rounded:true};'
for a in c.select('.edition-links a'):
 a.attrs.pop('aria-current',None)
 if a['href']=='/cartoon/':a['aria-current']='page'
c.select_one('#world-scene')['aria-label']='Interactive rounded cartoon world map'
out=r/'cartoon';out.mkdir(exist_ok=True);(out/'index.html').write_text(str(c))
v=r/'versions/index.html';doc=BeautifulSoup(v.read_text(),'html.parser');doc.select_one('.version-library section').insert_after(BeautifulSoup('<section><h2>Rounded cartoon world</h2><p>A softer 3D game world, with the same month colours and country guides.</p><a class="button primary" href="../cartoon/">Open cartoon map</a></section>','html.parser'));v.write_text(str(doc))
print('Built both world editions.')
