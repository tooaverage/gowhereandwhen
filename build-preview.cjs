const fs=require('fs'),path=require('path');
const root=__dirname,out=path.join(root,'dist');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out);
for(const entry of ['index.html','styles','geo','images','country','favicon.svg','og.png','site.webmanifest','play','cartoon','storybook','bureau','prototypes','archive-v1','versions']) {
 const src=path.join(root,entry);if(fs.existsSync(src))fs.cpSync(src,path.join(out,entry),{recursive:true});
}
console.log('Built complete preview with all archived design rounds.');
