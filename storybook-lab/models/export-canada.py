import bpy, math, random, sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'storybook-lab/assets'
STYLE=sys.argv[-1] if sys.argv[-1] in ['storybook','illustrated','realistic','miniature'] else 'storybook'
random.seed(57)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc=bpy.context.scene
REAL=STYLE=='realistic'; WOOD=STYLE=='miniature'; INK=STYLE=='illustrated'
def color(h):
 c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
 return tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in c)+(1,)
def mat(name,h,rough=.72,noise=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=color(h)
 n=m.node_tree.nodes;l=m.node_tree.links;p=n.get('Principled BSDF');p.inputs['Base Color'].default_value=color(h);p.inputs['Roughness'].default_value=rough
 if noise or (REAL and name not in ['water','glass']) or WOOD:
  tex=n.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=5 if WOOD else 13;tex.inputs['Detail'].default_value=3
  bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.16 if REAL else .07;bump.inputs['Distance'].default_value=.075;l.new(tex.outputs['Fac'],bump.inputs['Height']);l.new(bump.outputs['Normal'],p.inputs['Normal'])
  ramp=n.new('ShaderNodeValToRGB');c=color(h);ramp.color_ramp.elements[0].color=tuple(v*.65 for v in c[:3])+(1,);ramp.color_ramp.elements[1].color=tuple(min(1,v*1.15) for v in c[:3])+(1,);l.new(tex.outputs['Fac'],ramp.inputs[0]);l.new(ramp.outputs[0],p.inputs['Base Color'])
  if WOOD:
   wave=n.new('ShaderNodeTexWave');wave.wave_type='BANDS';wave.bands_direction='X';wave.inputs['Scale'].default_value=16;wave.inputs['Distortion'].default_value=7;l.new(wave.outputs['Color'],bump.inputs['Height'])
 if INK:
  diffuse=n.new('ShaderNodeBsdfDiffuse');diffuse.inputs['Color'].default_value=color(h)
  rgb=n.new('ShaderNodeShaderToRGB');l.new(diffuse.outputs[0],rgb.inputs[0]);r=n.new('ShaderNodeValToRGB');r.color_ramp.interpolation='CONSTANT';c=color(h)
  r.color_ramp.elements[0].position=.17;r.color_ramp.elements[0].color=tuple(v*.56 for v in c[:3])+(1,)
  r.color_ramp.elements[1].position=.52;r.color_ramp.elements[1].color=c
  e=r.color_ramp.elements.new(.8);e.color=tuple(min(1,v*1.23) for v in c[:3])+(1,)
  l.new(rgb.outputs[0],r.inputs[0]);l.new(r.outputs[0],n.get('Material Output').inputs['Surface'])
 return m
palette={'grass':'83ad6a','hill':'698d68','rock':'879482','snow':'f3f3e8','soil':'d2c5a0','water':'54bcc3','wood':'795f49','wall':'f5ead4','roof':'385d60','pink':'f4b6bf','pink2':'eb9faa','fir':'396b57','leaf':'7eaa64','path':'ded3a9','red':'b65c42','glass':'567c83','foam':'b7e3db'}
if INK: palette.update(grass='b6cd95',hill='87a591',rock='729398',water='80c9d1',roof='365c73',pink='f3b5b8',pink2='e8979f',wood='9a6551')
if REAL: palette.update(grass='697e46',hill='5c735a',rock='707c78',water='46868a',pink='d9a6b0',pink2='b98697')
if WOOD: palette.update(grass='9db980',hill='74937b',soil='c79c69',water='70b6c1',wood='b18154',roof='47777e',pink='e2a4af',pink2='cf909c')
M={k:mat(k,v,.23 if (WOOD or k=='water') else .78,1 if k in ['grass','rock'] else 0) for k,v in palette.items()}
if REAL:
 p=M['water'].node_tree.nodes.get('Principled BSDF');p.inputs['Metallic'].default_value=.25;p.inputs['Roughness'].default_value=.18

def mesh(name,vs,fs,m,smooth=False):
 d=bpy.data.meshes.new(name);d.from_pydata(vs,[],fs);d.update();o=bpy.data.objects.new(name,d);sc.collection.objects.link(o);d.materials.append(M[m] if isinstance(m,str) else m)
 if smooth:
  for p in d.polygons:p.use_smooth=True
 return o

def cube(name,loc,size,m,bev=.07):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(M[m])
 if bev and not INK:
  b=o.modifiers.new('Rounded crafted edges','BEVEL');b.width=bev;b.segments=3
  o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL')
 return o

def sphere(name,loc,size,m):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=16 if not REAL else 24,ring_count=10,location=loc);o=bpy.context.object;o.name=name;o.scale=size;o.data.materials.append(M[m]);
 for p in o.data.polygons:p.use_smooth=True
 if REAL and name=='Blossom cloud':
  tex=bpy.data.textures.get('Blossom surface') or bpy.data.textures.new('Blossom surface',type='CLOUDS');tex.noise_scale=.17
  mod=o.modifiers.new('Small blossom clusters','DISPLACE');mod.texture=tex;mod.strength=.16;mod.texture_coords='GLOBAL'
 return o

