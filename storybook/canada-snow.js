import * as T from 'three';
// A seasonal illustration based on NRCan's snow-cover atlas, not a live snow map.
// https://natural-resources.canada.ca/maps-tools-publications/maps/atlas-canada/climate-environment
export function snowTargets(month){return {south:[11,0,1].includes(month)?1:0,north:[10,11,0,1,2,3].includes(month)?1:0};}
export function addCanadaSnow(scene,country){
 const south={value:0},north={value:0};let initialized=false;
 if(country){country.updateMatrixWorld(true);country.traverse(source=>{
  if(!source.isMesh)return;
  const material=new T.MeshStandardMaterial({color:'#f3f5ef',roughness:1,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  material.onBeforeCompile=shader=>{
   shader.uniforms.snowSouth=south;shader.uniforms.snowNorth=north;
   shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 snowPosition; varying float snowUp;').replace('#include <begin_vertex>','#include <begin_vertex>\nsnowPosition=(modelMatrix*vec4(transformed,1.0)).xyz; snowUp=normalize(mat3(modelMatrix)*objectNormal).y;');
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
    uniform float snowSouth; uniform float snowNorth; varying vec3 snowPosition; varying float snowUp;
    float snowHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float snowNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(snowHash(i),snowHash(i+vec2(1.,0.)),f.x),mix(snowHash(i+vec2(0.,1.)),snowHash(i+vec2(1.,1.)),f.x),f.y);}
   `).replace('#include <color_fragment>',`#include <color_fragment>
    float latitude=-snowPosition.z;
    float winter=mix(snowSouth,snowNorth,smoothstep(53.0,59.0,latitude));
    float coastalExclusion=clamp(smoothstep(-124.0,-121.0,snowPosition.x)+smoothstep(52.5,55.0,latitude),0.0,1.0);
    float field=.18+.65*(.65*snowNoise(snowPosition.xz*.7)+.35*snowNoise(snowPosition.xz*2.4));
    float cover=smoothstep(field-.1,field+.1,winter)*coastalExclusion*smoothstep(.35,.75,snowUp);
    diffuseColor.a*=cover;
    if(diffuseColor.a<.015)discard;
   `);
  };
  const snow=new T.Mesh(source.geometry,material);snow.name='Canada seasonal snow cover';snow.matrixAutoUpdate=false;snow.matrix.copy(source.matrixWorld);snow.matrix.elements[13]+=.035;snow.receiveShadow=true;scene.add(snow);
 });}
 return {update(month,animate=true){
  const targets=snowTargets(month);let changing=false;
  for(const [uniform,target] of [[south,targets.south],[north,targets.north]]){
   const difference=target-uniform.value;
   uniform.value=!initialized||!animate||Math.abs(difference)<.002?target:uniform.value+difference*.14;
   changing ||= uniform.value!==target;
  }
  initialized=true;return changing;
 }};
}
