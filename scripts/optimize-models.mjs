import {MeshoptEncoder} from 'meshoptimizer';
import {NodeIO,PropertyType} from '@gltf-transform/core';
import {EXTMeshoptCompression,KHRMeshQuantization} from '@gltf-transform/extensions';
import {dedup,weld,quantize,meshopt} from '@gltf-transform/functions';
import {gunzipSync,gzipSync} from 'node:zlib';
import fs from 'node:fs';
const root=new URL('../',import.meta.url).pathname.replace(/\/$/,'');
const io=new NodeIO().registerExtensions([KHRMeshQuantization,EXTMeshoptCompression]).registerDependencies({'meshopt.encoder':MeshoptEncoder});
await MeshoptEncoder.ready;
for(const name of ['storybook-v1','japan-storybook','canada-storybook']){
 const src=root+'/storybook-lab/assets/'+name+'.glb.gz';const input=fs.readFileSync(src);const doc=await io.readBinary(gunzipSync(input));
 const before=doc.getRoot().listNodes().map(n=>[n.getName(),n.getExtras()]);
 await doc.transform(weld({tolerance:0}),dedup({propertyTypes:[PropertyType.ACCESSOR,PropertyType.MESH]}),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeNormal:12,quantizeTexcoord:14}));
 const after=doc.getRoot().listNodes().map(n=>[n.getName(),n.getExtras()]);
 if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Scene semantics changed');
 const output=gzipSync(await io.writeBinary(doc),{level:9});
 fs.writeFileSync(root+'/storybook-lab/assets/'+name+'-optimized.glb.gz',output);
 console.log(name,input.length,'->',output.length,'nodes',after.length);
}
