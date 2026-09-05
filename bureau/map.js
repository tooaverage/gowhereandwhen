import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const palette={ideal:'#20814e',great:'#96cb5a',good:'#eed058',fair:'#ee9849',avoid:'#bc453e'};
let topoPromise;
const topoURL=new URL('./vendor/world.json',import.meta.url);
function topology(t){
 const arcs=t.arcs.map(a=>{let x=0,y=0;return a.map(p=>{x+=p[0];y+=p[1];return [x*t.transform.scale[0]+t.transform.translate[0],y*t.transform.scale[1]+t.transform.translate[1]];});});
 const ring=ids=>ids.flatMap((id,i)=>{const a=id<0?arcs[~id].slice().reverse():arcs[id];return i?a.slice(1):a;});
 return t.objects.countries.geometries.filter(g=>+g.id!==10).map(g=>({iso:+g.id,name:g.properties.name,polys:splitDateline((g.type==='Polygon'?[g.arcs]:g.arcs).map(p=>p.map(ring)))}));
}
// Unwrap crossing rings before clipping at the date line so Russia and Alaska keep their land.
function splitDateline(polys){
 const output=[];
 function clip(points,edge,keepGreater){const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],ina=keepGreater?a[0]>=edge:a[0]<=edge,inb=keepGreater?b[0]>=edge:b[0]<=edge;if(ina)out.push(a);if(ina!==inb){const t=(edge-a[0])/(b[0]-a[0]);out.push([edge,a[1]+t*(b[1]-a[1])]);}}return out;}
 for(const poly of polys){const ring=[];for(const p of poly[0]){let x=p[0];if(ring.length){while(x-ring.at(-1)[0]>180)x-=360;while(x-ring.at(-1)[0]<-180)x+=360;}ring.push([x,p[1]]);}for(const shift of [-360,0,360]){let part=ring.map(p=>[p[0]+shift,p[1]]);part=clip(clip(part,-180,true),180,false);if(part.length>=3&&area(part)>.001)output.push([part]);}}
 return output;
}
function inside(p,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
function area(p){return Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-b[0]*a[1];},0)/2);}
function hash(a,b){return ((Math.sin(a*127.1+b*311.7)*43758.5453)%1+1)%1;}
const ranges=[[-112,46,5,13,8],[-122,59,6,10,8],[-73,-24,3,20,8],[-69,-44,3,10,7],[88,30,17,3,9],[101,35,8,6,5],[9,46,5,2.2,5],[43,41,4,2,4],[37,2,2,5,4],[138,37,1.2,4,3],[141,43,1.7,2,2.4],[121,17,1.2,2,2],[125,8,2,1.5,2],[-4,31,4,2,4],[29,-28,4,5,3],[173,-42,1.5,5,5]];
function elevation(x,y){let h=.68;for(const [a,b,sx,sy,v] of ranges)h+=Math.exp(-((x-a)**2/sx**2+(y-b)**2/sy**2))*v;return h+hash(x,y)*.45;}
function desert(x,y){return (y>17&&y<31&&x>-18&&x<55)||(x>117&&x<143&&y< -20&&y> -31)||(x>51&&x<89&&y>34&&y<44);}
function landColor(lat,h,n,x){if(desert(x,lat))return new THREE.Color(n>.5?'#c7af68':'#d0b972');if(Math.abs(lat)>65||h>6)return new THREE.Color(n>.5?'#eaf1e5':'#d6e5df');if(h>3.5)return new THREE.Color(n>.5?'#a1ad86':'#7f9273');if(Math.abs(lat)<32&&Math.abs(lat)>17&&n>.4)return new THREE.Color('#cbbb73');return new THREE.Color(n>.6?'#a9c975':n>.25?'#93b963':'#80a55a');}
export async function createWorldMap(container,{data,iso=null,month=10,onSelect=()=>{},onCity=()=>{},compact=false,flat=false}={}){
 if(!flat&&!compact)return (await import('./blender-map.js?v=world7final')).createWorldMap(container,arguments[1]);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor('#82d0d8');renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.domElement.className='map-canvas';renderer.domElement.setAttribute('aria-label','Drag to explore the '+(flat?'weather':'low-poly')+' map. Use the buttons to zoom or select a place.');renderer.domElement.tabIndex=0;container.append(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#82d0d8');scene.add(new THREE.HemisphereLight('#fffdea','#527a85',2.3));const sun=new THREE.DirectionalLight('#fff5dc',2.1);sun.position.set(-80,140,65);scene.add(sun);
 const camera=new THREE.PerspectiveCamera(36,1,.1,1800);camera.position.set(0,240,270);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.zoomSpeed=2.5;controls.minDistance=7;controls.maxDistance=650;controls.minPolarAngle=.1;controls.maxPolarAngle=1.32;controls.enablePan=true;controls.mouseButtons={LEFT:THREE.MOUSE.PAN,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.ROTATE};controls.touches={ONE:THREE.TOUCH.PAN,TWO:THREE.TOUCH.DOLLY_ROTATE};controls.target.set(10,0,-12);if(flat){controls.enableRotate=false;controls.minPolarAngle=0;controls.maxPolarAngle=.001;}
 const sea=new THREE.PlaneGeometry(1200,800,100,70).toNonIndexed(),colors=[];const pos=sea.attributes.position;for(let i=0;i<pos.count;i+=3){const n=hash(pos.getX(i),pos.getY(i)),c=new THREE.Color(n>.6?'#268fa9':n>.25?'#2892ac':'#2a94ad');for(let j=0;j<3;j++)colors.push(c.r,c.g,c.b);}sea.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));const water=new THREE.Mesh(sea,flat?new THREE.MeshBasicMaterial({color:'#95bfbc'}):new THREE.MeshLambertMaterial({vertexColors:true}));water.rotation.x=-Math.PI/2;water.position.y=-.2;scene.add(water);
 if(flat){const grid=new THREE.GridHelper(540,36,'#547a76','#547a76');grid.position.y=.02;grid.material.transparent=true;grid.material.opacity=.15;scene.add(grid);}
 const labelLayer=document.createElement('div');labelLayer.className='map-labels';container.append(labelLayer);
 const labels=[],meshes=[],countryGroups=new Map(),featureMap=new Map();let selected=iso,mo=month,disposed=false,frame=0,tween=null;const byIso=new Map(data.map(r=>[r.iso,r]));
 function label(name,x,y,kind,rec){const el=document.createElement('button');el.className='map-label '+kind;el.innerHTML=kind==='city'?'<span class="dot"></span><span></span>':'';if(kind==='city')el.lastElementChild.textContent=name;else el.textContent=name;el.setAttribute('aria-label',kind==='city'?'Explore '+name:'Select '+name);el.addEventListener('click',()=>{if(kind==='city'){onCity(rec);focusCity(rec);}else{select(rec.iso,true);onSelect(rec.iso);}});labelLayer.append(el);labels.push({el,p:new THREE.Vector3(x,elevation(x,y)+1,-y),kind,rec,priority:['Tokyo','Manila','Kyoto','Sapporo','Naha','Cebu','Siargao'].includes(name)});}
 const features=await (topoPromise??=fetch(topoURL).then(r=>r.json()).then(topology));
 const treePoints=[];let terrainVertices=0;
 for(const f of features){const rec=byIso.get(f.iso),group=new THREE.Group();group.userData.iso=f.iso;const bounds=new THREE.Box3();
  for(const original of f.polys){let ring=original[0];if(Math.max(...ring.map(p=>p[0]))-Math.min(...ring.map(p=>p[0]))>180)continue;const a=area(ring);if(a<.06)continue;const detailed=[392,608,276,300].includes(f.iso),threshold=detailed?.06:.5;{const simplified=[ring[0]];for(let i=1;i<ring.length;i++){const last=simplified.at(-1);if(i===ring.length-1||Math.hypot(ring[i][0]-last[0],ring[i][1]-last[1])>threshold)simplified.push(ring[i]);}ring=simplified;}if(ring.length<4)ring=original[0].filter((p,i)=>i%Math.max(1,Math.floor(original[0].length/20))===0);if(ring.length<3)continue;
   const shape=new THREE.Shape(ring.map(p=>new THREE.Vector2(p[0],p[1])));const baseGeo=new THREE.ExtrudeGeometry(shape,{depth:.68,bevelEnabled:false,steps:1,curveSegments:1});baseGeo.rotateX(-Math.PI/2);const base=new THREE.Mesh(baseGeo,new THREE.MeshLambertMaterial({color:'#adbb7b',flatShading:true}));base.userData.iso=f.iso;group.add(base);meshes.push(base);
   const pts=ring.slice(),xs=ring.map(p=>p[0]),ys=ring.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);bounds.expandByPoint(new THREE.Vector3(minX,0,-maxY));bounds.expandByPoint(new THREE.Vector3(maxX,0,-minY));
   const step=detailed?.34:2.1;for(let x=minX+step/2;x<maxX;x+=step)for(let y=minY+step/2;y<maxY;y+=step){const p=[x+(hash(x,y)-.5)*step*.5,y+(hash(y,x)-.5)*step*.5];if(inside(p,original[0])){pts.push(p);if(!flat&&hash(x,y)>.94&&!desert(x,y)&&Math.abs(y)<63&&elevation(x,y)<4.5&&treePoints.length<900)treePoints.push([p[0],p[1],detailed?.13:.43]);}}
   const tri=Delaunator.from(pts).triangles,v=[],col=[];for(let i=0;i<tri.length;i+=3){const ids=[tri[i],tri[i+1],tri[i+2]],p=ids.map(j=>pts[j]),mid=[(p[0][0]+p[1][0]+p[2][0])/3,(p[0][1]+p[1][1]+p[2][1])/3];if(!inside(mid,original[0]))continue;const h=elevation(...mid),c=landColor(mid[1],h,hash(...mid),mid[0]);for(const j of [0,2,1]){const pt=p[j],height=flat?.7:elevation(...pt);v.push(pt[0],height,-pt[1]);col.push(c.r,c.g,c.b);}}
   if(v.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();const m=new THREE.Mesh(g,flat?new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide}):new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true,side:THREE.DoubleSide}));m.userData.iso=f.iso;m.userData.terrain=true;group.add(m);meshes.push(m);terrainVertices+=v.length/3;}
  }
  if(!bounds.isEmpty()){
   for(const ring of f.polys.map(p=>p[0])){const pts=ring.map(p=>new THREE.Vector3(p[0],flat?.73:elevation(...p)+.035,-p[1]));const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:flat?'#4d6252':'#395449',transparent:true,opacity:flat?.55:.22}));group.add(line);}
   scene.add(group);countryGroups.set(f.iso,group);featureMap.set(f.iso,{...f,bounds});const center=bounds.getCenter(new THREE.Vector3());if(rec&&[392,608,124,840,76,826,250,380,710,818,356,36,554,484,156,764,360].includes(f.iso)){const x=rec.hub?.lng??center.x,y=rec.hub?.lat??-center.z;label(rec.name,x,y,'country',rec);}}
 }
 const trees=new THREE.InstancedMesh(new THREE.ConeGeometry(1,3,5),new THREE.MeshLambertMaterial({color:'#38856b',flatShading:true}),treePoints.length);const dummy=new THREE.Object3D();treePoints.forEach(([x,y,s],i)=>{dummy.position.set(x,elevation(x,y)+s*1.4,-y);dummy.scale.setScalar(s*(.7+hash(x,y)));dummy.rotation.y=hash(y,x)*6;dummy.updateMatrix();trees.setMatrixAt(i,dummy.matrix);trees.setColorAt(i,new THREE.Color(hash(x,y)>.5?'#3c896a':'#4f9b70'));});if(!flat)scene.add(trees);
 for(const rec of data)for(const city of rec.cities||[])label(city.name,city.lng,city.lat,'city',{...city,iso:rec.iso});
 const cityBuildings=[];for(const rec of data){const places=rec.cities.length?rec.cities:rec.hub?[{lng:rec.hub.lng,lat:rec.hub.lat}]:[];for(const c of places)for(let j=0;j<6;j++){const n=hash(c.lng+j,c.lat),x=c.lng+(j%3-1)*.16,y=c.lat+Math.floor(j/3)*.16;cityBuildings.push([x,y,.09+n*.055,.18+n*.35]);}}
 const blocks=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:'#ece1b5',flatShading:true}),cityBuildings.length);cityBuildings.forEach(([x,y,w,h],i)=>{dummy.position.set(x,elevation(x,y)+h/2,-y);dummy.scale.set(w,h,w);dummy.rotation.set(0,0,0);dummy.updateMatrix();blocks.setMatrixAt(i,dummy.matrix);});if(!flat)scene.add(blocks);
 // Small geographic lakes and sandy shore edges vary the terrain without obscuring weather fills.
 if(!flat){for(const [x,y,rx,ry] of [[-87,44,1.1,2.3],[-90,47.5,2.4,.8],[-82,45.5,1.1,1.4],[33,-1,1.2,1.1],[108,53.5,.5,2],[135.9,35.2,.16,.4],[121.2,14.3,.2,.16]]){const lake=new THREE.Mesh(new THREE.CircleGeometry(1,9),new THREE.MeshLambertMaterial({color:'#57b6c2'}));lake.rotation.x=-Math.PI/2;lake.scale.set(rx,ry,1);lake.position.set(x,elevation(x,y)+.08,-y);scene.add(lake);}
 for(const rec of data.filter(d=>[392,608,300,764,360,36,484].includes(d.iso))){const f=featureMap.get(rec.iso);if(!f)continue;for(const poly of f.polys){if(area(poly[0])<.5)continue;const pts=poly[0].filter((p,i)=>i%3===0).map(p=>new THREE.Vector3(p[0],.73,-p[1]));if(pts.length>2)scene.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:'#ecd394'})));}}
 }
 function colorCountries(){
  for(const [id,group] of countryGroups){const rec=byIso.get(id),band=rec?.months[mo]?.band;const color=new THREE.Color(band?palette[band.key]:'#a9b4aa');
   group.children.forEach(mesh=>{if(mesh.userData.terrain){const a=mesh.geometry.attributes.color,positions=mesh.geometry.attributes.position;for(let i=0;i<a.count;i+=3){const tone=flat?1:.88+hash(positions.getX(i),positions.getZ(i))*.2;const c=color.clone().multiplyScalar(tone);for(let j=0;j<3;j++)a.setXYZ(i+j,c.r,c.g,c.b);}a.needsUpdate=true;}else if(mesh.isMesh){mesh.material.color.copy(color).multiplyScalar(.77);}});
  }container.dataset.month=String(mo);
 }
 function updateLabels(){
  const occupied=[],distance=camera.position.distanceTo(controls.target),w=container.clientWidth,h=container.clientHeight;
  if(!compact){const r=container.getBoundingClientRect();container.parentElement.querySelectorAll('.world-tools,.country-panel,.world-months').forEach(el=>{const b=el.getBoundingClientRect();occupied.push([b.left-r.left,b.top-r.top,b.right-r.left,b.bottom-r.top]);});}
  for(const l of labels.slice().sort((a,b)=>Number(b.priority)-Number(a.priority))){
   let show=l.kind==='city'?(distance<95&&(!compact||l.rec.iso===selected)):distance>=95;
   if(l.kind==='city'&&distance>65&&!l.priority)show=false;
   const p=l.p.clone();if(flat)p.y=.9;p.project(camera);
   show&&=p.z>-1&&p.z<1&&p.x>-1&&p.x<1&&p.y>-1&&p.y<1;
   // Measure every label in CSS pixels before hiding it, including after font or viewport changes.
   l.el.hidden=false;l.el.style.visibility='hidden';
   const ww=l.el.getBoundingClientRect().width,hh=l.el.getBoundingClientRect().height;
   const sx=(p.x+1)*w/2,sy=(1-p.y)*h/2,box=[sx-ww/2,sy-hh,sx+ww/2,sy+8];
   if(box[0]<8||box[2]>w-8||box[1]<8||box[3]>h-8)show=false;
   if(show&&occupied.some(b=>box[0]<b[2]+10&&box[2]>b[0]-10&&box[1]<b[3]+10&&box[3]>b[1]-10))show=false;
   l.el.hidden=!show;if(!show)continue;
   occupied.push(box);l.el.style.visibility='';l.el.style.left=sx+'px';l.el.style.top=sy+'px';
   l.el.classList.toggle('active',l.kind==='country'&&l.rec.iso===selected);
   if(l.kind==='city'){const b=l.rec.months[mo].band;l.el.style.setProperty('--weather',palette[b.key]);l.el.setAttribute('aria-label',l.rec.name+': '+b.label+' weather in '+['January','February','March','April','May','June','July','August','September','October','November','December'][mo]);}
  }
 }

 function render(){frame=0;if(disposed)return;if(tween){const now=performance.now(),t=Math.min(1,(now-tween.start)/650),v=1-(1-t)**4;camera.position.lerpVectors(tween.from,tween.to,v);controls.target.lerpVectors(tween.targetFrom,tween.targetTo,v);if(t===1)tween=null;controls.update();}renderer.render(scene,camera);updateLabels();if(tween)invalidate();}
 function invalidate(){if(!frame&&!disposed)frame=requestAnimationFrame(render);}
 function move(target,distance){const angle=flat?Math.PI/2:compact?.7:.78;const to=target.clone().add(new THREE.Vector3(flat?0:distance*.07,distance*Math.sin(angle),distance*Math.cos(angle)));if(reduced()){camera.position.copy(to);controls.target.copy(target);controls.update();}else tween={from:camera.position.clone(),to,targetFrom:controls.target.clone(),targetTo:target,start:performance.now()};invalidate();}
 function select(id,focus=true){selected=id;if(focus){const f=featureMap.get(id);if(f){const c=f.bounds.getCenter(new THREE.Vector3()),sz=f.bounds.getSize(new THREE.Vector3());let d=Math.max(sz.x/(container.clientWidth/container.clientHeight),sz.z)*2.3;d=Math.max(d,24);if(id===392){c.set(136,0,-35);d=compact?56:68;}if(id===608){c.set(122,0,-12.5);d=compact?44:53;}if(!compact&&container.clientWidth>=700)c.x-=d*.2;if(!compact&&container.clientWidth<700){c.z+=d*.26;d*=1.15;}move(c,d);}}invalidate();}
 function focusCity(c){move(new THREE.Vector3(c.lng,0,-c.lat),compact?17:23);}
 function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();invalidate();}
 function zoom(factor){tween=null;const offset=camera.position.clone().sub(controls.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);controls.update();invalidate();}
 // Trackpad pinch arrives as ctrl+wheel. Own this gesture only inside the map.
 const wheel=e=>{if(e.target.closest('.map-mini-controls'))return;e.preventDefault();e.stopImmediatePropagation();const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?container.clientHeight:1);zoom(Math.exp(THREE.MathUtils.clamp(delta,-100,100)*(e.ctrlKey?.018:.006)));};
 container.addEventListener('wheel',wheel,{passive:false,capture:true});
 const gesture=e=>e.preventDefault();container.addEventListener('gesturestart',gesture,{passive:false});
 const ro=new ResizeObserver(resize);ro.observe(container);controls.addEventListener('change',invalidate);controls.addEventListener('start',()=>{tween=null;});
 const ray=new THREE.Raycaster();let down;renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const r=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=ray.intersectObjects(meshes,false)[0];if(hit&&byIso.has(hit.object.userData.iso)){select(hit.object.userData.iso,false);onSelect(hit.object.userData.iso);}});
 renderer.domElement.addEventListener('keydown',e=>{const amount=camera.position.distanceTo(controls.target)*.06,delta=new THREE.Vector3();if(e.key==='ArrowLeft')delta.x=-amount;else if(e.key==='ArrowRight')delta.x=amount;else if(e.key==='ArrowUp')delta.z=-amount;else if(e.key==='ArrowDown')delta.z=amount;else return;e.preventDefault();controls.target.add(delta);camera.position.add(delta);controls.update();invalidate();});
 if(compact){const nav=document.createElement('div');nav.className='map-mini-controls';nav.innerHTML='<button aria-label="Zoom in on city map">+</button><button aria-label="Zoom out on city map">−</button><button aria-label="Reset country view">↺</button>';nav.children[0].onclick=()=>{zoom(.65);};nav.children[1].onclick=()=>{zoom(1.5);};nav.children[2].onclick=()=>select(selected,true);container.append(nav);}
 colorCountries();resize();if(iso)select(iso,true);else if(container.clientWidth<700)select(392,true);else move(new THREE.Vector3(-25,0,7),410);container.classList.add('loaded');
 return {select,focusCity,setMonth(m){mo=m;colorCountries();invalidate();},world(){move(new THREE.Vector3(-20,0,container.clientWidth<700?65:7),container.clientWidth<700?620:410);},zoom,rotate(){const v=camera.position.clone().sub(controls.target);v.applyAxisAngle(new THREE.Vector3(0,1,0),Math.PI/6);camera.position.copy(controls.target).add(v);controls.update();invalidate();},dispose(){disposed=true;container.removeEventListener('wheel',wheel,true);container.removeEventListener('gesturestart',gesture);ro.disconnect();controls.dispose();renderer.dispose();if(frame)cancelAnimationFrame(frame);scene.traverse(o=>{o.geometry?.dispose();if(o.material?.dispose)o.material.dispose();});}};
}
