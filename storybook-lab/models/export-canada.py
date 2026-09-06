"""Soften the approved Vancouver composition for the interactive Canada cover."""
import bpy, math, gzip
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT.parent/'outputs/vancouver/vancouver-white-background.blend'
OUT=ROOT/'storybook-lab/assets'
bpy.ops.wm.open_mainfile(filepath=str(SOURCE))
scene=bpy.context.scene
for o in list(scene.objects):
 if o.type in ['CAMERA','LIGHT'] or 'background' in o.name.lower():bpy.data.objects.remove(o,do_unlink=True)
# Replace pointed roof-like sails with continuous, softly curved fabric surfaces.
snow=bpy.data.materials.new('Storybook sail ivory');snow.use_nodes=True
snow.diffuse_color=(.96,.95,.86,1)
snow.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.96,.95,.86,1)
for o in list(scene.objects):
 if o.name.startswith('Canada Place sail'):bpy.data.objects.remove(o,do_unlink=True)
for i in range(5):
 x=.67+i*.76;n=16;verts=[];faces=[]
 for u in range(n+1):
  for v in range(n+1):
   xx=(u/n-.5)*.72;yy=(v/n-.5)*.96
   z=1.23+.77*max(0,1-abs(xx)/.36)**.72*max(0,1-abs(yy)/.48)**.42
   verts.append((x+xx,-.33+yy,z))
 for u in range(n):
  for v in range(n):
   a=u*(n+1)+v;b=a+n+1;faces.append((a,b,b+1,a+1))
 mesh=bpy.data.meshes.new('Curved sail');mesh.from_pydata(verts,[],faces);mesh.update()
 o=bpy.data.objects.new('Canada Place fabric sail '+str(i+1),mesh);scene.collection.objects.link(o)
 if snow:o.data.materials.append(snow)
 for p in mesh.polygons:p.use_smooth=True
# Rounded edges and gentle shading, with the original connected snow surfaces.
for o in list(scene.objects):
 if o.type!='MESH':continue
 bpy.context.view_layer.objects.active=o;o.select_set(True)
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 for modifier in list(o.modifiers):bpy.ops.object.modifier_apply(modifier=modifier.name)
 if any(k in o.name for k in ['peak','ridge']):
  for p in o.data.polygons:p.use_smooth=True
 elif 'fabric sail' not in o.name:
  bevel=o.modifiers.new('Soft Storybook edges','BEVEL');bevel.width=.075 if ('land' in o.name.lower() or 'Stanley Park' in o.name) else .035;bevel.segments=3;bevel.limit_method='ANGLE'
  bevel.angle_limit=.4
  for p in o.data.polygons:p.use_smooth=True
  normals=o.modifiers.new('Preserve broad faces','WEIGHTED_NORMAL');normals.keep_sharp=True;normals.weight=50
 o.select_set(False)
for m in bpy.data.materials:
 if not m.use_nodes:continue
 p=m.node_tree.nodes.get('Principled BSDF')
 if not p:continue
 p.inputs['Roughness'].default_value=.83
 if p.inputs['Base Color'].is_linked:
  for link in list(p.inputs['Base Color'].links):m.node_tree.links.remove(link)
  p.inputs['Base Color'].default_value=m.diffuse_color
# Merge the static diorama so it stays inexpensive to draw on phones.
bpy.ops.object.select_all(action='DESELECT')
meshes=[o for o in scene.objects if o.type=='MESH' and not o.hide_render]
for o in meshes:o.select_set(True)
bpy.context.view_layer.objects.active=meshes[0];bpy.ops.object.convert(target='MESH');bpy.ops.object.join();bpy.context.object.name='Canada Storybook harbour'
bpy.ops.export_scene.gltf(filepath=str(OUT/'canada-storybook.glb'),export_format='GLB',use_selection=True,export_extras=True,export_animations=False)
raw=(OUT/'canada-storybook.glb').read_bytes();(OUT/'canada-storybook.glb.gz').write_bytes(gzip.compress(raw,9));(OUT/'canada-storybook.glb').unlink()
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT.parent/'outputs/vancouver/canada-storybook.blend'))
print('CANADA STORYBOOK',len(raw),'bytes',flush=True)
