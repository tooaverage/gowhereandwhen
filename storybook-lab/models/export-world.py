import bpy,gzip,json,math
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parents[3]/'outputs/style-studies'
OUT=HERE.parent.parent/'gowhereandwhen/storybook-lab/assets'
bpy.ops.wm.open_mainfile(filepath=str(HERE/'map-japan-storybook.blend'))
scene=bpy.context.scene
# Procedural Blender colour nodes are not portable to glTF. Keep their authored base colour.
for material in bpy.data.materials:
 if not material.use_nodes:continue
 principled=material.node_tree.nodes.get('Principled BSDF')
 if not principled:continue
 base=principled.inputs['Base Color']
 if base.is_linked:
  for link in list(base.links):material.node_tree.links.remove(link)
  base.default_value=material.diffuse_color
 for link in list(principled.inputs['Normal'].links):material.node_tree.links.remove(link)

countries=[o for o in scene.objects if o.get('role')=='country']
# Vancouver is a low waterfront, not a steep tabletop cliff under Canada Place.
for coast in countries:
 if int(coast.get('iso',0))!=124:continue
 for v in coast.data.vertices:
  d=math.hypot(v.co.x+123.111,v.co.y-49.288)
  if d<1.8 and v.co.z>-.5:
   weight=min(1,max(0,(1.8-d)/.75))
   v.co.z=-.5+(v.co.z+.5)*(1-.93*weight)
 coast.data.update()

# Remove baked outlines. Only shared land edges are drawn by the runtime.
for o in list(scene.objects):
 if o.name.startswith('Outline '):bpy.data.objects.remove(o,do_unlink=True)
from collections import defaultdict
edges=defaultdict(list)
for o in countries:
 for p in o.data.polygons:
  if len(p.vertices)!=4:continue
  a=o.data.vertices[p.vertices[0]].co;b=o.data.vertices[p.vertices[-1]].co
  if (a-b).length<.001:continue
  key=tuple(sorted(((round(a.x,4),round(a.y,4)),(round(b.x,4),round(b.y,4)))))
  edges[key].append((int(o['iso']),a.copy(),b.copy()))
borders={};shared=0
for matches in edges.values():
 if len({m[0] for m in matches})<2:continue
 iso,a,b=matches[0];shared+=1
 # Use a single line per shared edge, exactly on its mesh vertices.
 borders.setdefault(str(iso),[]).extend([[round(a.x,5),round(a.z+.025,5),round(-a.y,5)],[round(b.x,5),round(b.z+.025,5),round(-b.y,5)]])
(OUT/'borders.json').write_text(json.dumps(borders,separators=(',',':')))
print('Shared inland boundary segments:',shared,flush=True)
# Landmarks receive individual clear footprints before scenery is merged.
reserves=[(-122.4783,37.8199,1.6),(-116.18,51.42,2.2),(-79.387,43.643,.7),(-71.205,46.812,1.0),(-63.918,44.491,.9),(-123.111,49.288,1.2),(135.77,35.01,.55),(134.95,35.4,.30),(-72.545,-13.164,1.65),(35.444,30.329,1.05),(78.042,27.175,1.25),(116.57,40.43,1.9),(103.867,13.413,1.45),(31.134,29.979,1.35),(12.492,41.89,.7),(34.83,-2.33,1.0),(-112.14,36.06,1.6),(35.05,-1.48,.6),(34.99,-3.04,.5)]
for o in list(scene.objects):
 if o.hide_render or not o.name.startswith(('japan.','house.','tower.','cedar.','broadleaf.','palm.')):continue
 p=o.location
 if any(math.hypot(p.x-x,p.y-y)<r+.4 for x,y,r in reserves):bpy.data.objects.remove(o,do_unlink=True)
# Reserve the full alpine footprint so towns and trees cannot intersect the peaks.
def bounds_xy(o):
 pts=[o.matrix_world@Vector(v) for v in o.bound_box]
 return min(v.x for v in pts),min(v.y for v in pts),max(v.x for v in pts),max(v.y for v in pts)
