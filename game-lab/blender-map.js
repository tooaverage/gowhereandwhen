import * as THREE from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {OrbitControls} from './vendor/OrbitControls.js';
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const palette={ideal:'#29955b',great:'#96cb5a',good:'#eed058',fair:'#ee9849',avoid:'#df6559'};
export async function createWorldMap(container,{data,iso=null,month=10,onSelect=()=>{},onCity=()=>{},onDismiss=()=>{},compact=false,flat=false}={}){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor('#82d0d8');renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.domElement.className='map-canvas';renderer.domElement.setAttribute('aria-label','Drag to explore the '+(flat?'weather':'low-poly')+' map. Use the buttons to zoom or select a place.');renderer.domElement.tabIndex=0;container.append(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#82d0d8');scene.add(new THREE.HemisphereLight('#e4f4ff','#7f9270',2));const sun=new THREE.DirectionalLight('#fff5dc',2.1);sun.position.set(-80,140,65);scene.add(sun);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-210,right:210,top:130,bottom:-130,near:1,far:500});sun.shadow.bias=-.0003;sun.shadow.normalBias=.06;
 const camera=new THREE.PerspectiveCamera(36,1,.1,1800);camera.position.set(0,240,270);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.zoomSpeed=2.5;controls.minDistance=7;controls.maxDistance=650;controls.minPolarAngle=.1;controls.maxPolarAngle=1.32;controls.enablePan=true;controls.mouseButtons={LEFT:THREE.MOUSE.PAN,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.ROTATE};controls.touches={ONE:THREE.TOUCH.PAN,TWO:THREE.TOUCH.DOLLY_ROTATE};controls.target.set(10,0,-12);if(flat){controls.enableRotate=false;controls.minPolarAngle=0;controls.maxPolarAngle=.001;}
 const labelLayer=document.createElement('div');labelLayer.className='map-labels';container.append(labelLayer);
 const labels=[],meshes=[],countryGroups=new Map(),featureMap=new Map();let selected=iso,mo=month,disposed=false,frame=0,tween=null;const byIso=new Map(data.map(r=>[r.iso,r]));
 function label(name,x,y,kind,rec){const el=document.createElement('button');el.className='map-label '+kind;el.innerHTML=kind==='city'?'<span class="dot"></span><span></span>':'';if(kind==='city')el.lastElementChild.textContent=name;else el.textContent=name;el.setAttribute('aria-label',kind==='city'?'Explore '+name:'Select '+name);el.addEventListener('click',()=>{if(kind==='city'){onCity(rec);focusCity(rec);}else{select(rec.iso,true);onSelect(rec.iso);}});labelLayer.append(el);labels.push({el,p:new THREE.Vector3(x,2,-y),kind,rec,priority:['Tokyo','Manila','Kyoto','Sapporo','Naha','Cebu','Siargao'].includes(name)});}
 const response=await fetch(new URL('./assets/world-web.glb.gz',import.meta.url));if(!response.ok)throw new Error('World model unavailable');const bytes=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();const asset=await new GLTFLoader().parseAsync(bytes,'');
 const weather=[],blossoms=[],seasonalRoots=[];let growing=false;
 scene.add(asset.scene);asset.scene.updateMatrixWorld(true);
 asset.scene.traverse(o=>{
  if(o.userData.role==='country')countryGroups.set(+o.userData.iso,o);
  if(o.userData.role==='blossom'){blossoms.push(o);o.userData.fullScale=o.scale.clone();o.userData.growth=1;}
  else if(o.userData.months)weather.push(o);
  if(o.isMesh){o.castShadow=true;o.receiveShadow=true;for(const m of Array.isArray(o.material)?o.material:[o.material]){m.roughness=1;}}
 });
 for(const [id,group] of countryGroups){
  const bounds=new THREE.Box3().setFromObject(group);featureMap.set(id,{bounds});
  group.traverse(o=>{if(o.isMesh){o.userData.iso=id;meshes.push(o);}});
  const rec=byIso.get(id),center=bounds.getCenter(new THREE.Vector3());
  if(rec&&[392,608,124,840,76,826,250,380,710,818,356,36,554,484,156,764,360].includes(id))label(rec.name,rec.hub?.lng??center.x,rec.hub?.lat??-center.z,'country',rec);
 }
 const groundRay=new THREE.Raycaster();
 for(const rec of data)for(const city of rec.cities||[])label(city.name,city.lng,city.lat,'city',{...city,iso:rec.iso});
 for(const l of labels){groundRay.set(new THREE.Vector3(l.p.x,80,l.p.z),new THREE.Vector3(0,-1,0));const group=countryGroups.get(l.rec.iso);if(group){const hit=groundRay.intersectObject(group,true)[0];if(hit)l.p.y=hit.point.y+1;}}
 function colorCountries(){
  for(const [id,group] of countryGroups){const band=byIso.get(id)?.months[mo]?.band;const c=new THREE.Color(band?palette[band.key]:'#bdcddd');
   group.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){
    if(/Monthly heat|Heatmap facet|No climate data/.test(m.name)){const factor=m.name.match(/facet (\d*\.?\d+)/);m.color.copy(c).multiplyScalar(factor?+factor[1]:1);}
   }});
  }
  for(const o of weather)o.visible=Array.from(o.userData.months).includes(mo+1);
  for(const o of blossoms){o.userData.target=mo===2||mo===3?1:.001;if(reduced()){o.userData.growth=o.userData.target;o.scale.copy(o.userData.fullScale).multiplyScalar(o.userData.growth);}else growing=true;}
  container.dataset.month=String(mo);container.dataset.model='blender-v6';
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

 function render(){frame=0;if(disposed)return;if(tween){const now=performance.now(),t=Math.min(1,(now-tween.start)/650),v=1-(1-t)**4;camera.position.lerpVectors(tween.from,tween.to,v);controls.target.lerpVectors(tween.targetFrom,tween.targetTo,v);if(t===1)tween=null;controls.update();}if(growing){growing=false;for(const o of blossoms){const d=o.userData.target-o.userData.growth;o.userData.growth+=Math.abs(d)<.002?d:d*.1;o.scale.copy(o.userData.fullScale).multiplyScalar(o.userData.growth);o.visible=o.userData.growth>.002;if(Math.abs(d)>=.002)growing=true;}}renderer.render(scene,camera);updateLabels();if(tween||growing)invalidate();}
 function invalidate(){if(!frame&&!disposed)frame=requestAnimationFrame(render);}
 function move(target,distance){const angle=distance>200?1.45:.90;const to=target.clone().add(new THREE.Vector3(0,distance*Math.sin(angle),distance*Math.cos(angle)));if(reduced()){camera.position.copy(to);controls.target.copy(target);controls.update();}else tween={from:camera.position.clone(),to,targetFrom:controls.target.clone(),targetTo:target,start:performance.now()};invalidate();}
 function select(id,focus=true){selected=id;if(focus){const f=featureMap.get(id);if(f){const c=f.bounds.getCenter(new THREE.Vector3()),sz=f.bounds.getSize(new THREE.Vector3());let d=Math.max(sz.x/(container.clientWidth/container.clientHeight),sz.z)*2.3;d=Math.max(d,24);if(id===392){c.set(136,0,-35);d=compact?56:68;}if(id===608){c.set(122,0,-12.5);d=compact?44:53;}if(!compact&&container.clientWidth>=700)c.x-=d*.2;if(!compact&&container.clientWidth<700){c.z+=d*.26;d*=1.15;}move(c,d);}}invalidate();}
 function focusCity(c){move(new THREE.Vector3(c.lng,0,-c.lat),compact?17:23);}
 function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();invalidate();}
 function zoom(factor){tween=null;const offset=camera.position.clone().sub(controls.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);controls.update();invalidate();}
 // Trackpad pinch arrives as ctrl+wheel. Own this gesture only inside the map.
 const wheel=e=>{if(e.target.closest('.map-mini-controls'))return;e.preventDefault();e.stopImmediatePropagation();const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?container.clientHeight:1);zoom(Math.exp(THREE.MathUtils.clamp(delta,-100,100)*(e.ctrlKey?.018:.006)));};
 container.addEventListener('wheel',wheel,{passive:false,capture:true});
 const gesture=e=>e.preventDefault();container.addEventListener('gesturestart',gesture,{passive:false});
 const ro=new ResizeObserver(resize);ro.observe(container);controls.addEventListener('change',invalidate);controls.addEventListener('start',()=>{tween=null;});
 const ray=new THREE.Raycaster();let down;renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const r=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=ray.intersectObjects(meshes,false)[0];if(hit&&byIso.has(hit.object.userData.iso)){select(hit.object.userData.iso,false);onSelect(hit.object.userData.iso);}else onDismiss();});
 renderer.domElement.addEventListener('keydown',e=>{const amount=camera.position.distanceTo(controls.target)*.06,delta=new THREE.Vector3();if(e.key==='ArrowLeft')delta.x=-amount;else if(e.key==='ArrowRight')delta.x=amount;else if(e.key==='ArrowUp')delta.z=-amount;else if(e.key==='ArrowDown')delta.z=amount;else return;e.preventDefault();controls.target.add(delta);camera.position.add(delta);controls.update();invalidate();});
 if(compact){const nav=document.createElement('div');nav.className='map-mini-controls';nav.innerHTML='<button aria-label="Zoom in on city map">+</button><button aria-label="Zoom out on city map">−</button><button aria-label="Reset country view">↺</button>';nav.children[0].onclick=()=>{zoom(.65);};nav.children[1].onclick=()=>{zoom(1.5);};nav.children[2].onclick=()=>select(selected,true);container.append(nav);}
 colorCountries();resize();if(iso)select(iso,true);else move(new THREE.Vector3(-15,0,-12),container.clientWidth<700?620:410);container.classList.add('loaded');
 return {select,focusCity,setMonth(m){mo=m;colorCountries();invalidate();},world(){move(new THREE.Vector3(-15,0,-12),container.clientWidth<700?620:410);},zoom,rotate(){const v=camera.position.clone().sub(controls.target);v.applyAxisAngle(new THREE.Vector3(0,1,0),Math.PI/6);camera.position.copy(controls.target).add(v);controls.update();invalidate();},dispose(){disposed=true;container.removeEventListener('wheel',wheel,true);container.removeEventListener('gesturestart',gesture);ro.disconnect();controls.dispose();renderer.dispose();if(frame)cancelAnimationFrame(frame);scene.traverse(o=>{o.geometry?.dispose();for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])m.dispose();});}};
}