def rod(name,a,b,r,m):
 delta=Vector(b)-Vector(a);mid=(Vector(a)+Vector(b))/2;bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=r,depth=delta.length,location=mid);o=bpy.context.object;o.name=name;o.rotation_euler=delta.to_track_quat('Z','Y').to_euler();o.data.materials.append(M[m]);return o

def line(name,pts,width,m):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=width;c.bevel_resolution=3;s=c.splines.new('POLY');s.points.add(len(pts)-1)
 for p,v in zip(s.points,pts):p.co=(*v,1)
 o=bpy.data.objects.new(name,c);sc.collection.objects.link(o);c.materials.append(M[m]);return o


def mountain(name,x,y,rad,h,m,cap=False):
 rings=30 if REAL else 22;segments=72;vs=[]
 for j in range(rings+1):
  u=j/rings;rr=rad*(1-u)**.86
  for i in range(segments):
   t=i*math.tau/segments;rid=1+.035*math.sin(9*t+u*3)+.025*math.cos(15*t-u*2);z=.62+h*u
   if REAL:z+=(.14*math.sin(t*13)*math.sin(u*22)+.08*math.cos(t*27+u*45))*(1-u)
   vs.append((x+rr*rid*math.cos(t),y+rr*rid*math.sin(t),z))
 fs=[]
 for j in range(rings):
  for i in range(segments):a=j*segments+i;b=j*segments+(i+1)%segments;fs.append((a,b,b+segments,a+segments))
 o=mesh(name,vs,fs,m,True)
 if cap:
  o.data.materials.append(M['snow'])
  for p in o.data.polygons:
   z=sum(o.data.vertices[i].co.z for i in p.vertices)/len(p.vertices);a=o.data.vertices[p.vertices[0]].co;threshold=.62+h*.69+.18*math.sin(math.atan2(a.y-y,a.x-x)*8)
   if z>threshold:p.material_index=1
 return o

def carve(name,poly):
 n=len(poly);vs=[(x,y,-1) for x,y in poly]+[(x,y,1) for x,y in poly]
 cutter=mesh(name,vs,[tuple(reversed(range(n))),tuple(range(n,n*2))]+[(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)],'water')
 for target in [land,soil]:
  bpy.context.view_layer.objects.active=target;mod=target.modifiers.new('Recessed watercourse','BOOLEAN');mod.operation='DIFFERENCE';mod.object=cutter
  bpy.ops.object.modifier_apply(modifier=mod.name)
 bpy.data.objects.remove(cutter,do_unlink=True)

