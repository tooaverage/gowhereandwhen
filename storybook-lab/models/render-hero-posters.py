"""Render lightweight first-paint previews from the actual interactive models."""
import bpy,gzip,math
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'storybook-lab/assets'
for country in ['canada','japan']:
 bpy.ops.wm.read_factory_settings(use_empty=True);sc=bpy.context.scene
 path=Path('/tmp')/(country+'-poster.glb');path.write_bytes(gzip.decompress((OUT/(country+'-storybook.glb.gz')).read_bytes()))
 bpy.ops.import_scene.gltf(filepath=str(path));path.unlink()
 if country=='japan':
  for o in list(sc.objects):
   if 'ocean' in o.name.lower():bpy.data.objects.remove(o,do_unlink=True)
 bpy.ops.object.camera_add(location=(23,-27,21));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='PERSP';cam.data.lens=38;sc.camera=cam
 world=bpy.data.worlds.new('Daylight');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.7,.8,.85,1);world.node_tree.nodes['Background'].inputs[1].default_value=.7;sc.world=world
 bpy.ops.object.light_add(type='AREA',location=(-18,-18,36));bpy.context.object.data.energy=4200;bpy.context.object.data.size=9
 bpy.ops.object.light_add(type='SUN');bpy.context.object.rotation_euler=(.5,-.5,-.5);bpy.context.object.data.energy=1.5;bpy.context.object.data.angle=.15
 sc.render.engine='CYCLES';sc.cycles.samples=20;sc.cycles.use_denoising=True;sc.render.resolution_x=1280;sc.render.resolution_y=1000;sc.render.resolution_percentage=100;sc.render.film_transparent=True;sc.render.image_settings.file_format='WEBP';sc.render.image_settings.color_mode='RGBA';sc.render.image_settings.quality=82;sc.view_settings.view_transform='AgX';sc.view_settings.exposure=.4
 sc.render.filepath=str(OUT/(country+'-hero.webp'));bpy.ops.render.render(write_still=True)
 print('POSTER',country,flush=True)
