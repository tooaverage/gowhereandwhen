const fs=require('node:fs'),path=require('node:path');
const allowed=new Set(['building','sun','grape','snowflake','umbrella']);
module.exports=name=>{
 if(!allowed.has(name))throw Error('Unknown guide icon: '+name);
 return fs.readFileSync(path.join(__dirname,'icons/lucide',name+'.svg'),'utf8').replace('<svg','<svg class="guide-icon" aria-hidden="true" focusable="false"');
};