def fir(x,y,h=2.5):
 z=ground(x,y);rod('Cedar connected trunk',(x,y,z),(x,y,z+h*.95),.07,'wood')
 if REAL:
  vs=[];fs=[]
  for j in range(13):
   zz=z+.4+j*h*.061;r=h*.28*(1-j/14)
   for k in range(11):
    t=k*math.tau/11+j*.87
    a=(x,y,zz+.18);b=(x+math.cos(t)*r,y+math.sin(t)*r,zz-.06)
    for u in range(1,10):
     v=u/10;px=a[0]+(b[0]-a[0])*v;py=a[1]+(b[1]-a[1])*v;pz=a[2]+(b[2]-a[2])*v
     for side in [-1,1]:
      w=.13*(1-v)+.04;dx=math.cos(t+side*.9);dy=math.sin(t+side*.9);n=len(vs)
      vs.extend([(px,py,pz),(px+dx*w,py+dy*w,pz-.06),(px+.015,py+.015,pz+.015)]);fs.append((n,n+1,n+2))
  mesh('Fine evergreen branch sprays',vs,fs,'fir')
  return
 for j in range(4):
  zz=z+.48+j*h*.17;r=h*(.25-j*.046)
  bpy.ops.mesh.primitive_cone_add(vertices=32,radius1=r,radius2=.025,depth=h*.55,location=(x,y,zz+h*.22));o=bpy.context.object;o.name='Cedar layered crown';o.data.materials.append(M['fir'])
  for p in o.data.polygons:p.use_smooth=not INK
  if REAL:
   for k in range(8):
    t=k*math.tau/8;rod('Cedar branch',(x,y,zz+.25),(x+math.cos(t)*r,y+math.sin(t)*r,zz),.022,'fir')
def ground(x,y):return .65

# The same island, material palette, ridges and layered cedars as Japan's cover.
N=112
rim=[]
for i in range(N):
 t=i*math.tau/N;r=1+.035*math.sin(5*t)+.025*math.cos(7*t);rim.append((11.6*r*math.cos(t),8.4*r*math.sin(t)))
# Clean green shores match the raised island edge used on Japan's cover.
vs=[(x,y,.62) for x,y in rim]+[(x,y,-.48) for x,y in rim]
fs=[tuple(range(N)),tuple(reversed(range(N,N*2)))]+[(i,N+i,N+(i+1)%N,(i+1)%N) for i in range(N)]
land=mesh('Two green harbour shores',vs,fs,'grass')
vs=[(x,y,-.49) for x,y in rim]+[(x,y,-.58) for x,y in rim]
soil=mesh('Solid coastal foundation',vs,[tuple(range(N)),tuple(reversed(range(N,N*2)))]+[(i,(i+1)%N,N+(i+1)%N,N+i) for i in range(N)],'soil')
# An uninterrupted harbour separates the front city island from the rear mountain island.
bay=[(-14,-.15),(-8,-.05),(-3,.05),(2,.05),(7,-.15),(14,-.2),(14,3.15),(7,3.35),(2,3.3),(-3,3.1),(-8,3.0),(-14,3.2)]
carve('Harbour inlet',bay)
# The ocean stage itself fills the cutout, so water has one continuous level and outline.
bpy.ops.mesh.primitive_cylinder_add(vertices=128,radius=1,depth=.16,location=(0,0,-.68));o=bpy.context.object;o.name='Turquoise ocean stage';o.scale=(13,9.9,1);o.data.materials.append(M['water'])
# Distinct peaks rather than rounded green domes. Snow is part of each mesh.
mountain('North Shore central summit',-2,5.8,2.4,6.7,'rock',True)
mountain('Lions western summit',-6.15,5.5,2.1,4.3,'hill',True)
mountain('Eastern forested shoulder',6.5,5.5,2.1,3.65,'hill',True)
# Cedar homes form a small waterfront neighbourhood, with visible roof boards.
M['cedar']=mat('Warm coastal cedar','b57d55')
M['cityglass']=mat('Soft sea glass','609fa0')
M['orca']=mat('Orca charcoal','263e47')
def cabin(x,y,s=1):
 z=.65;cube('Cottage foundation',(x,y,z+.08),(1.55*s,1.25*s,.16),'rock')
 cube('Cedar cottage',(x,y,z+.58*s),(1.4*s,1.1*s,1.1*s),'cedar')
 v=[(x-.88*s,y-.72*s,z+1.1*s),(x+.88*s,y-.72*s,z+1.1*s),(x,y-.72*s,z+1.7*s),(x-.88*s,y+.72*s,z+1.1*s),(x+.88*s,y+.72*s,z+1.1*s),(x,y+.72*s,z+1.7*s)]
 roof=mesh('Gabled slate roof',v,[(0,3,5,2),(2,5,4,1),(0,2,1),(3,4,5)],'roof');bevel=roof.modifiers.new('Gentle eaves','BEVEL');bevel.width=.025;bevel.segments=2
 for j in range(7):
  yy=y-.7*s+j*.233*s
  for side in [-1,1]:rod('Fine roof seam',(x,yy,z+1.72*s),(x+side*.88*s,yy,z+1.12*s),.012,'roof')
 cube('Recessed front door',(x,y-.561*s,z+.38*s),(.32*s,.03,.75*s),'wood',.012)
 for dx in [-.46,.46]:
  cube('Cream window frame',(x+dx*s,y-.57*s,z+.65*s),(.34*s,.04,.43*s),'wall',.02)
  cube('Window glass',(x+dx*s,y-.6*s,z+.65*s),(.25*s,.03,.34*s),'glass',.01)
 cube('Porch step',(x,y-.78*s,z+.02),(.62*s,.4*s,.14),'rock',.03)
