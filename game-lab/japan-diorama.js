/**
 * Japan / Island Journey — original procedural low-poly landscape.
 * Illustrative landscape, not accurate geographic terrain.
 * No imports, external assets, DOM, timers, or application dependencies.
 * Call createJapanDiorama(THREE) with Three.js r170 or compatible.
 */
export function createJapanDiorama(THREE) {
  const root = new THREE.Group();
  root.name = 'Japan — illustrative low-poly landscape';
  root.userData = {
    title: 'Japan / Island Journey',
    description: 'An original illustrative landscape inspired by Mount Fuji and Japanese towns; not accurate geographic terrain.',
    recommendedCamera: { position: [25, 23, 30], target: [0, 2, 0] },
    waterLevel: 0,
    seed: 41021,
  };
  let seed = 41021;
  const random = () => ((seed = (Math.imul(1664525, seed) + 1013904223) >>> 0) / 4294967296);
  const choose = values => values[Math.floor(random() * values.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const bins = new Map();
  const colors = new Map();
  function color(hex) {
    if (!colors.has(hex)) colors.set(hex, new THREE.Color(hex));
    return colors.get(hex);
  }
  function bin(name) {
    if (!bins.has(name)) bins.set(name, { positions: [], colors: [] });
    return bins.get(name);
  }
  function triangle(name, a, b, c, hex, variation = 0) {
    const out = bin(name), col = color(hex), tint = 1 + (random() - .5) * variation;
    out.positions.push(...a, ...b, ...c);
    for (let i = 0; i < 3; i++) out.colors.push(col.r * tint, col.g * tint, col.b * tint);
  }
  function topTriangle(name, a, b, c, hex, variation = 0) {
    if ((b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]) > 0) triangle(name, a, b, c, hex, variation);
    else triangle(name, a, c, b, hex, variation);
  }
  const primitiveCache = new Map();
  function primitive(kind) {
    if (!primitiveCache.has(kind)) {
      const geometry = kind === 'box' ? new THREE.BoxGeometry(1, 1, 1)
        : kind === 'cone' ? new THREE.ConeGeometry(1, 1, 7, 1)
        : kind === 'trunk' ? new THREE.CylinderGeometry(.76, 1, 1, 6)
        : kind === 'round' ? new THREE.IcosahedronGeometry(1, 0)
        : new THREE.DodecahedronGeometry(1, 0);
      primitiveCache.set(kind, geometry.index ? geometry.toNonIndexed() : geometry);
      if (geometry.index) geometry.dispose();
    }
    return primitiveCache.get(kind);
  }
  const transform = new THREE.Matrix4();
  const euler = new THREE.Euler();
  const quaternion = new THREE.Quaternion();
  const vector = new THREE.Vector3();
  const translation = new THREE.Vector3();
  const scaling = new THREE.Vector3();
  function solid(name, kind, xyz, size, hex, rotation = 0, variation = .08) {
    const geometry = primitive(kind), positions = geometry.getAttribute('position');
    euler.set(0, rotation, 0); quaternion.setFromEuler(euler);
    transform.compose(translation.fromArray(xyz), quaternion, scaling.fromArray(size));
    for (let i = 0; i < positions.count; i += 3) {
      const points = [];
      for (let j = 0; j < 3; j++) points.push(vector.fromBufferAttribute(positions, i + j).applyMatrix4(transform).toArray());
      triangle(name, ...points, hex, variation);
    }
  }

  // An irregular, stratified island with triangulated, gently rolling meadow.
  const coastCount = 44;
  const rim = Array.from({ length: coastCount }, (_, i) => {
    const theta = i / coastCount * Math.PI * 2;
    const radius = 1 + .045 * Math.sin(theta * 5 + .3) + .025 * Math.cos(theta * 9);
    return [Math.cos(theta) * 14.2 * radius, Math.sin(theta) * 9.05 * radius];
  });
  const river = [[2.3,-3.7,.75,1.24],[3.0,-2,.74,1.65],[3.4,-.1,.73,1.65],[4.8,1.5,.7,.92],[5.1,3.15,.62,.77],[6.7,4.75,.46,.83],[7.6,6.45,.25,.98],[8.0,8.8,-.13,1.2]];
  function riverSample(x, z) {
    let best = { distance: Infinity, y: .7, width: 1 };
    for (let i = 0; i < river.length - 1; i++) {
      const a = river[i], b = river[i+1], dx = b[0]-a[0], dz = b[1]-a[1];
      const t = clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);
      const distance = Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);
      if (distance < best.distance) best = { distance, y: lerp(a[2],b[2],t), width: lerp(a[3],b[3],t) };
    }
    return best;
  }
  function terrainHeight(x, z) {
    const edge = Math.hypot(x/14.2,z/9.05);
    let y = 1.05 + .095 * Math.sin(x*.65) * Math.cos(z*.7) + .17*Math.exp(-((x+9)**2+(z-1)**2)/12);
    y -= .35 * clamp((edge-.73)/.27,0,1);
    const r = riverSample(x,z), blend = clamp((r.distance-r.width)/(1.0),0,1);
    return lerp(r.y-.075,y,blend);
  }
  function isInside(x, z, inset = 0) {
    let inside = false;
    const scaledX = x/(1-inset), scaledZ = z/(1-inset);
    for (let i=0,j=rim.length-1;i<rim.length;j=i++) {
      const [xi,zi]=rim[i], [xj,zj]=rim[j];
      if (((zi>scaledZ)!==(zj>scaledZ)) && (scaledX<(xj-xi)*(scaledZ-zi)/(zj-zi)+xi)) inside=!inside;
    }
    return inside;
  }
  const cliffLayers = [
    { radius: 1, y: -.72, color: '#526b69' },
    { radius: 1.026, y: -.10, color: '#75908a' },
    { radius: 1.015, y: .31, color: '#acb09a' },
    { radius: 1.001, y: .57, color: '#dfcea0' },
    { radius: .975, y: .73, color: '#ddcda0' },
  ];
  function coastHeight(x,z,y) {
    const sample=riverSample(x,z);
    const carve=z>5.5 ? clamp((sample.width+.60-sample.distance)/.60,0,1) : 0;
    return lerp(y,Math.min(y,sample.y-.03),carve);
  }
  for (let layer=0;layer<cliffLayers.length-1;layer++) {
    const a=cliffLayers[layer],b=cliffLayers[layer+1];
    for (let i=0;i<coastCount;i++) {
      const j=(i+1)%coastCount, p=rim[i],q=rim[j];
      const yA=a.y+.07*Math.sin(i*2.4),yB=b.y+.05*Math.sin(i*2.4);
      const p0=[p[0]*a.radius,coastHeight(...p,yA),p[1]*a.radius],q0=[q[0]*a.radius,coastHeight(...q,a.y+.07*Math.sin(j*2.4)),q[1]*a.radius];
      const p1=[p[0]*b.radius,coastHeight(...p,yB),p[1]*b.radius],q1=[q[0]*b.radius,coastHeight(...q,b.y+.05*Math.sin(j*2.4)),q[1]*b.radius];
      triangle('coast',p0,p1,q0,b.color,.16); triangle('coast',q0,p1,q1,b.color,.16);
    }
  }
  // Bowyer-Watson triangulation adds real internal facets instead of a radial fan.
  function triangulate(points) {
    const pts=points.concat([[-100,-70],[100,-70],[0,100]]), count=points.length;
    let tris=[[count,count+1,count+2]];
    function inCircle(p,t) {
      const a=pts[t[0]],b=pts[t[1]],c=pts[t[2]], ax=a[0]-p[0],az=a[1]-p[1],bx=b[0]-p[0],bz=b[1]-p[1],cx=c[0]-p[0],cz=c[1]-p[1];
      const det=(ax*ax+az*az)*(bx*cz-cx*bz)-(bx*bx+bz*bz)*(ax*cz-cx*az)+(cx*cx+cz*cz)*(ax*bz-bx*az);
      const winding=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
      return winding>0 ? det>1e-9 : det< -1e-9;
    }
    for (let i=0;i<count;i++) {
      const bad=tris.filter(t=>inCircle(pts[i],t)), edges=new Map();
      for (const t of bad) for (let j=0;j<3;j++) {
        const a=t[j],b=t[(j+1)%3],key=a<b?`${a},${b}`:`${b},${a}`;
        if(edges.has(key))edges.delete(key);else edges.set(key,[a,b]);
      }
      const removed=new Set(bad);tris=tris.filter(t=>!removed.has(t));
      for (const [a,b] of edges.values()) tris.push([a,b,i]);
    }
    return tris.filter(t=>t.every(i=>i<count));
  }
  const groundPoints=rim.map(([x,z])=>[x*.975,z*.975]);
  for(let z=-7.8;z<8;z+=1.15) for(let x=-13;x<13.2;x+=1.3) {
    const px=x+(random()-.5)*.55,pz=z+(random()-.5)*.5;
    if(isInside(px,pz,.035))groundPoints.push([px,pz]);
  }
  for(const t of triangulate(groundPoints)) {
    const vertices=t.map(i=>groundPoints[i]);
    const x=vertices.reduce((s,p)=>s+p[0],0)/3,z=vertices.reduce((s,p)=>s+p[1],0)/3;
    if(!isInside(x,z,.015))continue;
    const r=riverSample(x,z);
    const hex=r.distance<r.width+.65 ? choose(['#bdc58f','#c3cd99','#b5c48f']) : choose(['#89b56d','#91ba72','#98bf79','#8ab170','#a0c580']);
    topTriangle('meadow',...vertices.map(([vx,vz])=>[vx,terrainHeight(vx,vz),vz]),hex,.035);
  }

  // Water occupies its own mesh; the broad shallow disk is part of the diorama.
  const oceanSides=72;
  for(let i=0;i<oceanSides;i++) {
    const a=i/oceanSides*Math.PI*2,b=(i+1)/oceanSides*Math.PI*2;
    const p=[Math.cos(a)*18.3,-.03,Math.sin(a)*13.4],q=[Math.cos(b)*18.3,-.03,Math.sin(b)*13.4];
    topTriangle('ocean',[0,-.03,0],p,q,'#60cbd0');
    triangle('ocean-edge',p,[p[0],-.37,p[2]],q,'#379eac');
    triangle('ocean-edge',q,[p[0],-.37,p[2]],[q[0],-.37,q[2]],'#379eac');
  }
  for(let i=0;i<coastCount;i++) {
    const j=(i+1)%coastCount;
    const p=rim[i],q=rim[j];
    topTriangle('shallows',[p[0]*1.10,.001,p[1]*1.10],[p[0]*1.035,.001,p[1]*1.035],[q[0]*1.10,.001,q[1]*1.10],'#86ded3');
    topTriangle('shallows',[q[0]*1.10,.001,q[1]*1.10],[p[0]*1.035,.001,p[1]*1.035],[q[0]*1.035,.001,q[1]*1.035],'#86ded3');
  }
  const riverBanks = river.map((p,i) => {
    const a=river[Math.max(0,i-1)],b=river[Math.min(river.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
    return [[p[0]-dz/len*p[3],p[2]+.01,p[1]+dx/len*p[3]],[p[0]+dz/len*p[3],p[2]+.01,p[1]-dx/len*p[3]]];
  });
  for(let i=0;i<riverBanks.length-1;i++) {
    const [a,b]=riverBanks[i],[c,d]=riverBanks[i+1];
    topTriangle('river',a,b,c, i<3?'#51bdb4':'#49b7b6');
    topTriangle('river',b,d,c, i<3?'#58c8be':'#4cbdba');
  }
  function ribbon(name, points, width, hex, sampleGround = true) {
    for(let i=0;i<points.length-1;i++) {
      const a=points[i],b=points[i+1],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
      const offset=[-dz/len*width*.5,dx/len*width*.5];
      const v=(p,k)=>[p[0]+offset[0]*k,sampleGround?terrainHeight(p[0]+offset[0]*k,p[1]+offset[1]*k)+.028:(p[2]||.035),p[1]+offset[1]*k];
      topTriangle(name,v(a,1),v(a,-1),v(b,1),hex);topTriangle(name,v(a,-1),v(b,-1),v(b,1),hex);
    }
  }
  // Small, broken highlights give water scale without looking like a grid.
  for(const [x,z,len] of [[-12,10.5,2.1],[-8,11.7,1.3],[-2,11.8,2.4],[5,10.8,1.4],[12,8,1.9],[15,3.3,1.6],[14,-6.5,1.2],[-16,-1,1.7],[-13,-8.6,1.8],[2,-11.0,1.7],[-4,-11.6,1.2]]) {
    ribbon('water-glints',[[x-len*.5,z,.025],[x+len*.5,z,.025]],.05,'#b6eee5',false);
  }
  ribbon('water-glints',[[2.55,-1.8,.765],[3.6,-1.6,.765]],.055,'#a8e5d6',false);
  ribbon('water-glints',[[3.25,-.6,.755],[4.05,-.45,.755]],.045,'#a8e5d6',false);

  // Fuji's deliberately broad profile, split angular faces, irregular snow line.
  const fujiX=-4.35,fujiZ=-3.4,sides=22;
  const mountainRings=[{r:5.3,y:1.07},{r:4.5,y:2.05},{r:3.35,y:3.43},{r:2.36,y:4.89},{r:1.56,y:6.14},{r:1.03,y:7.00},{r:.60,y:7.93},{r:.40,y:8.28}];
  const mountain=mountainRings.map((ring,k)=>Array.from({length:sides},(_,i)=>{
    const theta=i/sides*Math.PI*2,noise=Math.sin(i*2.5+1)*.045+Math.cos(i*1.2)*.022;
    return [fujiX+Math.cos(theta)*ring.r*(1+noise),ring.y+(k===0?0:Math.sin(i*1.71+k*.22)*.10),fujiZ+Math.sin(theta)*ring.r*(1+noise)];
  }));
  const mountainPalette=['#719986','#6b927f','#80a18b','#8daa92','#76978a','#84a799'];
  for(let k=0;k<mountain.length-1;k++)for(let i=0;i<sides;i++) {
    const j=(i+1)%sides,a=mountain[k][i],b=mountain[k][j],c=mountain[k+1][i],d=mountain[k+1][j];
    const palette=k>=5?['#fbf8e9','#e1eee8','#f3f5e9','#dbe9e6']:mountainPalette;
    topTriangle('fuji',a,b,c,choose(palette),.07);topTriangle('fuji',b,d,c,choose(palette),.07);
  }
  for(let i=0;i<sides;i++) {
    const j=(i+1)%sides,a=mountain[4][i],b=mountain[4][j],c=mountain[5][i],d=mountain[5][j];
    const t=.28+.25*(.5+.5*Math.sin(i*2.2)),u=.25+.36*(.5+.5*Math.cos(j*1.7));
    const e=a.map((v,k)=>lerp(v,c[k],t)),f=b.map((v,k)=>lerp(v,d[k],u));
    e[0]+=(e[0]-fujiX)*.006;e[2]+=(e[2]-fujiZ)*.006;
    f[0]+=(f[0]-fujiX)*.006;f[2]+=(f[2]-fujiZ)*.006;
    topTriangle('snow',e,f,c,choose(['#fbf8e9','#eaf1e9','#e0ebe5']),.035);topTriangle('snow',f,d,c,'#f0f3e8',.035);
    const summit=mountain[7];
    topTriangle('snow',summit[i],summit[j],[fujiX,8.22,fujiZ],'#e1eae3',.05);
  }

  // Smoothly nested faceted hills frame the scene without competing with Fuji.
  function hill(x,z,rx,rz,height,hex) {
    const count=11,ys=[0,.50,.81,1],rs=[1,.76,.40,0];
    for(let k=0;k<3;k++)for(let i=0;i<count;i++) {
      const p=(level,index)=>{
        const theta=index/count*Math.PI*2,shift=level*.11;
        return [x+Math.cos(theta+shift)*rx*rs[level],terrainHeight(x,z)-.1+height*ys[level]+(level===0||level===3?0:Math.sin(index*1.8)*.06),z+Math.sin(theta+shift)*rz*rs[level]];
      };
      topTriangle('hills',p(k,i),p(k,i+1),p(k+1,i),hex,.24);
      if(k<2)topTriangle('hills',p(k,i+1),p(k+1,i+1),p(k+1,i),hex,.24);
    }
  }
  hill(-10.25,-2.65,3.7,3.6,2.6,'#68996d');
  hill(-8.2,-6.45,2.9,2.1,2.2,'#7baa75');
  hill(8.2,-4.5,4.45,3.0,3.4,'#75a473');
  hill(11.0,-1.45,2.0,2.5,1.75,'#8bb174');
  hill(.3,-6.2,2.8,2.1,1.8,'#76a47b');

  // Warm sand paths leave generous unoccupied foreground between settlements.
  ribbon('paths',[[-8,4.9],[-5.4,4.25],[-2.7,3.8],[0,3.15],[3.2,3.2],[4.05,3.35]],.47,'#e9d7a9');
  ribbon('paths',[[6.05,3.35],[7.5,2.6],[8.0,.6],[7.35,-.6]],.43,'#e9d7a9');
  ribbon('paths',[[-2.7,3.8],[-2.0,1.85],[-1.2,.75]],.34,'#e9d7a9');
  ribbon('paths',[[.4,3.1],[1.15,4.8],[1.65,6.45]],.34,'#e9d7a9');

  function localPoint(x,z,y,dx,dz,rotation) {
    return [x+Math.cos(rotation)*dx+Math.sin(rotation)*dz,y,z-Math.sin(rotation)*dx+Math.cos(rotation)*dz];
  }
  // Hipped roofs with swept corners. Each tier is structural 3D geometry.
  function roof(x,z,y,width,depth,height,rotation,hex) {
    const corners=[[-width/2,-depth/2],[width/2,-depth/2],[width/2,depth/2],[-width/2,depth/2]];
    const rim=corners.map(([dx,dz])=>localPoint(x,z,y+.09,dx,dz,rotation));
    const inner=corners.map(([dx,dz])=>localPoint(x,z,y+.12,dx*.79,dz*.76,rotation));
    const ridgeA=localPoint(x,z,y+height,-width*.20,0,rotation),ridgeB=localPoint(x,z,y+height,width*.20,0,rotation);
    for(let i=0;i<4;i++) {
      const j=(i+1)%4;topTriangle('roofs',rim[i],rim[j],inner[i],hex,.04);topTriangle('roofs',rim[j],inner[j],inner[i],hex,.04);
    }
    topTriangle('roofs',inner[0],inner[1],ridgeA,hex,.04);topTriangle('roofs',inner[1],ridgeB,ridgeA,hex,.04);
    topTriangle('roofs',inner[2],inner[3],ridgeB,hex,.04);topTriangle('roofs',inner[3],ridgeA,ridgeB,hex,.04);
    topTriangle('roofs',inner[1],inner[2],ridgeB,hex,.04);topTriangle('roofs',inner[3],inner[0],ridgeA,hex,.04);
    solid('roofs','box',localPoint(x,z,y+height+.035,0,0,rotation),[width*.49,.08,.10],'#354f50',rotation,0);
    for(let i=0;i<4;i++) {
      const a=rim[i],b=rim[(i+1)%4],a0=[a[0],a[1]-.065,a[2]],b0=[b[0],b[1]-.065,b[2]];
      triangle('roofs',a,b,a0,'#30494a');triangle('roofs',a0,b,b0,'#30494a');
    }
  }
  function house(x,z,width=1.35,depth=1.08,rotation=0,wall='#f1e4c3',roofHex='#536f70') {
    const y=terrainHeight(x,z),h=.80;
    solid('buildings','box',[x,y+.065,z],[width+.15,.17,depth+.15],'#bcb89d',rotation);
    solid('buildings','box',[x,y+h*.5+.12,z],[width,h,depth],wall,rotation,.02);
    for(const dx of [-width*.44,width*.44])solid('buildings','box',localPoint(x,z,y+.54,dx,depth*.506,rotation),[.055,.87,.065],'#705a49',rotation,0);
    solid('buildings','box',localPoint(x,z,y+.4,0,depth*.512,rotation),[.27,.56,.045],'#675b4c',rotation,0);
    for(const dx of [-width*.29,width*.29]) {
      solid('buildings','box',localPoint(x,z,y+.64,dx,depth*.522,rotation),[.19,.24,.025],'#86a3a0',rotation,0);
      solid('buildings','box',localPoint(x,z,y+.64,dx,depth*.54,rotation),[.025,.25,.025],'#ede3bf',rotation,0);
    }
    roof(x,z,y+.97,width+.36,depth+.35,.45,rotation,roofHex);
  }
  house(-5.25,3.1,1.3,1.08,.09);
  house(-3.5,2.6,1.20,1.02,-.15,'#eddfba','#577275');
  house(-6.65,4.25,1.1,.98,.12,'#ead8b1','#956b55');
  house(-4.5,5.48,1.45,1.1,-.09,'#f2e6c8','#536c70');
  house(-2.4,5.15,1.15,.95,.06,'#e9d9b7','#6a7d73');
  house(8.5,2.7,1.15,.95,-.28,'#eadbb8','#607b76');
  house(9.3,1.05,1.05,.90,-.28,'#f0e3c1','#697c70');

  // A modest temple complex is the architectural focal point across the river.
  const templeX=7.25,templeZ=-.8,templeY=terrainHeight(templeX,templeZ),templeRotation=-.2;
  solid('buildings','box',[templeX,templeY+.11,templeZ],[2.2,.26,2.1],'#b8bc9f',templeRotation);
  for(let tier=0;tier<3;tier++) {
    const w=1.48-tier*.29,d=1.40-tier*.27,y=templeY+.28+tier*.87;
    solid('buildings','box',[templeX,y+.32,templeZ],[w,.64,d],'#e7dcc0',templeRotation,.02);
    for(const dx of [-w*.42,w*.42])for(const dz of [-d*.43,d*.43])solid('buildings','box',localPoint(templeX,templeZ,y+.32,dx,dz,templeRotation),[.075,.68,.075],'#a14e3b',templeRotation,0);
    solid('buildings','box',localPoint(templeX,templeZ,y+.32,0,d*.506,templeRotation),[w*.55,.39,.025],'#826e56',templeRotation,0);
    roof(templeX,templeZ,y+.61,w+.72,d+.72,.42,templeRotation,'#3f6260');
  }
  solid('buildings','trunk',[templeX,templeY+3.49,templeZ],[.036,.62,.036],'#aa945e');
  for(let i=0;i<4;i++)solid('buildings','trunk',[templeX,templeY+3.22+i*.10,templeZ],[.095-i*.012,.035,.095-i*.012],'#b9a169');
  house(5.8,-.55,1.4,1.0,-.2,'#f0e2bd','#4d6c64');
  // Vermilion torii gate on the quiet near-bank trail.
  const gateX=1.1,gateZ=4.5,gateY=terrainHeight(gateX,gateZ);
  for(const dx of [-.55,.55]) {
    solid('details','trunk',[gateX+dx,gateY+.67,gateZ],[.07,1.34,.07],'#b7563a',0,0);
    solid('details','box',[gateX+dx,gateY+.11,gateZ],[.20,.22,.20],'#777d69');
  }
  solid('details','box',[gateX,gateY+1.25,gateZ],[1.46,.13,.17],'#b7563a',0,0);
  solid('details','box',[gateX,gateY+.98,gateZ],[1.32,.10,.12],'#c36b42',0,0);
  solid('details','box',[gateX,gateY+1.36,gateZ],[1.67,.105,.23],'#435750',0,0);

  // Timber footbridge over the stream, with visibly individual deck planks.
  const bridgeZ=3.28,bridgeY=.92;
  for(let i=0;i<14;i++) {
    const x=3.82+i*.18,arch=Math.sin(i/13*Math.PI)*.16;
    solid('details','box',[x,bridgeY+arch,bridgeZ],[.165,.11,.72],'#bc9469',0,.06);
  }
  for(const z of [bridgeZ-.40,bridgeZ+.40]) {
    for(const x of [3.82,4.58,5.36,6.16])solid('details','box',[x,bridgeY+.3,z],[.07,.60,.07],'#855f48');
    solid('details','box',[4.98,bridgeY+.54,z],[2.46,.065,.065],'#ac7c53');
  }

  function conifer(x,z,height,shade) {
    const y=terrainHeight(x,z),r=height*.30;
    solid('trees','trunk',[x,y+height*.27,z],[height*.055,height*.54,height*.055],'#816347');
    solid('trees','cone',[x,y+height*.48,z],[r,height*.67,r],shade,random()*6.28,.12);
    solid('trees','cone',[x,y+height*.73,z],[r*.72,height*.52,r*.72],shade,random()*6.28,.12);
    solid('trees','cone',[x,y+height*.96,z],[r*.42,height*.34,r*.42],shade,random()*6.28,.12);
  }
  function roundTree(x,z,height,shade) {
    const y=terrainHeight(x,z);
    solid('trees','trunk',[x,y+height*.36,z],[height*.055,height*.71,height*.055],'#85684b');
    solid('trees','round',[x,y+height*.76,z],[height*.36,height*.39,height*.35],shade,random()*6.28,.13);
    if(height>1.6)solid('trees','round',[x+height*.17,y+height*.68,z+.06],[height*.25,height*.28,height*.25],shade,random()*6.28,.13);
  }
  const forestShades=['#3c7656','#4d865c','#568d60','#427d5c','#629968'];
  const occupied=[[-5.2,3.8,2.7],[-3.0,4.8,1.8],[7.25,-.8,2.25],[8.7,1.9,1.7],[1.1,4.5,.95],[4.9,3.3,1.7]];
  const forestPatches=[[-10.3,3.0,2.2,2.8,17],[-7.8,.55,1.4,1.2,9],[-.5,-.5,1.6,1.4,9],[.2,6.2,1.6,1.6,7],[10.7,4.4,1.6,1.6,10],[11.8,-.6,1.0,1.6,8],[-9.5,-5.7,1.4,1.0,6],[-1,-7.7,2.7,.6,9]];
  const planted=[];
  for(const [cx,cz,rx,rz,count] of forestPatches)for(let i=0;i<count;i++) {
    const angle=random()*Math.PI*2,radius=Math.sqrt(random()),x=cx+Math.cos(angle)*rx*radius,z=cz+Math.sin(angle)*rz*radius;
    if(!isInside(x,z,.07)||riverSample(x,z).distance<riverSample(x,z).width+.48)continue;
    if(occupied.some(([a,b,r])=>Math.hypot(x-a,z-b)<r))continue;
    if(planted.some(([a,b])=>Math.hypot(x-a,z-b)<.43))continue;
    if(Math.hypot((x-fujiX)/5.2,(z-fujiZ)/5.2)<.94)continue;
    planted.push([x,z]);
    const height=1.12+random()*1.15;
    if(random()<.67)conifer(x,z,height,choose(forestShades));else roundTree(x,z,height,choose(['#83a963','#a1ba73','#6e9a62','#b4c67d']));
  }
  // Hand-placed trees establish a few recognizable silhouettes and soft spring color.
  conifer(-11.4,3.6,2.35,'#3c785b');conifer(-10.2,4.4,1.95,'#568d60');
  roundTree(-7.5,5.8,1.7,'#b6c57a');roundTree(-.9,5.7,1.6,'#a7bd71');
  roundTree(6.05,1.1,1.45,'#e7b6a5');roundTree(9.1,-.8,1.72,'#deb5a3');
  roundTree(-1.2,1.6,1.55,'#dcb4a0');
  conifer(10.0,5.65,1.9,'#4b875f');

  // Faceted stones and a small garden, kept sparse in the readable foreground.
  for(const [x,z,size] of [[-11.6,6.0,.40],[-10.9,6.4,.27],[-8.8,7.3,.33],[11.4,5.9,.4],[10.9,6.2,.28],[1.5,7.2,.28],[6.7,5.55,.25],[5.9,4.9,.20],[-.2,-1.45,.30],[2.1,.9,.25],[13.0,-.8,.35]]) {
    solid('details','rock',[x,terrainHeight(x,z)+size*.22,z],[size,size*.64,size*.79],choose(['#929e86','#9ca691','#aeb4a0']),random()*6.28,.14);
  }
  for(const [x,z] of [[6.15,.65],[7.8,1.0]]) {
    const y=terrainHeight(x,z);
    solid('details','box',[x,y+.11,z],[.30,.22,.30],'#a7ae97');
    solid('details','trunk',[x,y+.39,z],[.065,.44,.065],'#bbc0a8');
    solid('details','box',[x,y+.65,z],[.23,.20,.23],'#b6baa0');
    solid('details','cone',[x,y+.84,z],[.22,.19,.22],'#8d9e8c',Math.PI/4);
  }
  // A small offshore rock cluster and a single tiny fishing boat supply scale.
  for(const [x,z,size] of [[-13.8,7.8,.66],[-14.5,8.3,.40],[13.8,-5.9,.55]])solid('details','rock',[x,.02,z],[size,size*.74,size*.72],'#8eaba2',random()*6.28,.1);
  const boatX=11.9,boatZ=8.2;
  const hull=[[-.7,0],[-.44,-.24],[.48,-.22],[.77,0],[.48,.22],[-.44,.24]];
  for(let i=0;i<hull.length;i++) {
    const a=hull[i],b=hull[(i+1)%hull.length];
    topTriangle('details',[boatX,.08,boatZ],[boatX+a[0],.17,boatZ+a[1]],[boatX+b[0],.17,boatZ+b[1]],'#9e7754');
    triangle('details',[boatX+a[0],.17,boatZ+a[1]],[boatX+a[0]*.7,.03,boatZ+a[1]*.6],[boatX+b[0],.17,boatZ+b[1]],'#735c47');
  }
  solid('details','box',[boatX-.1,.20,boatZ],[.14,.05,.41],'#d9bd86');
  solid('details','box',[boatX+.25,.20,boatZ],[.13,.05,.39],'#d9bd86');

  let triangles=0;
  for(const [name,data] of bins) {
    if(!data.positions.length)continue;
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(data.positions,3));
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(data.colors,3));
    geometry.computeVertexNormals();geometry.computeBoundingSphere();geometry.computeBoundingBox();
    const material=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true,side:THREE.DoubleSide});
    const mesh=new THREE.Mesh(geometry,material);
    mesh.name=`Japan / ${name}`;
    mesh.castShadow=!['ocean','ocean-edge','shallows','river','water-glints','paths'].includes(name);
    mesh.receiveShadow=true;
    root.add(mesh);triangles+=data.positions.length/9;
  }
  for(const geometry of primitiveCache.values())geometry.dispose();
  root.userData.meshCount=root.children.length;
  root.userData.triangleCount=triangles;
  root.userData.dispose=()=>root.traverse(object=>{
    if(object.isMesh){object.geometry.dispose();object.material.dispose();}
  });
  return root;
}

export default createJapanDiorama;
