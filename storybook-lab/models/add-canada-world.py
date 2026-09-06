"""Add handcrafted Canadian mountain, cedar and cottage groups to the world mesh."""
import ast,random,math,bpy
from mathutils import Vector
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
source=(ROOT/'storybook-lab/models/export-canada.py').read_text()
sc=bpy.context.scene;REAL=WOOD=INK=False
# Reuse the actual detail cover's geometry and colours, without rebuilding the scene.
for node in ast.parse(source).body:
 if isinstance(node,ast.FunctionDef) and node.name in ['color','mat','mesh','cube','sphere','rod','line','mountain','fir','cabin']:
  exec(compile(ast.Module(body=[node],type_ignores=[]),str(__file__),'exec'))
M={k:mat('Canada '+k,v) for k,v in {'grass':'83ad6a','hill':'698d68','rock':'879482','snow':'f3f3e8','soil':'d2c5a0','water':'54bcc3','wood':'795f49','wall':'f5ead4','roof':'385d60','fir':'396b57','cedar':'b57d55','glass':'567c83'}.items()}
coast=next(o for o in sc.objects if o.get('role')=='country' and int(o.get('iso',0))==124)
def ground(x,y):
 hit,loc,normal,index=coast.ray_cast(Vector((x,y,40)),Vector((0,0,-1)))
 return loc.z if hit else None
# Stable regional groups keep landmarks, cities and international borders clear.
peaks=[(-124.5,51.3,.72,1.7),(-126.2,53.1,.9,2.0),(-127.1,54.2,.67,1.5),(-120.5,53.7,.85,1.9),(-121.7,55.1,.95,2.2),(-123.3,56.6,.75,1.75),(-128.5,59.4,1.1,2.3),(-132.3,61.2,.8,2.0),(-138.7,60.7,.8,2.2),(-73.5,69.8,.65,1.5),(-117.055,52.02,1.1375,2.45),(-115.4175,52.1575,.9875,2.01),(-117.6675,51.545,.6125,1.3)]
reserves=[(-123.111,49.288,1.6),(-116.18,51.42,2.7),(-79.387,43.643,1.1),(-71.205,46.812,1.4),(-63.918,44.491,1.25)]
# Clear generic pieces only inside the authored groups.
clear=[(x,y,r+1.0) for x,y,r,h in peaks]+[(-125,50.5,2),(-122,52,2),(-80,47.5,1.6),(-68,48.8,1.5)]
for o in list(sc.objects):
 if not o.name.startswith(('house.','tower.','cedar.','broadleaf.','palm.')):continue
 x,y=o.location.x,o.location.y
 if ground(x,y) is not None:bpy.data.objects.remove(o,do_unlink=True)
for i,(x,y,r,h) in enumerate(peaks):
 z=ground(x,y)
 if z is None:continue
 o=mountain('Canada sculpted alpine ridge '+str(i),x,y,r,h,'rock' if i%2==0 else 'hill',True);o.location.z=z-.62
# Cedar groves arranged around the ridges, never on their slopes or buildings.
random.seed(124)
plantings=[]
for x,y,r,h in peaks[:9]:
 for a in [0.2,1.8,3.5,5.2]:plantings.append((x+math.cos(a)*(r+.35),y+math.sin(a)*(r+.35),.55+random.random()*.25))
for x,y in [(-125.3,50.1),(-122.1,52.1),(-118,55),(-109,56),(-94,51),(-83,48.5),(-78,49),(-68,49.3),(-65,46.2),(-116,58.5),(-108,59.4),(-103,54.4),(-96,54),(-91,49.5),(-86,51),(-76,52),(-72,53.5),(-67,53),(-62,53.8),(-57,50.1),(-134,64)]:
 for dx,dy in [(-.38,0),(.15,.3),(.38,-.28)]:plantings.append((x+dx,y+dy,.58+random.random()*.22))
for x,y,h in plantings:
 z=ground(x,y)
 if z is None or any(math.hypot(x-a,y-b)<r+.15 for a,b,r,hh in peaks) or any(math.hypot(x-a,y-b)<r for a,b,r in reserves):continue
 fir(x,y,h)
# Little cedar lodges give regional scale without a skyline in small towns.
for x,y in [(-125,50.55),(-122,52.5),(-80.2,47.5),(-68.3,48.5)]:
 z=ground(x,y)
 if z is None:continue
 before=set(sc.objects);cabin(0,0,.26)
 for o in set(sc.objects)-before:o.location+=Vector((x,y,z-.65))
print('Canadian Storybook scenery added',flush=True)