for x,y,s in [(3.4,-4.7,.83),(5.4,-4.4,.78),(6.9,-3.2,.8),(4.3,-6.1,.72)]:cabin(x,y,s)
def flat_road(name,points,width=.4):
 vs=[]
 for i,p in enumerate(points):
  before=Vector(points[max(0,i-1)]);after=Vector(points[min(len(points)-1,i+1)]);d=after-before;normal=Vector((-d.y,d.x,0)).normalized()*width/2
  for sign in [-1,1]:vs.append(tuple(Vector(p)+normal*sign))
 mesh(name,vs,[(2*i,2*i+2,2*i+3,2*i+1) for i in range(len(points)-1)],'path')
flat_road('Flat city waterfront road',[(-7.8,-.65,.645),(-7.5,-2,.645),(-5,-3.9,.645),(-2.5,-4.5,.645),(0,-4.6,.645),(1.5,-4,.645),(3,-3.6,.645),(5.3,-3.4,.645)],.35)
flat_road('Forest shore path',[(-7.8,3.65,.645),(-8.5,4.2,.645),(-8.8,5.1,.645)],.28)
# Compact Vancouver towers with stepped roofs and restrained glazing.
for x,y,w,d,h in [(-2.1,-1.5,.85,.8,2.8),(-.65,-1.25,.95,.85,3.65),(.6,-1.4,.78,.72,2.45),(-1.55,-3.25,.95,.75,2.1),(.05,-3.15,.8,.72,2.85)]:
 cube('Sea glass tower',(x,y,.66+h/2),(w,d,h),'cityglass',.055)
 cube('Light stone podium',(x,y,.78),(w+.2,d+.15,.25),'wall',.035)
 for j in range(1,int(h/.35)):
  z=.65+j*.35;cube('Tower floor ledge',(x,y,z),(w+.025,d+.025,.035),'wall',.008)
 for xx in [-w*.29,w*.29]:cube('Slender facade mullion',(x+xx,y-d/2-.014,.66+h/2),(.025,.025,h-.12),'wall',.005)
 cube('Set back rooftop',(x,y,.66+h+.12),(w*.67,d*.7,.24),'roof',.025)
# Individually detailed Canada Place: five curved tensile sails, masts and glass pavilion.
place_before=set(sc.objects)
cube('Canada Place stone quay',(0,0,.48),(3.45,1.4,.33),'rock',.045)
cube('Canada Place promenade',(0,0,.68),(3.5,1.45,.1),'path',.025)
cube('Canada Place glazed hall',(0,0,.99),(3.1,1.06,.55),'glass',.03)
cube('Canada Place roof fascia',(0,0,1.28),(3.28,1.17,.10),'wall',.025)
for side in [-1,1]:
 for j in range(19):
  x=-1.49+j*2.98/18
  cube('Pavilion window mullion',(x,side*.546,.99),(.027,.025,.48),'wall',.004)
 rod('Pavilion glazing transom',(-1.52,side*.55,1.05),(1.52,side*.55,1.05),.018,'wall')
 for j in range(15):
  x=-1.62+j*3.24/14;rod('Promenade baluster',(x,side*.68,.73),(x,side*.68,.91),.012,'wall')
 rod('Continuous promenade handrail',(-1.65,side*.68,.92),(1.65,side*.68,.92),.014,'wall')
