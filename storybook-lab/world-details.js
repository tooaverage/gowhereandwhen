import * as T from 'three';
import {createReveal} from './reveal.js?v=storybook32';
import {sights,experiences,beachTowns} from '../play/world-details.js?v=world7final';
export {australiaRegions,regionalScore,heatColor} from '../play/world-details.js?v=world7final';
// Each landmark has its own composition, silhouette, proportions and palette.
// Small scenery uses shared materials and is merged per material for mobile rendering.
export function addWorldDetails(scene,{ground,data=[],animateVisibility=()=>true}){
 const reveal=createReveal(animateVisibility);
 const materials=new Map(),items=[],interactive=[],typhoons=[],monsoonRain=[],weather=[],billboards=[];
 const mat=c=>{if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.84}));return materials.get(c);};
 function mesh(g,geo,c,x=0,y=0,z=0,sx=1,sy=1,sz=1){const m=new T.Mesh(geo,mat(c));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
 const ball=(g,c,x,y,z,rx,ry=rx,rz=rx)=>mesh(g,new T.SphereGeometry(1,16,10),c,x,y,z,rx,ry,rz);
 function box(g,c,x,y,z,w,h,d,r=.025){r=Math.min(r,w/5,h/5,d/5);const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const geo=new T.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:r>0,bevelSize:r,bevelThickness:r,bevelSegments:2,steps:1,curveSegments:2});geo.translate(0,0,-(d-2*r)/2);return mesh(g,geo,c,x,y,z);}
 const cylinder=(g,c,x,y,z,r,h,rt=r)=>mesh(g,new T.CylinderGeometry(rt,r,h,16),c,x,y,z);
 function tube(g,pts,c,r=.035){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p))),24,r,6,false),c);}
 function arch(g,c,x,y,z,w,h,d){const s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h);s.lineTo(-w/2,h);s.closePath();const r=w*.31,shoulder=h*.51;const p=new T.Path();p.moveTo(-r,0);p.lineTo(-r,shoulder);p.absarc(0,shoulder,r,Math.PI,0,true);p.lineTo(r,0);p.closePath();s.holes.push(p);const geo=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.006,bevelThickness:.006,bevelSegments:1,curveSegments:8});geo.translate(0,0,-d/2);return mesh(g,geo,c,x,y,z);}
 function dome(g,c,x,y,z,r,h){const profile=[[0,0],[.68,.02],[.88,.18],[1,.43],[.91,.66],[.65,.82],[.31,.92],[.08,1.07],[0,1.11]].map(([a,b])=>new T.Vector2(a*r,b*h));return mesh(g,new T.LatheGeometry(profile,24),c,x,y,z);}
 function roof(g,c,x,y,z,w,d,h){const v=[-w/2,0,-d/2,w/2,0,-d/2,w/2,0,d/2,-w/2,0,d/2,0,h,-d/2,0,h,d/2];const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setIndex([0,4,1,3,2,5,0,3,5,0,5,4,1,4,5,1,5,2]);geo.computeVertexNormals();return mesh(g,geo,c,x,y,z);}
 function pack(g){g.updateMatrixWorld(true);const inv=g.matrixWorld.clone().invert(),bins=new Map(),old=[];g.traverse(o=>{if(!o.isMesh)return;old.push(o);const geom=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geom.applyMatrix4(inv.clone().multiply(o.matrixWorld));const key=o.material;if(!bins.has(key))bins.set(key,{p:[],n:[]});const b=bins.get(key);b.p.push(...geom.attributes.position.array);b.n.push(...geom.attributes.normal.array);geom.dispose();});for(const o of old){o.removeFromParent();o.geometry.dispose();}for(const [m,b] of bins){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(b.p,3));geo.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));const o=new T.Mesh(geo,m);o.castShadow=true;o.receiveShadow=true;g.add(o);}}
 function place(rec,build,scale=1,alt=null){const g=new T.Group();build(g);pack(g);g.scale.setScalar(scale);g.position.set(rec.x,alt??ground(rec.iso,rec.x,rec.y)+.025,-rec.y);g.userData={...rec,fullScale:scale};g.name=rec.name;scene.add(g);items.push(g);g.traverse(o=>{if(o.isMesh){o.userData.sight=rec;interactive.push(o);}});return g;}
 const ivory='#f5ead3',stone='#d1b895',shadow='#746551',gold='#d8b465',leaf='#76ad70';
 const builders={
  taj(g){box(g,ivory,0,.07,0,2.5,.14,2.5);box(g,'#76cbbf',0,.155,1.0,.16,.015,.75);box(g,ivory,0,.49,0,1.24,.68,1.24);for(const x of [-.41,0,.41])arch(g,'#e8d7bb',x,.16,.628,.39,.6,.04);dome(g,'#fff8e8',0,.83,0,.49,.63);cylinder(g,gold,0,1.58,0,.024,.20);ball(g,gold,0,1.7,0,.042);for(const x of [-1,1])for(const z of [-1,1]){cylinder(g,ivory,x,.7,z,.083,1.25,.071);for(const y of [.32,.75,1.13])cylinder(g,'#e7d4b5',x,y,z,.106,.045);dome(g,ivory,x,1.34,z,.13,.16);cylinder(g,gold,x,1.55,z,.012,.12);}for(const x of [-.46,.46])for(const z of [-.46,.46])dome(g,ivory,x,.86,z,.15,.22);},
  angkor(g){box(g,'#8daf87',0,.035,0,2.7,.07,2.6);box(g,'#7ec8bb',0,.09,0,2.5,.05,2.3);box(g,stone,0,.15,0,1.95,.19,1.76);for(let k=0;k<3;k++)box(g,['#c8b695','#ddcbae','#edddbb'][k],0,.23+k*.115,0,1.48-k*.24,.13,1.26-k*.21);box(g,stone,0,.18,1.01,.33,.1,.98);for(let j=0;j<6;j++)box(g,'#e2cfaa',0,.15+j*.042,.83-j*.072,.45,.045,.1);for(const side of [-1,1])for(let j=0;j<7;j++){arch(g,stone,-.83+j*.275,.23,side*.76,.265,.34,.13);const a=arch(g,stone,side*.83,.23,-.61+j*.2,.21,.34,.12);a.rotation.y=Math.PI/2;}for(const [x,z,h] of [[0,0,1.2],[-.5,-.43,.83],[.5,-.43,.83],[-.5,.43,.83],[.5,.43,.83]]){box(g,stone,x,.67,z,.35,.43,.35);for(let k=0;k<6;k++){const r=.21*(1-k*.12),y=.82+k*h*.105;dome(g,k%2?'#d6c5a7':'#bfae8e',x,y,z,r,h*.20);}for(const dx of [-.12,.12])cylinder(g,'#e1d3b9',x+dx,.70,z+.18,.016,.33);ball(g,gold,x,.85+h*.69,z,.032,.055,.032);}},
  rome(g){const n=24,rx=1.03,rz=.77;mesh(g,new T.CircleGeometry(.94,48),'#d4bd91',0,.07,0,1,1,.73).rotation.x=-Math.PI/2;for(let level=0;level<3;level++)for(let i=0;i<n;i++){if(level===2&&i>4&&i<13)continue;const a=i/n*Math.PI*2,x=rx*Math.cos(a),z=rz*Math.sin(a),o=arch(g,['#dfc9a6','#ebd9b9','#f0e3c9'][level],x,.09+level*.29,z,.26,.28,.16);o.rotation.y=Math.atan2(-rx*Math.sin(a),rz*Math.cos(a));box(g,stone,x,.075+level*.29,z,.22,.045,.19).rotation.y=o.rotation.y;}const pts=Array.from({length:65},(_,i)=>{const a=i/64*Math.PI*2;return [rx*Math.cos(a),.68,rz*Math.sin(a)];});tube(g,pts,'#ccb894',.045);},
  pyramids(g){for(const [x,z,h] of [[-.66,-.18,1.4],[.52,.29,1.05],[1.24,.79,.55]]){const o=mesh(g,new T.ConeGeometry(h*.76,h,4,1), '#e4bc78',x,h/2,z);o.rotation.y=Math.PI/4;box(g,'#846b4e',x,h*.14,z+h*.52,.10,h*.18,.025,0);}for(let i=0;i<3;i++)box(g,'#d5af77',-1.1+i*.22,.095,.65,.18,.19,.2);},
  petra(g){box(g,'#c88875',0,.66,-.16,1.75,1.32,.48);box(g,'#e0aa91',0,.68,.12,1.47,1.36,.16);box(g,'#6e504b',0,.33,.215,.30,.60,.015,0);for(const y of [.08,.72,1.33])box(g,'#e8bda0',0,y,.28,1.58,.075,.23);for(const x of [-.61,-.38,.38,.61]){cylinder(g,'#f0c7a7',x,.41,.31,.054,.60);box(g,'#f1c9ac',x,.71,.31,.14,.08,.14);cylinder(g,'#e6b395',x,1.01,.28,.047,.48);}for(const x of [-.48,.48])roof(g,'#f0c3a3',x,1.33,.21,.57,.32,.24);dome(g,'#dca78c',0,1.33,.17,.15,.27);cylinder(g,'#f0c8ac',0,1.68,.17,.05,.15);},
  inca(g){for(let k=0;k<6;k++){box(g,'#a7bc80',0,.06+k*.095,-.65+k*.27,1.95-k*.16,.13,.38);box(g,'#c7c5a5',0,.03+k*.095,-.44+k*.27,1.95-k*.16,.14,.055);}for(const [x,z,h] of [[-.48,-.38,.28],[.04,-.37,.34],[.51,-.35,.23],[-.31,.22,.29],[.24,.27,.23]]){box(g,'#d8d0b2',x,.68,z,.35,h,.30);box(g,'#6f7660',x,.69,z+.152,.10,h*.7,.009,0);roof(g,'#a6a487',x,.68+h/2,z,.38,.33,.13);}for(let i=0;i<7;i++)box(g,'#bdbea0',-.87,.17+i*.073,-.64+i*.15,.13,.05,.13);},
  wall(g){const pts=Array.from({length:13},(_,i)=>[(i-6)*.29,.15+.15*Math.sin(i*.55),Math.sin(i*.62)*.28]);for(let i=0;i<pts.length-1;i++){const [x,y,z]=pts[i],[xx,yy,zz]=pts[i+1],a=Math.atan2(xx-x,zz-z);const o=box(g,stone,(x+xx)/2,(y+yy)/2+.1,(z+zz)/2,.16,.30,Math.hypot(xx-x,zz-z)+.025);o.rotation.y=a;for(const side of [-1,1])box(g,'#efe0bc',x+side*.09,y+.28,z,.06,.12,.10);}for(const i of [0,4,8,12]){const [x,y,z]=pts[i];box(g,'#d1bda0',x,y+.19,z,.37,.48,.37);for(const dx of [-.15,0,.15])for(const dz of [-.15,.15])box(g,'#edddbf',x+dx,y+.48,z+dz,.08,.1,.08);arch(g,'#e6d5b6',x,y-.03,z+.195,.26,.29,.02);}},
  canyon(g){for(const side of [-1,1])for(let j=0;j<5;j++){const z=(j-2)*.36;for(let k=0;k<4;k++){const o=box(g,['#af715d','#c78660','#dea17a','#e9bc91'][k],side*(.47+k*.035)+Math.sin(j*1.5)*.10,.1+k*.14,z,.60-k*.045,.19,.56,.055);o.rotation.y=Math.sin(j)*.16;}}tube(g,[[-.08,.045,-1.03],[.07,.045,-.52],[-.10,.045,0],[.12,.045,.55],[.1,.045,1.03]],'#67c6cb',.052);},
  safari(g){acacia(g,-.37,-.25,.86);elephant(g,.36,.36,.63);elephant(g,-.28,.48,.35);},
  reef(g){const shape=new T.Shape();for(let j=0;j<=48;j++){const a=j/48*Math.PI*2,r=1+.10*Math.sin(a*5);const x=Math.cos(a)*1.43*r,z=Math.sin(a)*.57*r;if(j===0)shape.moveTo(x,z);else shape.lineTo(x,z);}const bed=mesh(g,new T.ShapeGeometry(shape),'#82d6c7',0,.022,0);bed.rotation.x=-Math.PI/2;
 for(let i=0;i<7;i++){const x=(i-3)*.34,z=Math.sin(i*1.8)*.27;for(let j=0;j<4;j++){const a=j*1.7+i,bx=x+Math.cos(a)*.14,bz=z+Math.sin(a)*.12,c=['#e39ca0','#e5b27c','#b29dc4'][j%3];tube(g,[[bx,0,bz],[bx+.03,.16,bz],[bx-.04,.28,bz]],c,.026);for(const side of [-1,1])tube(g,[[bx+.02,.13,bz],[bx+side*.09,.20,bz+.03],[bx+side*.11,.27,bz+.05]],c,.021);}ball(g,'#daaaba',x+.1,.035,z+.16,.075,.035,.065);}for(let i=0;i<3;i++){const x=-.6+i*.61,z=.58;ball(g,['#ffd46b','#f29e72','#fff1c8'][i],x,.10,z,.10,.042,.035);const t=mesh(g,new T.ConeGeometry(.045,.09,3),'#f1b764',x+.12,.10,z);t.rotation.z=Math.PI/2;}},
 };
 function acacia(g,x,z,s){cylinder(g,'#967d5b',x,.42*s,z,.043*s,.84*s);for(const side of [-1,1])tube(g,[[x,.46*s,z],[x+side*.20*s,.74*s,z],[x+side*.36*s,.87*s,z]],'#967d5b',.025*s);for(const [dx,dz,r] of [[-.26,0,.30],[.24,0,.34],[0,.13,.33]])ball(g,leaf,x+dx*s,.87*s,z+dz*s,r*s,.12*s,r*.8*s);}
 function elephant(g,x,z,s){const a=new T.Group();g.add(a);a.position.set(x,0,z);a.scale.setScalar(s);const c='#a6aba0';ball(a,c,0,.43,0,.36,.30,.22);ball(a,c,-.32,.49,0,.22,.23,.20);for(const dz of [-.21,.21])ball(a,'#b7b9ac',-.24,.52,dz,.16,.19,.037);for(const xx of [-.22,.22])for(const zz of [-.14,.14]){cylinder(a,c,xx,.19,zz,.075,.35);ball(a,'#d8d3bf',xx,.04,zz,.07,.026,.076);}tube(a,[[-.49,.48,0],[-.54,.26,0],[-.51,.10,0],[-.42,.09,0]],c,.064);for(const dz of [-.15,.15]){ball(a,'#334c48',-.45,.55,dz,.019);tube(a,[[-.43,.39,dz],[-.53,.28,dz],[-.57,.31,dz]],'#f7edd5',.02);}tube(a,[[.31,.46,0],[.45,.33,0],[.44,.22,0]],'#858d83',.018);}
 function wildebeest(g,x,z,s){const a=new T.Group();a.position.set(x,0,z);a.scale.setScalar(s);g.add(a);ball(a,'#948975',0,.36,0,.28,.17,.13);ball(a,'#7c7668',-.22,.42,0,.12,.16,.11);ball(a,'#5e645b',-.32,.34,0,.11,.075,.08);for(const xx of [-.17,.17])for(const zz of [-.085,.085]){tube(a,[[xx,.34,zz],[xx+.018,.16,zz],[xx-.014,.025,zz]],'#6d6b5e',.027);box(a,'#454e47',xx-.018,.024,zz,.071,.04,.051,.006);}for(const dz of [-1,1]){tube(a,[[-.23,.5,dz*.055],[-.22,.55,dz*.16],[-.26,.65,dz*.17]],'#ede1c7',.019);ball(a,'#4b5147',-.31,.45,dz*.081,.012);}tube(a,[[.25,.39,0],[.36,.25,0],[.40,.20,0]],'#645d50',.02);}
 const scales={taj:.68,angkor:.68,rome:.54,petra:.73,inca:.90,wall:.80,pyramids:.83,canyon:.95,safari:1,reef:1.25};
 for(const rec of sights)place(rec,builders[rec.type],scales[rec.type],rec.type==='reef'?-.47:null);
 // Two braced orange towers, paired suspension cables and a slender roadway.
 place({iso:840,name:'Golden Gate Bridge, San Francisco',x:-122.4783,y:37.8199,type:'golden-gate',description:'San Francisco’s International Orange suspension bridge across the Golden Gate strait.',window:'September and October often bring warm days. Coastal wind and fog can arrive in any season.',url:'https://www.goldengate.org/bridge/visiting-the-bridge/'},g=>{
  const orange='#d77754',edge='#eea27b';
  box(g,'#b7b5a0',0,.10,0,2.9,.09,.33,.01);box(g,'#777f79',0,.17,0,2.88,.08,.29,.008);
  for(const z of [-.18,.18]){box(g,orange,0,.19,z,2.94,.11,.045,.008);tube(g,[[-1.46,.29,z],[1.46,.29,z]],edge,.012);}
  for(let x=-1.3;x<1.4;x+=.17)box(g,'#eee1be',x,.214,0,.075,.007,.015,0);
  for(const x of [-.77,.77]){
   box(g,'#a19f8f',x,-.04,0,.29,.40,.48,.035);
   for(const z of [-.20,.20]){box(g,orange,x,.76,z,.102,1.55,.105,.008);box(g,edge,x,1.56,z,.14,.07,.14,.008);}
   for(const y of [.36,.74,1.16,1.46])box(g,orange,x,y,0,.10,.065,.48,.008);
   for(const y of [.44,.85])for(const side of [-1,1])tube(g,[[x,y,-.15*side],[x,y+.22,.15*side]],edge,.018);
  }
  for(const z of [-.2,.2]){
   const pts=Array.from({length:41},(_,i)=>{const x=-.77+i*1.54/40;return [x,.48+1.04*(x/.77)**2,z];});tube(g,pts,orange,.025);
   for(const side of [-1,1])tube(g,[[side*.77,1.52,z],[side*1.10,.82,z],[side*1.47,.25,z]],orange,.025);
   for(let i=1;i<20;i++){const x=-.77+i*1.54/20;tube(g,[[x,.25,z],[x,.48+1.04*(x/.77)**2,z]],edge,.009);}
  }
  g.rotation.y=-1.3;
 },.78);

 // Vancouver's waterfront is anchored by Canada Place's five tensioned white sails.
 const vancouverDeck=-.32;
 place({iso:124,name:'Canada Place, Vancouver',x:-123.111,y:49.288,type:'vancouver',description:'Vancouver’s waterfront landmark, with five white sails overlooking the harbour.',url:'https://www.canadaplace.ca/'},g=>{
  // A solid quay meets the water directly, with no exposed stilts.
  box(g,'#b8bba4',0,-.22,0,2.36,.46,.84,.035);
  box(g,'#e4dbc0',0,.065,0,2.30,.13,.78,.06);
  box(g,'#568d95',0,.24,0,2.10,.24,.58,.035);
  for(let i=0;i<5;i++){
   const x=(i-2)*.405,w=.41,d=.65,h=.53-(Math.abs(i-2)*.035),pos=[],idx=[],n=10;
   for(let u=0;u<=n;u++)for(let v=0;v<=n;v++){
    const xx=(u/n-.5)*w,zz=(v/n-.5)*d;
    const yy=.36+h*Math.pow(Math.max(0,1-Math.abs(xx)/(w/2)),.72)*Math.pow(Math.max(0,1-Math.abs(zz)/(d/2)),.42);
    pos.push(x+xx,yy,zz);
   }
   for(let u=0;u<n;u++)for(let v=0;v<n;v++){const a=u*(n+1)+v,b=a+n+1;idx.push(a,a+1,b,b,a+1,b+1);}
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();mesh(g,geo,'#fff7df');
   cylinder(g,'#e8d6ac',x,.36+h*.5,0,.008,h+.09);
  }
  for(let i=0;i<11;i++){box(g,'#cbe5df',-.95+i*.19,.25,.296,.105,.12,.013,.002);cylinder(g,'#ede7d4',-.95+i*.19,.14,.355,.01,.16);}
  tube(g,[[-1.1,.22,.355],[0,.22,.355],[1.1,.22,.355]],'#ede7d4',.009);
 },.5,vancouverDeck);

 // Canadian sights use separate, deliberately spaced compositions.
 function alpinePeak(g,x,z,w,h,seed){
  const n=18,rings=[],levels=[0,.28,.62,.82,1],radii=[1,.81,.46,.25,0];
  for(let j=0;j<levels.length;j++){
   const ring=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2,crinkle=1+.10*Math.sin(i*2.4+seed)+.055*Math.cos(i*4.1-seed),snowEdge=j===2?.065*Math.sin(i*1.7+seed):0;
    ring.push([x+Math.cos(a)*w*radii[j]*crinkle-.12*w*levels[j],.035+h*(levels[j]+snowEdge),z+Math.sin(a)*w*radii[j]*.67*crinkle]);}
   rings.push(ring);
  }
  for(let j=0;j<4;j++){
   const p=[];for(let i=0;i<n;i++){const k=(i+1)%n;p.push(...rings[j][i],...rings[j+1][i],...rings[j][k]);if(j<3)p.push(...rings[j][k],...rings[j+1][i],...rings[j+1][k]);}
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.computeVertexNormals();mesh(g,geo,['#7b9a7c','#8e9c8a','#edf3ed','#fffaf0'][j]);
  }
 }
 place({iso:124,name:'Lake Louise & the Canadian Rockies',x:-116.18,y:51.42,type:'rockies',description:'A turquoise glacial lake below the snow-capped Canadian Rockies, in Banff National Park.',window:'July and August for alpine lakes and hiking; winter for skiing. Snow and lake ice vary with the year and elevation.',url:'https://www.banfflakelouise.com/experiences/lake-louise'},g=>{
  // The surrounding peaks are authored in Blender with the Canada cover's ridge geometry.
  const shape=new T.Shape();for(let i=0;i<=48;i++){const a=i/48*Math.PI*2,r=1+.07*Math.sin(a*3);const x=Math.cos(a)*.84*r,z=Math.sin(a)*.34*r;if(!i)shape.moveTo(x,z);else shape.lineTo(x,z);}
  const lakeGeo=new T.ShapeGeometry(shape);lakeGeo.rotateX(-Math.PI/2);lakeGeo.translate(.13,0,.57);const verts=lakeGeo.attributes.position,base=ground(124,-116.18,51.42);for(let i=0;i<verts.count;i++){const x=verts.getX(i),z=verts.getZ(i);verts.setY(i,(ground(124,-116.18+x*1.25,51.42-z*1.25)-base)/1.25+.065);}lakeGeo.computeVertexNormals();mesh(g,lakeGeo,'#60cec9');
  for(const [x,z,s] of [[-.92,.50,.47],[1.02,.18,.55],[.85,.91,.41],[-.70,.90,.37]]){const tree=new T.Group();tree.position.set(x,.02,z);tree.scale.setScalar(s);g.add(tree);fir(tree);}
 },1.25);
 place({iso:124,name:'CN Tower, Toronto',x:-79.387,y:43.643,type:'cn-tower',description:'Toronto’s slender skyline landmark, with a broad observation pod and a needle-like antenna above Lake Ontario.',window:'June to September for waterfront sightseeing.',url:'https://www.cntower.ca/'},g=>{
  cylinder(g,'#b3c4b1',0,.04,0,.53,.08);cylinder(g,'#e4dcc7',0,.94,0,.105,1.80,.054);
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3; tube(g,[[Math.cos(a)*.25,.04,Math.sin(a)*.25],[Math.cos(a)*.085,1.25,Math.sin(a)*.085],[Math.cos(a)*.05,1.64,Math.sin(a)*.05]],'#dcd6c4',.046);}
  cylinder(g,'#d6d2bd',0,1.67,0,.15,.16,.37);cylinder(g,'#e9dec8',0,1.79,0,.37,.08);cylinder(g,'#638d94',0,1.86,0,.335,.095);cylinder(g,'#f5edd9',0,1.93,0,.34,.055,.21);
  for(let i=0;i<18;i++){const a=i*Math.PI/9;cylinder(g,'#e6ddc8',Math.cos(a)*.337,1.86,Math.sin(a)*.337,.008,.096);}
  cylinder(g,'#e9e6d4',0,2.09,0,.05,.32,.037);cylinder(g,'#7d9b9b',0,2.29,0,.092,.075);cylinder(g,'#faf4e2',0,2.48,0,.028,.38,.013);cylinder(g,'#d77469',0,2.55,0,.021,.055);cylinder(g,'#d77469',0,2.67,0,.016,.045);
 },.78);
 place({iso:124,name:'Château Frontenac, Québec City',x:-71.205,y:46.812,type:'frontenac',description:'A grand red-brick château hotel above Old Québec, with copper-green roofs, dormers and pointed turrets.',window:'June to September for warm-weather exploring; winter for a snowy city break.',url:'https://www.quebec-cite.com/en/quebec-city/landmarks'},g=>{
  const brick='#bc8c73',trim='#efd7b4',copper='#608f83';box(g,'#c9c5ab',0,.045,0,1.75,.09,1.04);
  for(const [x,z,w,h,d] of [[0,0,.64,1.10,.55],[-.56,.13,.63,.54,.42],[.56,.13,.63,.54,.42]]){
   box(g,brick,x,.10+h/2,z,w,h,d);box(g,trim,x,.16,z,w+.04,.10,d+.03);roof(g,copper,x,.10+h,z,w+.11,d+.10,h*.36);
   for(let i=0;i<3;i++)for(let j=0;j<(h>.8?5:2);j++)box(g,'#567c7a',x+(i-1)*w*.26,.29+j*.15,z+d/2+.008,.067,.087,.014,.003);
   for(const dx of [-w*.24,w*.24]){box(g,trim,x+dx,.14+h,z+d*.29,.105,.12,.11);roof(g,copper,x+dx,.20+h,z+d*.29,.13,.14,.06);}
  }
  for(const x of [-.85,.85]){cylinder(g,brick,x,.46,.22,.13,.71);cylinder(g,trim,x,.80,.22,.15,.05);mesh(g,new T.ConeGeometry(.19,.43,16),copper,x,1.03,.22);ball(g,'#deb66c',x,1.27,.22,.026);}
  for(const x of [-.26,.26]){cylinder(g,brick,x,1.12,-.18,.092,.37);mesh(g,new T.ConeGeometry(.13,.30,16),copper,x,1.43,-.18);}
  cylinder(g,'#c0b195',0,1.64,0,.009,.33);box(g,'#ed806a',.062,1.74,0,.12,.07,.009,.003);
 },.86);
 place({iso:124,name:'Peggy’s Cove lighthouse',x:-63.918,y:44.491,type:'peggys-cove',description:'A white octagonal lighthouse with a red lantern, standing on the rounded granite of Nova Scotia’s Atlantic coast.',window:'Summer to early autumn for a coastal trip. Stay on dry rocks, well back from the water.',url:'https://novascotia.com/listing/peggys-cove-lighthouse-and-village/'},g=>{
  for(const [x,z,w,h,d] of [[0,0,.62,.15,.52],[-.54,.15,.32,.12,.27],[.49,.21,.31,.10,.28],[.27,-.38,.36,.12,.27]])ball(g,'#b6b6aa',x,h*.65,z,w,h,d);
  mesh(g,new T.CylinderGeometry(.17,.25,1.05,8),'#fff4dd',0,.69,0);
  box(g,'#5e7877',0,.37,.234,.09,.25,.015,.002);box(g,'#6a9294',0,.84,.194,.075,.12,.014,.002);
  cylinder(g,'#cc7367',0,1.23,0,.26,.065);cylinder(g,'#517f89',0,1.35,0,.175,.20);cylinder(g,'#d98170',0,1.48,0,.24,.06);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;cylinder(g,'#d57869',Math.cos(a)*.174,1.35,Math.sin(a)*.174,.012,.22);cylinder(g,'#f4e4c8',Math.cos(a)*.248,1.30,Math.sin(a)*.248,.008,.14);}
  const rail=Array.from({length:33},(_,i)=>[Math.cos(i*Math.PI/16)*.25,1.37,Math.sin(i*Math.PI/16)*.25]);tube(g,rail,'#f4e4c8',.009);
  mesh(g,new T.ConeGeometry(.26,.19,8),'#d57768',0,1.605,0);ball(g,'#ca7667',0,1.72,0,.026,.055,.026);
 },.88);

 function sunShape(g){ball(g,'#ffd65a',0,0,0,.34,.34,.10);for(let i=0;i<12;i++){const a=i*Math.PI/6;const o=box(g,'#ffdd74',Math.cos(a)*.53,Math.sin(a)*.53,0,.065,.17,.075,.025);o.rotation.z=a-Math.PI/2;}billboards.push(g);}
 function fir(g,snow=false){cylinder(g,'#a3825e',0,.3,0,.045,.6);for(let i=0;i<3;i++)mesh(g,new T.CylinderGeometry(.015,.25-i*.045,.34,14),snow&&i===2?'#f1f5e6':'#579776',0,.35+i*.21,0);}
 function flower(g,x,z,c){cylinder(g,'#669773',x,.10,z,.010,.20);for(let i=0;i<5;i++){const a=i*Math.PI*.4;ball(g,c,x+Math.cos(a)*.045,.21,z+Math.sin(a)*.045,.035,.016,.028);}ball(g,'#f9d376',x,.228,z,.019);}
 for(const original of experiences){const rec=original.type==='autumn'?{...original,x:134.95,y:35.4}:original;if(rec.type==='blossom')continue;place(rec,g=>{
  const t=rec.type;if(t==='sun'){sunShape(g);g.userData.float=true;}
  if(t==='tulips'||t==='flowers'){for(let i=0;i<6;i++)for(let j=0;j<4;j++){const x=(i-2.5)*.13,z=(j-1.5)*.12;if(t==='flowers')flower(g,x,z,(i+j)%2?'#eca88b':'#f5d67c');else{cylinder(g,'#619875',x,.12,z,.009,.24);for(let k=0;k<3;k++){const a=k*2.094;ball(g,['#f2a4aa','#ffe6a0','#d998be'][j%3],x+Math.cos(a)*.025,.27,z+Math.sin(a)*.025,.03,.049,.026);}}}}
  if(t==='puffin'){for(const x of [-.18,.18]){ball(g,'#526365',x,.22,0,.10,.18,.10);ball(g,'#f8f4e6',x,.20,.064,.073,.13,.045);ball(g,'#3b4c50',x,.40,0,.087);ball(g,'#f9f0dc',x,.42,.057,.069,.065,.032);const b=mesh(g,new T.ConeGeometry(.064,.14,3),'#edaa64',x,.38,.13);b.rotation.x=Math.PI/2;for(const dx of [-.05,.05])ball(g,'#efb269',x+dx,.025,.035,.037,.025,.062);ball(g,'#34464b',x-.03,.435,.082,.012);}}
  if(t==='herd'||t==='calves'){wildebeest(g,-.2,0,t==='calves'?.55:.8);wildebeest(g,.27,.18,t==='calves'?.3:.62);}
  if(t==='winter'){fir(g,true);box(g,'#839987',.38,.06,.03,.47,.12,.36,.04);ball(g,'#91c9c3',.38,.13,.03,.18,.025,.13);for(let i=0;i<3;i++)tube(g,[[.3+i*.08,.2,.02],[.28+i*.08,.32,.02],[.31+i*.08,.43,.02]],'#d9e7d8',.013);}
  if(t==='summer'||t==='autumn'){cylinder(g,'#a18464',0,.25,0,.037,.5);for(const [x,y,z] of [[-.12,.40,0],[.12,.44,.02],[0,.55,0]]){tube(g,[[0,.23,0],[x,y,z]],'#a18464',.018);ball(g,t==='autumn'?'#edb278':'#76b981',x,y,z,.17,.14,.16);}if(t==='summer')for(let i=0;i<4;i++)flower(g,.25+i*.09,.18,'#aaa4dc');}
  if(t==='aurora'){for(let j=0;j<3;j++){const pts=Array.from({length:18},(_,i)=>[(i-8.5)*.12,1.0+Math.sin(i*.44+j)*.13,-.08*j]);tube(g,pts,['#80d7b3','#a6c8d9','#b4dfa4'][j],.027);}fir(g,true);}
 },rec.type==='herd'?.75:rec.type==='calves'?.8:1);}
 for(const rec of beachTowns)place(rec,g=>{cylinder(g,'#b49b76',0,.16,0,.012,.32);for(let i=0;i<8;i++){const geo=new T.SphereGeometry(.15,3,3,i*Math.PI/4,Math.PI/4,0,Math.PI/2);mesh(g,geo,i%2?'#f6e4b6':'#ecad80',0,.30,0,1,.38,1);}box(g,ivory,.17,.045,.03,.065,.03,.19,.008);},1);
 const monsoons=[
  {iso:356,x:73,y:17,months:[6,7,8,9],name:'India southwest monsoon',window:'June to September. Onset and retreat vary across India; the southeast has a separate autumn rainy season.',url:'https://mausamjournal.imd.gov.in/index.php/MAUSAM/article/view/7776'},
  {iso:764,x:97,y:12,months:[5,6,7,8,9,10],name:'Thailand southwest monsoon',window:'About mid-May to mid-October for much of Thailand. The southern Gulf coast stays wet later in the year.',url:'https://www5.tmd.go.th/info/ฤดูกาล-ฤดูกาลของโลก-ฤดูกาลของประเทศไทย'},
  {iso:608,x:119,y:17,months:[5,6,7,8,9],name:'Philippines southwest monsoon',window:'May to September, especially western areas exposed to Habagat. Eastern areas have different rainfall patterns.',url:'https://www.pagasa.dost.gov.ph/climate/climate-advisories'},
  {iso:392,x:142,y:32,months:[6,7],name:'Japan Baiu rainy season',shortLabel:'Rainy season',window:'June to July across much of mainland Japan. Okinawa starts earlier; Hokkaido has no regular Baiu season.',url:'https://www.data.jma.go.jp/cpd/longfcst/en/tourist_japan.html'},
  {iso:158,x:125,y:24,months:[5,6],name:'Taiwan Mei-yu rainy season',shortLabel:'Rainy season',window:'May to June, before the later summer rains.',url:'https://www.cwa.gov.tw/Data/service/Newsbb/EN/Newsbb_20250429112150.pdf'}
 ];
 for(const r of monsoons){
  const rec={...r,type:'monsoon',description:'Rain clouds mark the usual monsoon or seasonal rainy period. Timing and rainfall vary by region and year; the map shows a planning season, not a live forecast.'};
  const g=place(rec,g=>{
   // Overlapping rounded lobes create a full cloud with a scalloped silhouette.
   // A single neutral material lets the lighting supply the depth and shading.
   for(const [x,y,z,rx,ry,rz] of [
    [-.72,.12,-.05,.36,.31,.32],[-.35,.32,-.08,.47,.46,.40],
    [.13,.43,-.12,.49,.52,.43],[.56,.27,-.08,.43,.40,.35],[.86,.06,0,.28,.25,.27],
    [-.69,-.03,.14,.29,.24,.28],[-.31,.01,.22,.38,.29,.35],[.09,.03,.28,.40,.32,.36],
    [.49,.0,.21,.35,.27,.30],[-.13,.64,-.02,.23,.25,.25],[.50,.48,.06,.23,.24,.25],
    [-.49,.39,.17,.22,.24,.22],[.20,.29,.43,.24,.25,.24]
   ])ball(g,'#f5f5ef',x,y,z,rx,ry,rz);
  },.95,3.1);
  g.traverse(o=>{if(o.isMesh)o.receiveShadow=false;});
  const drops=new T.Group();g.add(drops);
  // A rounded teardrop profile, with a fine pointed tip and a fuller base.
  const dropGeometry=new T.LatheGeometry([[0,-.11],[.04,-.09],[.056,-.045],[.046,.01],[.027,.065],[0,.14]].map(([r,y])=>new T.Vector2(r,y)),12);
  for(let i=0;i<7;i++)mesh(drops,dropGeometry.clone(),'#6a9eac',-.72+i*.24,-.45-(i%3)*.18,.12);
  dropGeometry.dispose();
  monsoonRain.push({g,drops});
 }
 const typhoonSeasons=[
  {iso:608,x:132,y:12,months:[7,8,9,10],name:'Philippines typhoon season',window:'July to October is the peak season.',url:'https://www.pagasa.dost.gov.ph/climate/tropical-cyclone-information'},
  {iso:392,x:149,y:29,months:[7,8,9,10],name:'Japan typhoon season',window:'July to October has the most typhoon approaches.',url:'https://www.jma.go.jp/jma/kishou/know/typhoon/1-4.html'},
  {iso:158,x:130,y:24,months:[7,8,9,10],name:'Taiwan typhoon season',window:'July to October is the most active period in the western North Pacific.',url:'https://climate.cwa.gov.tw/ClimatePedia/detail_page/14'}
 ];
 for(const r of typhoonSeasons){
  const rec={...r,type:'typhoon',description:'The spiral marks recurring typhoon risk. This can overlap with monsoon rain. It represents a typical season, not a live storm position or forecast.'};
  const g=place(rec,g=>{
   for(let arm=0;arm<2;arm++)for(let i=0;i<24;i++){
    const t=i/23,a=arm*Math.PI+t*4.8,rr=.44+t*1.03,radius=.24-.12*t;
    const x=Math.cos(a)*rr,z=Math.sin(a)*rr;
    ball(g,'#8298b4',x,-.025,z,radius*1.16,.17,radius*1.16);
    ball(g,'#fcfaf1',x,.11+Math.sin(t*Math.PI)*.06,z,radius,.15,radius);
   }
  },.9,2.5);typhoons.push(g);
 }
 const locations=[[124,-100,57],[840,-101,36],[76,-53,-9],[826,-3,54],[156,108,35],[356,81,24],[392,141,38],[608,124,12],[36,133,-25],[710,25,-29]];
 for(const [iso,x,y] of locations){const rec=data.find(r=>r.iso===iso);if(!rec)continue;const host=new T.Group();host.position.set(x,ground(iso,x,y)+2.3,-y);scene.add(host);const cloud=new T.Group();host.add(cloud);for(const [xx,yy,r] of [[-.35,0,.26],[0,.12,.34],[.35,0,.24]])ball(cloud,'#f7f3e8',xx,yy,0,r,r*.65,r*.75);pack(cloud);const drops=new T.Group(),flakes=new T.Group(),sun=new T.Group();host.add(drops,flakes,sun);sunShape(sun);for(let i=0;i<7;i++){const x=(i%4-1.5)*.17,z=Math.floor(i/4)*.2;const drop=ball(drops,'#75b9d5',x,-.22-(i%3)*.12,z,.025,.09,.025);ball(flakes,'#fff9ed',x,-.22-(i%3)*.12,z,.046);}weather.push({host,cloud,drops,flakes,sun,rec});}
 return {items,interactive,makeSun(){},update(month,distance,time,motion,camera){
  let transitioning=false;
  for(const g of items){
   const show=(!g.userData.months||g.userData.months.includes(month+1))&&(g.userData.type!=='beach'||distance<80);
   const size=g.userData.type==='typhoon'?T.MathUtils.clamp(distance/150,1,1.5):g.userData.type==='monsoon'?T.MathUtils.clamp(distance/85,1,3):1;
   transitioning=reveal(g,show,size)||transitioning;
   if(g.userData.type==='sun')g.position.y=ground(g.userData.iso,g.userData.x,g.userData.y)+1.9;
  }
  for(const g of typhoons)if(g.visible&&motion)g.rotation.y=time*.15;
  for(const {g,drops} of monsoonRain){g.quaternion.copy(camera.quaternion);if(g.visible&&motion)drops.children.forEach((drop,i)=>{drop.position.y=-.32-((time*.48+i*.17)%.75);});}
  for(const g of billboards)g.quaternion.copy(camera.quaternion);
  for(const w of weather){
   const rain=w.rec.pr[month]>=140,snow=w.rec.hi[month]<=5;
   for(const [object,show] of [[w.cloud,rain||snow],[w.drops,rain&&!snow],[w.flakes,snow],[w.sun,!rain&&!snow],[w.host,distance<180]])transitioning=reveal(object,show)||transitioning;
   if(motion){w.drops.position.y=-(time*.18% .22);w.flakes.position.y=-(time*.06% .18);}
  }
  return transitioning;
 }};
}
