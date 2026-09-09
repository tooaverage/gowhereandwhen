// Bake only terrain query results. All visible geometry and runtime controls stay intact.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {GLTFLoader} from '../play/vendor/GLTFLoader.js';
import {MeshoptDecoder} from '../storybook/meshopt-decoder.js';
import {addWorldDetails} from '../storybook/world-details.js';
import {repairBoundaryHeights,countryLabelAnchors} from './map-boundaries.mjs';
const root=process.argv[2],data=JSON.parse(fs.readFileSync(root+'/storybook/data.json'));
const compressed=fs.readFileSync(root+'/storybook/assets/storybook-v1-optimized.glb.gz');
const bytes=gunzipSync(compressed);const {scene:asset}=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
asset.updateMatrixWorld(true);const groups=new Map();asset.traverse(o=>{if(o.userData.role==='country')groups.set(+o.userData.iso,o);});
const ray=new THREE.Raycaster(),cache={};
function ground(id,x,y){const key=id+':'+x+':'+y;if(key in cache)return cache[key];ray.set(new THREE.Vector3(x,80,-y),new THREE.Vector3(0,-1,0));const group=groups.get(id);return cache[key]=group?(ray.intersectObject(group,true)[0]?.point.y??0):0;}
const scene=new THREE.Scene(),details=await addWorldDetails(scene,{ground,data,animateVisibility:()=>false});
for(const r of data){if(groups.has(r.iso)){const center=new THREE.Box3().setFromObject(groups.get(r.iso)).getCenter(new THREE.Vector3());ground(r.iso,r.hub?.lng??center.x,r.hub?.lat??-center.z);}for(const c of r.cities||[])ground(r.iso,c.lng,c.lat);}
const camera=new THREE.PerspectiveCamera();for(let m=0;m<12;m++)details.update(m,100,0,false,camera);
const countryLabels={};
for(const [id,point] of Object.entries(countryLabelAnchors(JSON.parse(fs.readFileSync(root+'/play/vendor/world.json'))))){
 if(!groups.has(+id))continue;
 const height=ground(+id,...point);
 // A concave country's centroid can be offshore; keep its existing capital anchor then.
 if(height>0)countryLabels[id]=point;
}
fs.writeFileSync(root+'/storybook/assets/ground-heights.json',JSON.stringify({heights:cache,countryLabels}));
const {output,repaired}=repairBoundaryHeights(JSON.parse(fs.readFileSync(root+'/storybook-lab/assets/borders.json')));
fs.writeFileSync(root+'/storybook/assets/borders.json',JSON.stringify(output));
console.log('Repaired '+repaired+' missing border heights without changing geographic boundaries.');
console.log('Precomputed '+Object.keys(cache).length+' exact terrain heights.');