for j in range(5):
 x=(j-2)*.63;w=.66;depth=1.2;height=.86+(2-abs(j-2))*.06;n=18;vs=[];fs=[]
 def sail(u,v):
  # Rounded tensile curvature with thin fabric, rather than a solid pyramid roof.
  xx=(u-.5)*w;yy=(v-.5)*depth
  zz=1.34+height*max(0,1-abs(xx)/(w/2))**.65*max(0,1-abs(yy)/(depth/2))**.48
  return (x+xx,yy,zz)
 for u in range(n+1):
  for v in range(n+1):vs.append(sail(u/n,v/n))
 for u in range(n):
  for v in range(n):a=u*(n+1)+v;b=a+n+1;fs.append((a,b,b+1,a+1))
 canopy=mesh('Tensioned sail '+str(j+1),vs,fs,'snow',True);mod=canopy.modifiers.new('Thin fabric edge','SOLIDIFY');mod.thickness=.014
 rod('Sail mast',(x,0,1.28),(x,0,1.34+height+.10),.02,'wall')
 for v in [.15,.5,.85]:line('Sail fabric seam',[sail(u/18,v) for u in range(19)],.006,'snow')
 for side in [-1,1]:
  rod('Sail rigging',(x,0,1.34+height+.08),(x+side*w*.49,side*depth*.49,1.34),.008,'wall')
# Stepped entrance and two understated doors.
for k in range(3):cube('Pavilion entrance step',(-1.8-k*.08,0,.68-k*.06),(.18,.65,.12),'rock',.015)
for y in [-.15,.15]:cube('Pavilion entrance glazing',(-1.567,y,.95),(.025,.25,.38),'cityglass',.012)
from mathutils import Matrix
pavilion_transform=Matrix.Translation(Vector((2.8,-.85,0)))
for o in set(sc.objects)-place_before:o.matrix_world=pavilion_transform @ o.matrix_world
# A level Lions Gate bridge joins the city and forest shores. Mountains sit behind the shore.
M['bridge']=mat('Lions Gate painted green steel','397d6d')
M['road']=mat('Bridge asphalt','596769')
start=Vector((-7.8,-.65,.77));end=Vector((-7.8,3.65,.77));delta=end-start
angle=math.atan2(delta.y,delta.x);side=Vector((-math.sin(angle),math.cos(angle),0))
def bridgepoint(t):return start+delta*t
# A thin roadway, pale sidewalks and a visible stiffening truss below the deck.
o=cube('Lions Gate continuous road deck',(start+end)/2,(delta.length,.76,.11),'road',.018);o.rotation_euler.z=angle
for sign in [-1,1]:
 p=(start+end)/2+side*.44*sign;o=cube('Raised bridge footway',p,(delta.length,.11,.08),'path',.012);o.rotation_euler.z=angle
 for i in range(18):
  a=bridgepoint(i/18)+side*.47*sign;b=bridgepoint((i+1)/18)+side*.47*sign
  rod('Deck edge beam',a-Vector((0,0,.16)),b-Vector((0,0,.16)),.035,'bridge')
  rod('Diagonal deck truss',a-Vector((0,0,.16)),b+Vector((0,0,.01)),.016,'bridge')
  rod('Safety railing post',a,a+Vector((0,0,.19)),.014,'bridge')
 rod('Bridge safety rail',start+side*.47*sign+Vector((0,0,.2)),end+side*.47*sign+Vector((0,0,.2)),.018,'bridge')
for i in range(12):
 p=bridgepoint((i+.5)/12)+Vector((0,0,.061));o=cube('Road centre dash',p,(.15,.018,.005),'wall',0);o.rotation_euler.z=angle
# Open portal towers with tapered legs, crossbeams and diagonal steel bracing.
for t in [.15,.85]:
 p=bridgepoint(t)
 for sign in [-1,1]:
  foot=p+side*.58*sign-Vector((0,0,.22));top=p+side*.47*sign+Vector((0,0,2.12))
  rod('Tapered tower leg',foot,top,.07,'bridge');cube('Tower concrete footing',foot-Vector((0,0,.04)),(.25,.25,.18),'rock',.025)
 for h in [.64,1.38,2.05]:
  spread=.58-.11*(h/2.12);rod('Portal crossbeam',p-side*spread+Vector((0,0,h)),p+side*spread+Vector((0,0,h)),.045,'bridge')
 for low,high in [(.70,1.33),(1.43,2.00)]:
  for sign in [-1,1]:rod('Tower diagonal cross bracing',p+side*.5*sign+Vector((0,0,low)),p-side*.48*sign+Vector((0,0,high)),.023,'bridge')