peaks=[bounds_xy(o) for o in scene.objects if o.name.startswith('Japan alpine summit')]
removed=[]
japan=next(o for o in countries if o.get('iso')==392)
relocated=[]
flower_sites=[(140.5,40.5),(142.0,42.8),(130.8,33.2)]
for o in list(scene.objects):
 if o.hide_render or not o.name.startswith(('japan.','house.','tower.','cherry.','cedar.','broadleaf.','palm.')):continue
 a=bounds_xy(o)
 if any(a[0]<b[2]+.1 and a[2]>b[0]-.1 and a[1]<b[3]+.1 and a[3]>b[1]-.1 for b in peaks):
  if o.name.startswith('cherry.'):
   moved=False
   for x,y in list(flower_sites):
    hit,loc,normal,index=japan.ray_cast(Vector((x,y,40)),Vector((0,0,-1)))
    if not hit:continue
    o.location=(x,y,loc.z-.65*o.scale.z);flower_sites.remove((x,y));relocated.append(o.name);moved=True;break
   if moved:continue
  removed.append(o.name);bpy.data.objects.remove(o,do_unlink=True)
print('Cleared mountain footprints:',removed,'Relocated blossoms:',relocated,flush=True)
canada_script=OUT.parent/'models/add-canada-world.py'
exec(compile(canada_script.read_text(),str(canada_script),'exec'),{'__file__':str(canada_script)})
visible=[o for o in scene.objects if o.type=='MESH' and not o.hide_render]
for o in visible:
 if o.animation_data:o.animation_data_clear()
 if o.name.startswith('cherry.'):
  o['role']='blossom';o['iso']=392;o['months']=[3,4]
 if o.name=='World ocean':o['role']='ocean'
# Move every part of a ship or plane together using a shared parent.
boats=[(-40,30),(-140,15),(70,-10),(150,10),(-20,-25),(90,-40)]
planes=[(-35,2),(80,-27),(-130,34),(145,31)]
roots={}
for kind,anchors,prefixes in [('boat',boats,('Ship hull','Cargo','Bridge cabin')),('airplane',planes,('Airplane','Regional airplane','Regional wings','Regional tail'))]:
 for o in visible:
  if not o.name.startswith(prefixes):continue
  center=sum((o.matrix_world@Vector(p) for p in o.bound_box),Vector())/8
  anchor=min(anchors,key=lambda a:math.hypot(center.x-a[0],center.y-a[1]));key=(kind,anchor)
  if key not in roots:
   parent=bpy.data.objects.new(kind+' motion',None);scene.collection.objects.link(parent);parent['role']=kind;parent.location=(anchor[0],anchor[1],0);roots[key]=parent;bpy.context.view_layer.update()
  o.parent=roots[key];o.matrix_parent_inverse=o.parent.matrix_world.inverted();o['role']='transport_part'
static=[o for o in visible if o.get('role') not in ['country','blossom','transport_part','ocean']]
bpy.ops.object.select_all(action='DESELECT')
for o in static:o.select_set(True)
bpy.context.view_layer.objects.active=static[0];bpy.ops.object.convert(target='MESH');bpy.ops.object.join();bpy.context.object.name='Storybook scenery';bpy.context.object['role']='scenery'
bpy.ops.object.select_all(action='DESELECT')
for o in scene.objects:
 if (o.type=='MESH' and not o.hide_render) or o in roots.values():o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'storybook-v1.glb'),export_format='GLB',use_selection=True,export_extras=True,export_animations=False)
raw=(OUT/'storybook-v1.glb').read_bytes();(OUT/'storybook-v1.glb.gz').write_bytes(gzip.compress(raw,9));(OUT/'storybook-v1.glb').unlink()
print('STORYBOOK EXPORTED',len(countries),'countries',len(roots),'transport groups',len(raw),'bytes',flush=True)

# Keep continuous inland boundaries in sync after every world export.
border_script=OUT.parent/"models/export-borders.py"
if border_script.exists():exec(compile(border_script.read_text(),str(border_script),"exec"),{"__file__":str(border_script)})
