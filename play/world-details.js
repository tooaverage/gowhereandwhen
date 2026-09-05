import * as T from 'three';
const all=[1,2,3,4,5,6,7,8,9,10,11,12];
export const sights=[
 {iso:604,name:'Machu Picchu',x:-72.545,y:-13.164,type:'inca',description:'Spectacular Inca city surrounded by Andean peaks.',url:'https://whc.unesco.org/en/list/274/'},
 {iso:400,name:'Petra',x:35.444,y:30.329,type:'petra',description:'Monumental temples and tombs carved into rose-coloured rock.',url:'https://whc.unesco.org/en/list/326/'},
 {iso:356,name:'Taj Mahal',x:78.042,y:27.175,type:'taj',description:'One of the world’s finest examples of Mughal architecture.',url:'https://whc.unesco.org/en/list/252/'},
 {iso:156,name:'Great Wall',x:116.57,y:40.43,type:'wall',description:'Historic fortifications crossing dramatic landscapes.',url:'https://whc.unesco.org/en/list/438/'},
 {iso:116,name:'Angkor Wat',x:103.867,y:13.413,type:'angkor',description:'An enormous, intricately carved Khmer temple complex.',url:'https://whc.unesco.org/en/list/668/'},
 {iso:818,name:'Pyramids of Giza',x:31.134,y:29.979,type:'pyramids',description:'The last surviving Wonder of the Ancient World.',url:'https://whc.unesco.org/en/list/86/'},
 {iso:380,name:'Colosseum',x:12.492,y:41.89,type:'rome',description:'Layers of Roman, medieval and Renaissance history in Rome’s historic centre.',url:'https://whc.unesco.org/en/list/91/'},
 {iso:834,name:'Serengeti',x:34.83,y:-2.33,type:'safari',description:'Immense savannahs, abundant wildlife and the Great Migration.',url:'https://www.tanzaniatourism.go.tz/destination/serengeti/'},
 {iso:840,name:'Grand Canyon',x:-112.14,y:36.06,type:'canyon',description:'Extraordinary scale, geology and desert scenery.',url:'https://www.nps.gov/grca/index.htm'},
 {iso:36,name:'Great Barrier Reef',x:147.7,y:-18.3,type:'reef',description:'The world’s largest coral-reef ecosystem.',url:'https://www2.gbrmpa.gov.au/'}
];
export const experiences=[
 {iso:392,name:'Cherry blossoms',x:139.7,y:35.7,type:'blossom',months:[3,4],window:'Late March to early April',description:'Cherry-blossom viewing in Tokyo, Kyoto and Osaka. Bloom dates vary each year.',url:'https://www.japan.travel/en/gc/when-to-go/'},
 {iso:528,name:'Tulip fields',x:4.55,y:52.26,type:'tulips',months:[4,5],window:'Mid-April to early May',description:'Colourful flower fields around Lisse and Flevoland.',url:'https://www.holland.com/global/tourism/get-inspired/dutch-icons/tulip-season-in-the-netherlands'},
 {iso:246,name:'Northern Lights',x:27.02,y:68.9,type:'aurora',months:[8,9,10,11,12,1,2,3,4],window:'Late August to early April',description:'Dark, clear nights give you a chance of seeing the aurora in Lapland. Sightings are not guaranteed.',url:'https://www.visitfinland.com/en/cose-da-fare/northern-lights/'},
 {iso:578,name:'Midnight Sun',x:25.78,y:71.17,type:'sun',months:[5,6,7],window:'Mid-May to late July',description:'Long summer days at the North Cape. Svalbard’s midnight-sun period runs longer, from April into August.',url:'https://www.visitnorway.com/things-to-do/nature-attractions/midnight-sun/'},
 {iso:352,name:'Puffin cliffs',x:-20.27,y:63.43,type:'puffin',months:[5,6,7,8],window:'May to August',description:'Puffins nest around Iceland’s coastal cliffs. Many leave during August.',url:'https://www.visiticeland.com/article/meet-the-peculiar-puffins-in-iceland/'},
 {iso:404,name:'Migration crossings',x:35.05,y:-1.48,type:'herd',months:[7,8,9,10],window:'July to October',description:'The Maasai Mara migration season. River crossings depend on rain and animal movement.',url:'https://magicalkenya.com/'},
 {iso:834,name:'Wildebeest calves',x:34.99,y:-3.04,type:'calves',months:[1,2,3],window:'January to March',description:'Calving season on the southern Serengeti plains, especially around Ndutu.',url:'https://www.tanzaniaparks.go.tz/'},
 {iso:710,name:'Desert wildflowers',x:17.58,y:-30.16,type:'flowers',months:[8,9],window:'August to September',description:'Namaqualand’s flower season changes with winter rainfall.',url:'https://www.sanparks.org/parks/namaqua/what-to-do/activities/flower-season'},
 {iso:392,name:'Winter in Japan',x:138.1,y:36.7,type:'winter',months:[12,1,2],window:'December to February',description:'Snowy mountain escapes and warm onsen. Snow is regional, rather than typical of every Japanese city.',url:'https://www.japan.travel/national-parks/plan-your-visit/seasons-and-climate/'},
 {iso:392,name:'Summer greenery',x:139.1,y:35.1,type:'summer',months:[5,6,7,8],window:'May to August',description:'Fresh green leaves, hydrangeas in the rainy season, and summer evenings with lanterns.',url:'https://www.japan.travel/en/gc/when-to-go/'},
 {iso:392,name:'Autumn colours',x:135.8,y:35.1,type:'autumn',months:[9,10,11],window:'September to November, varying by region',description:'Autumn colour moves south from cooler regions. Kyoto and Tokyo often peak later in autumn.',url:'https://www.japan.travel/en/gc/when-to-go/'}
];
export const beachTowns=[{iso:608,name:'Boracay · beach town',x:121.924,y:11.967},{iso:608,name:'El Nido · beach town',x:119.395,y:11.18},{iso:608,name:'Siargao · surf & beaches',x:126.05,y:9.8},{iso:36,name:'Cairns · reef gateway',x:145.77,y:-16.92},{iso:36,name:'Gold Coast · beaches',x:153.43,y:-28},{iso:392,name:'Naha · island beaches nearby',x:127.68,y:26.21},{iso:764,name:'Phuket · beaches',x:98.3,y:7.88},{iso:360,name:'Bali · beaches',x:115.18,y:-8.65}].map(x=>({...x,type:'beach',description:'A coastal base for beach trips. Check local conditions before swimming.',months:all}));
export const australiaRegions=[
 {name:'Darwin',x:130.84,y:-12.46,s:[18,18,28,52,85,95,95,92,80,55,28,18]},
 {name:'Cairns',x:145.77,y:-16.92,s:[24,22,32,58,82,93,95,95,92,84,52,28]},
 {name:'Broome',x:122.24,y:-17.96,s:[20,20,30,55,85,95,95,90,78,55,30,22]},
 {name:'Perth',x:115.86,y:-31.95,s:[76,74,90,92,70,48,44,50,74,91,95,86]},
 {name:'Alice Springs',x:133.88,y:-23.7,s:[15,20,48,85,94,90,90,94,87,65,35,18]},
 {name:'Sydney',x:151.21,y:-33.87,s:[88,86,88,87,74,56,53,61,80,90,92,91]},
 {name:'Brisbane',x:153.03,y:-27.47,s:[58,55,68,88,92,86,85,91,96,91,77,63]},
 {name:'Melbourne',x:144.96,y:-37.81,s:[89,91,95,85,57,35,32,40,64,82,90,92]},
 {name:'Adelaide',x:138.6,y:-34.93,s:[75,78,94,92,65,42,39,49,74,91,94,85]},
 {name:'Hobart',x:147.33,y:-42.88,s:[95,95,88,70,44,28,27,35,58,76,88,95]}
];
export function regionalScore(x,y,m){let sum=0,w=0;for(const a of australiaRegions){const d=(x-a.x)**2+(y-a.y)**2;const weight=1/(d+1.5)**1.4;sum+=weight*a.s[m];w+=weight;}return sum/w;}
export function heatColor(score){const stops=[[0,'#df6559'],[25,'#ee9849'],[50,'#eed058'],[70,'#96cb5a'],[95,'#29955b']];let a=stops[0],b=stops.at(-1);for(let i=1;i<stops.length;i++)if(score<=stops[i][0]){a=stops[i-1];b=stops[i];break;}return new T.Color(a[1]).lerp(new T.Color(b[1]),T.MathUtils.clamp((score-a[0])/(b[0]-a[0]),0,1));}
export function addWorldDetails(scene,{ground,rounded=false,addLabel}){
 const animated=[],items=[],billboards=[];const materials=new Map();
 const mat=c=>{if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.8,flatShading:!rounded}));return materials.get(c);};
 function mesh(g,geo,c,x=0,y=0,z=0,sx=1,sy=1,sz=1){const o=new T.Mesh(geo,mat(c));o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
 const ball=(g,c,x,y,z,r=.3,sx=1,sy=1,sz=1)=>mesh(g,rounded?new T.SphereGeometry(r,16,12):new T.IcosahedronGeometry(r,1),c,x,y,z,sx,sy,sz);
 const box=(g,c,x,y,z,w,h,d)=>mesh(g,new T.BoxGeometry(w,h,d),c,x,y,z);
 const cone=(g,c,x,y,z,r,h,n=rounded?24:6)=>mesh(g,new T.ConeGeometry(r,h,n),c,x,y,z);
 const cylinder=(g,c,x,y,z,r,h)=>mesh(g,new T.CylinderGeometry(r,r,h,rounded?24:10),c,x,y,z);
 function line(g,pts,c,r=.06){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p))),32,r,rounded?8:5,false),c);}
 function sunShape(g){ball(g,'#ffcf43',0,0,0,.65);for(let i=0;i<10;i++){const a=i*Math.PI/5;const ray=box(g,'#ffd863',Math.cos(a)*1.02,Math.sin(a)*1.02,0,.15,.38,.13);ray.rotation.z=a-Math.PI/2;}billboards.push(g);}
 function flower(g,x,z,c){cylinder(g,'#4c9c69',x,.2,z,.035,.4);ball(g,c,x,.45,z,.17);ball(g,'#ffe481',x,.55,z,.07);}
 function animal(g,x,z,s=1){const a=new T.Group();a.position.set(x,0,z);a.scale.setScalar(s);g.add(a);ball(a,'#a58c69',0,.4,0,.32,1.5,.8,.7);ball(a,'#706558',.4,.52,0,.16);for(const dx of [-.2,.22])for(const dz of [-.13,.13])cylinder(a,'#655b52',dx,.17,dz,.045,.32);}
 function tree(g,c='#67bb72'){cylinder(g,'#af845e',0,.45,0,.09,.9);ball(g,c,0,1,0,.55,1,.8,1);ball(g,c,.3,1.1,.1,.35);}
 function create(rec){const g=new T.Group();g.position.set(rec.x,ground(rec.iso,rec.x,rec.y),-rec.y);g.userData=rec;scene.add(g);items.push(g);const type=rec.type;
 if(type==='pyramids'){for(let i=0;i<3;i++){const p=cone(g,'#e9b56e',(i-1)*1.2,.55-i*.08,0,.75-i*.1,1.1-i*.16,4);p.rotation.y=Math.PI/4;}}
 if(type==='taj'){box(g,'#f8eee0',0,.3,0,1.4,.6,1);ball(g,'#fff9ef',0,.9,0,.55,1,.95,1);cone(g,'#dfbe7f',0,1.48,0,.09,.28);for(const x of [-.95,.95])for(const z of [-.7,.7]){cylinder(g,'#fff6e7',x,.6,z,.13,1.2);ball(g,'#e9d5af',x,1.23,z,.17);}}
 if(type==='petra'){box(g,'#d79785',0,.65,0,1.8,1.3,.45);for(let i=0;i<4;i++)cylinder(g,'#f0b798',-.65+i*.43,.55,.3,.09,1);box(g,'#83594f',0,.32,.24,.3,.64,.04);cone(g,'#d8977e',0,1.4,0,1,.55,4);}
 if(type==='angkor'){box(g,'#bdaf93',0,.15,0,1.8,.3,1.3);for(const [x,z,h] of [[0,0,1.4],[-.65,-.45,.85],[.65,-.45,.85],[-.65,.45,.85],[.65,.45,.85]])for(let j=0;j<3;j++)cone(g,'#c9b99b',x,.4+j*h*.27,z,.34-j*.07,h*.55);}
 if(type==='inca'){for(let i=0;i<4;i++)box(g,'#a5b386',0,.1+i*.13,-.6+i*.4,2-i*.22,.18,.5);for(let i=0;i<4;i++){box(g,'#d6ccb1',-.6+i*.4,.6,0,.25,.25,.24);cone(g,'#a78d6c',-.6+i*.4,.81,0,.21,.2,4);}}
 if(type==='wall'){const pts=[];for(let i=0;i<9;i++){const x=(i-4)*.5,z=Math.sin(i)*.4;pts.push([x,.25,z]);if(i%2===0){box(g,'#c8b596',x,.45,z,.36,.6,.36);box(g,'#e3d3b7',x,.78,z,.43,.12,.43);}}line(g,pts,'#d9c8a6',.13);}
 if(type==='rome'){const o=mesh(g,new T.TorusGeometry(.7,.23,rounded?12:6,24),'#e2c3a0',0,.4,0,1,.65,1);o.rotation.x=Math.PI/2;for(let i=0;i<12;i++){const a=i*Math.PI/6;box(g,'#816957',Math.cos(a)*.86,.4,Math.sin(a)*.86,.09,.21,.08);}}
 if(type==='canyon'){for(const side of [-1,1])for(let i=0;i<3;i++)box(g,['#be7854','#d99565','#e7b982'][i],side*(.5+i*.06),.12+i*.15,0,.6-i*.08,.2,2);line(g,[[0,.04,-1],[.15,.04,-.2],[-.1,.04,.5],[0,.04,1]],'#67c7d4',.06);}
 if(type==='safari'){cylinder(g,'#a18354',0,.65,0,.1,1.3);ball(g,'#92b764',0,1.3,0,.6,1.7,.4,1.2);animal(g,.8,.5);animal(g,-.7,.4,.7);}
 if(type==='reef'){g.position.y=0;for(let i=0;i<9;i++){const a=i*2.4,x=Math.cos(a)*.8,z=Math.sin(a)*.8;line(g,[[x,0,z],[x,.25,z],[x+.15,.4,z]],['#f2a8bd','#ffe1a0','#99ddd2'][i%3],.07);ball(g,'#f7b298',x,.4,z,.15);}ball(g,'#ffe273',0,.65,0,.2,1.5,.6,.6);}
 if(['tulips','flowers'].includes(type)){for(let i=0;i<25;i++)flower(g,(i%5-2)*.27,(Math.floor(i/5)-2)*.3,(type==='tulips'?['#ef85a4','#f5cc72','#e097ce']:['#f6a544','#f4d463','#e7a6d5'])[i%3]);}
 if(type==='aurora'){for(let j=0;j<3;j++){const pts=[];for(let i=0;i<12;i++)pts.push([(i-6)*.35,1.5+Math.sin(i*.6+j)*.35+j*.2,j*.12]);line(g,pts,['#88efc0','#9fdedb','#c6b2ed'][j],.1);}}
 if(type==='sun'){g.position.y+=2;sunShape(g);}
 if(type==='puffin'){ball(g,'#354853',0,.4,0,.38,1,1.3,.8);ball(g,'#fff3dd',0,.36,.2,.27);ball(g,'#fff9ef',0,.85,0,.25);cone(g,'#f7a653',.24,.84,0,.13,.35,4).rotation.z=-Math.PI/2;for(const x of [-.15,.15])box(g,'#f2a24f',x,.05,.12,.2,.08,.25);}
 if(['herd','calves'].includes(type)){for(let i=0;i<7;i++)animal(g,(i%3-1)*.65,(Math.floor(i/3)-1)*.55,type==='calves'&&i%2?.45:.8);}
 if(['winter','summer','autumn'].includes(type)){tree(g,type==='winter'?'#e9f4ee':type==='autumn'?'#eea466':'#69be81');box(g,'#e7d5bb',.8,.2,0,.55,.4,.45);cone(g,type==='winter'?'#eff8f3':'#48687a',.8,.51,0,.5,.3,4);if(type==='summer'){for(let i=0;i<5;i++)flower(g,i*.25-.5,.65,'#aaa6e8');}}
 if(type==='beach'){cylinder(g,'#b8875b',0,.6,0,.04,1.2);const umbrella=cone(g,'#f4b480',0,1.2,0,.6,.3,rounded?24:8);box(g,'#fbf6de',.45,.04,.2,.3,.07,.7);}
 if(type==='blossom')g.visible=false;
 const marker={...rec,months:rec.months||all};addLabel(marker,g.position.clone().add(new T.Vector3(0,1.6,0)));
 return g;
 }
 sights.forEach(create);experiences.forEach(create);beachTowns.forEach(create);
 const storms=[{iso:608,name:'Typhoon season',x:129,y:15,months:[7,8,9,10],url:'https://www.pagasa.dost.gov.ph/climate/tropical-cyclone-information'},{iso:392,name:'Typhoon season',x:143,y:29,months:[8,9,10],url:'https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/climatology.html'},{iso:158,name:'Typhoon season',x:125,y:24,months:[7,8,9],url:'https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/climatology.html'}];
 for(const rec of storms){const g=new T.Group();g.position.set(rec.x,2,-rec.y);g.userData=rec;scene.add(g);items.push(g);for(let j=0;j<3;j++){const pts=[];for(let i=0;i<30;i++){const a=i*.14+j*Math.PI*2/3,r=.15+i*.045;pts.push([Math.cos(a)*r,0,Math.sin(a)*r]);}line(g,pts,'#d6e3ec',.1);}animated.push(g);addLabel({...rec,type:'storm',window:'Typical seasonal risk',description:'This shows a recurring typhoon-risk season, not a live storm or forecast. Check official advisories before travel.'},g.position.clone().add(new T.Vector3(0,.8,0)));}
 return {items,billboards,makeSun(position,months){const g=new T.Group();g.position.copy(position);g.userData={months};sunShape(g);scene.add(g);items.push(g);return g;},update(month,distance,time,motion,camera){for(const g of items){if(g.userData.type==='blossom')continue;g.visible=(!g.userData.months||g.userData.months.includes(month+1))&&distance<(g.userData.type==='beach'?80:160);}for(const g of animated)if(motion)g.rotation.y=time*.05;for(const g of billboards)g.quaternion.copy(camera.quaternion);}};
}
