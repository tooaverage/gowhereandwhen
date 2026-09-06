"""Trace shared Natural Earth arcs continuously, omitting every coastline."""
import bpy,json,math
from pathlib import Path
from collections import defaultdict
from mathutils import Vector
from mathutils.bvhtree import BVHTree
ROOT=Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(ROOT.parent/'outputs/style-studies/map-japan-storybook.blend'))
geo=json.loads((ROOT/'play/vendor/world.json').read_text());tr=geo['transform'];arcs=[]
for a in geo['arcs']:
 x=y=0;pts=[]
 for dx,dy in a:
  x+=dx;y+=dy;pts.append((x*tr['scale'][0]+tr['translate'][0],y*tr['scale'][1]+tr['translate'][1]))
 arcs.append(pts)
users=defaultdict(set)
def collect(value,iso):
 if isinstance(value,int):users[value if value>=0 else ~value].add(iso)
 else:
  for v in value:collect(v,iso)
for g in geo['objects']['countries']['geometries']:collect(g.get('arcs',[]),int(g.get('id',0)))
bvhs={}
for o in bpy.context.scene.objects:
 if o.get('role')=='country':bvhs[int(o['iso'])]=BVHTree.FromPolygons([v.co for v in o.data.vertices],[list(p.vertices) for p in o.data.polygons])
out={};count=0
for index,ids in users.items():
 if len(ids)!=2 or not all(i in bvhs for i in ids):continue
 ids=sorted(ids);line=[];source=arcs[index]
 for i,(a,b) in enumerate(zip(source,source[1:])):
  steps=max(1,math.ceil(math.dist(a,b)/.12))
  for j in range(steps):line.append((a[0]+(b[0]-a[0])*j/steps,a[1]+(b[1]-a[1])*j/steps))
 line.append(source[-1]);points=[]
 for x,y in line:
  heights=[]
  for iso in ids:
   for dx,dy in [(0,0),(.025,0),(-.025,0),(0,.025),(0,-.025)]:
    hit=bvhs[iso].ray_cast(Vector((x+dx,y+dy,80)),Vector((0,0,-1)))[0]
    if hit is not None:heights.append(hit.z)
  points.append([round(x,5),round(max(heights,default=.65)+.04,5),round(-y,5)])
 target=out.setdefault('-'.join(map(str,ids)),[])
 for a,b in zip(points,points[1:]):target.extend([a,b]);count+=1
(ROOT/'storybook-lab/assets/borders.json').write_text(json.dumps(out,separators=(',',':')))
print('CONTINUOUS INLAND BORDERS',len(out),'country pairs',count,'segments',flush=True)
