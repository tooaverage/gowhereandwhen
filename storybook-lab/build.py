from pathlib import Path
import shutil
r=Path(__file__).resolve().parent
out=r.parent/'storybook'
out.mkdir(exist_ok=True)
for name in ['index.html','app.js','map.js','game.css','world-details.js']:
 shutil.copy2(r/name,out/name)
shutil.copytree(r/'assets',out/'assets',dirs_exist_ok=True)
print('Built separate Storybook edition.')

# The existing Japan guide keeps its content, with independent Storybook rendering.
page=(r.parent/'play/country/japan/index.html').read_text()
page=page.replace('../../game.css?v=world7final','../../game.css?v=storybook6').replace('../../app.js?v=world7final','../../app.js?v=storybook6')
page=page.replace('./../../vendor/three.module.js','../../../play/vendor/three.module.js').replace('../../vendor/delaunator.min.js','../../../play/vendor/delaunator.min.js').replace('../../styles/affiliates.js','../../../play/styles/affiliates.js').replace('../../favicon.svg','../../../play/favicon.svg')
page=page.replace('root:"../../",slug:"japan"','root:"../../../play/",slug:"japan",storybook:true,rounded:true')
page=page.replace('Japan | When to go Explorer','Japan | Soft Storybook').replace('When to go</a>','When to go <span class="storybook-badge">Storybook</span></a>')
import re
page=re.sub(r'href="../(?!japan/)([a-z-]+)/',r'href="../../../play/country/\1/',page)
page=page.replace('../../country/philippines/','../../../play/country/philippines/')
page=page.replace('Explore an illustrative low-poly landscape of Japan','Explore a soft Storybook landscape of Japan')
target=out/'country/japan';target.mkdir(parents=True,exist_ok=True);(target/'index.html').write_text(page)
