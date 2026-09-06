// Closed ocean and flight routes, sampled by distance for steady travel and seamless loops.
export function ovalRoute(lng,lat,rx,ry){
 const points=[],lengths=[0];let length=0;
 for(let i=0;i<=192;i++){
  const angle=i/192*Math.PI*2,p={x:lng+rx*Math.cos(angle),z:-lat-ry*Math.sin(angle)};
  if(i){length+=Math.hypot(p.x-points[i-1].x,p.z-points[i-1].z);lengths.push(length);}
  points.push(p);
 }
 return {points,lengths,length};
}
export function routePosition(route,distance){
 const d=((distance%route.length)+route.length)%route.length;let lo=0,hi=route.lengths.length-1;
 while(lo+1<hi){const m=(lo+hi)>>1;if(route.lengths[m]<=d)lo=m;else hi=m;}
 const a=route.points[lo],b=route.points[hi],t=(d-route.lengths[lo])/(route.lengths[hi]-route.lengths[lo]);
 return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t};
}
export function travelClock(){
 let elapsed=0,last=null;
 return {tick(now,running){if(last!==null&&running)elapsed+=Math.min(.1,Math.max(0,(now-last)/1000));last=now;return elapsed;},reset(){last=null;}};
}
export function createTraffic(scene,originals){
 const boats=originals.filter(o=>o.userData.role==='boat'),planes=originals.filter(o=>o.userData.role==='airplane'),tracks=[];
 function add(object,route,speed,phase,altitude=0){tracks.push({object,route,speed,offset:route.length*phase,altitude});}
 const oceanRoutes=[[-40,30,15,8],[-140,15,16,4],[70,-10,12,5],[150,10,6,2],[-20,-25,13,5],[90,-40,15,6]];
 boats.forEach((o,i)=>add(o,ovalRoute(...oceanRoutes[i%oceanRoutes.length]),.20+i*.018,i*.17));
 const flightRoutes=[[-30,25,38,15],[90,-20,38,15],[-114,49,35,8],[138,35,18,5]];
 planes.forEach((o,i)=>add(o,ovalRoute(...flightRoutes[i%flightRoutes.length]),.85+i*.08,.12+i*.21,7));
 // Small coastal traffic remains visible when exploring Vancouver and Japan.
 function regional(template,route,speed,phase,scale,altitude){
  if(!template)return;const o=template.clone(true);o.name=template.userData.role+' coastal route';o.scale.multiplyScalar(scale);scene.add(o);add(o,ovalRoute(...route),speed,phase,altitude);
 }
 regional(boats[0],[-128.2,48.2,1.1,.7],.055,.3,.24,0);
 regional(boats[0],[144,33,2,1],.075,.7,.3,0);
 regional(planes[0],[-123,48.4,8,.8],.36,.38,.38,4);
 function update(time){
  for(const t of tracks){
   const distance=t.offset+time*t.speed,p=routePosition(t.route,distance),next=routePosition(t.route,distance+.08);
   t.object.position.set(p.x,t.altitude,p.z);
   t.object.rotation.y=Math.atan2(-(next.z-p.z),next.x-p.x);
  }
 }
 update(0);
 return {update,count:tracks.length};
}
