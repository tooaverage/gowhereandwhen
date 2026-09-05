from pathlib import Path
import shutil
r=Path(__file__).resolve().parent
out=r.parent/'storybook'
out.mkdir(exist_ok=True)
for name in ['index.html','app.js','map.js','game.css']:
 shutil.copy2(r/name,out/name)
shutil.copytree(r/'assets',out/'assets',dirs_exist_ok=True)
print('Built separate Storybook edition.')