# Main cables pass over both towers and sag between them, with anchored end spans.
for sign in [-1,1]:
 pts=[]
 for i in range(49):
  t=i/48
  if t<.15:h=.32+(2.12-.32)*(t/.15)
  elif t>.85:h=.32+(2.12-.32)*((1-t)/.15)
  else:h=.68+1.44*((t-.5)/.35)**2
  p=bridgepoint(t)+side*.48*sign;top=p+Vector((0,0,h));pts.append(tuple(top))
  if i%2==0:rod('Vertical suspension hanger',p,top,.012,'bridge')
 line('Lions Gate suspension cable',pts,.03,'bridge')
 for t in [0,1]:cube('Concrete cable anchorage',bridgepoint(t)+side*.5*sign,(.22,.28,.2),'rock',.025)
# Trees use Japan's exact connected, four-tier evergreen silhouettes.
for x,y,h in [(-9,-.7,2.5),(-9,3.6,2.85),(-9.5,4.6,2.15),(-9,-2,1.9),(-9,-4.1,2.2),(-8.2,-5.1,1.8),(-3.1,-5.75,2.1),(-2,-6,1.65),(7.7,-1,2.6),(8.8,-1.0,2.7),(9,-2,2.2),(8,-4.3,2.5),(7,-5.3,1.8),(8.9,3.7,2.7),(-6.4,-1.0,2.0),(-6.5,3.35,1.7),(1.7,4.3,2.2),(2.9,4.7,2.4),(8.8,4.5,2.1)]:fir(x,y,h)
for x,y,s in [(-10,-3.5,.38),(-9.8,-4,.2),(1,-6.7,.27),(8.4,-4.5,.26),(8.8,-4.6,.18),(10.8,-1.8,.3)]:sphere('Shore stone',(x,y,.67+s*.27),(s,s*.65,s*.4),'rock')
# Small harbour details stay subordinate to the landscape.
sphere('Water taxi hull',(1.9,1.7,-.49),(.22,.49,.13),'wood')
cube('Water taxi cabin',(1.9,1.73,-.29),(.32,.39,.29),'wall',.06)
cube('Water taxi windshield',(1.9,1.525,-.27),(.23,.025,.13),'glass',.01)
sphere('Orca back',(-.4,-8.4,-.42),(.75,.27,.21),'orca')
mesh('Orca dorsal fin',[(-.48,-8.4,-.27),(-.11,-8.4,-.27),(-.38,-8.4,.31),(-.31,-8.33,-.25)],[(0,1,2),(0,2,3),(2,1,3),(0,3,1)],'orca',True)
sphere('Orca eye patch',(-.85,-8.57,-.33),(.12,.035,.065),'snow')
for x,y in [(-.6,-8.8),(4.6,-.85),(2.9,-7.4),(10,-5),(-10,-6.5)]:line('Quiet ripple',[(x-.27,y,-.58),(x,y+.025,-.58),(x+.28,y,-.58)],.012,'foam')
# Bake compact, colour-only geometry just like Japan's interactive asset.
for m in bpy.data.materials:
 if not m.use_nodes:continue
 p=m.node_tree.nodes.get('Principled BSDF')
 if p:
  for inp in ['Base Color','Normal']:
   for link in list(p.inputs[inp].links):m.node_tree.links.remove(link)
  p.inputs['Base Color'].default_value=m.diffuse_color;p.inputs['Roughness'].default_value=.8
bpy.ops.object.select_all(action='SELECT');bpy.context.view_layer.objects.active=land
bpy.ops.object.convert(target='MESH');bpy.ops.object.join();bpy.context.object.name='Canada coastal Storybook scene'
import gzip
bpy.ops.export_scene.gltf(filepath=str(OUT/'canada-storybook.glb'),export_format='GLB',use_selection=True,export_animations=False)
raw=(OUT/'canada-storybook.glb').read_bytes();(OUT/'canada-storybook.glb.gz').write_bytes(gzip.compress(raw,9));(OUT/'canada-storybook.glb').unlink()
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT.parent/'outputs/vancouver/canada-storybook-v2.blend'))
print('CANADA EXPORTED',len(raw),'compressed',len(gzip.compress(raw,9)),flush=True)
