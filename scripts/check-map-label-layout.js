// Read-only browser QA. Evaluate the exported function on the rendered guide.
// Run after fonts load, for every trip length, on desktop and narrow viewports.
module.exports = function checkMapLabelLayout() {
 const svg=document.querySelector('#cities svg.cmap');
 if(!svg)throw Error('City map is missing');
 const labels=Array.from(svg.querySelectorAll('.city .lab'));
 const dots=Array.from(svg.querySelectorAll('.city .dot'));
 const box=svg.getBoundingClientRect(),issues=[];
 const bounds=labels.map(label=>({label:label.textContent,b:label.getBoundingClientRect()}));
 const pad=box.width/600;
 const touches=(a,b)=>a.x<b.x+b.width+pad&&a.x+a.width+pad>b.x&&a.y<b.y+b.height+pad&&a.y+a.height+pad>b.y;
 bounds.forEach((a,i)=>{
  if(a.b.x<box.x||a.b.y<box.y||a.b.x+a.b.width>box.x+box.width||a.b.y+a.b.height>box.y+box.height)issues.push(a.label+': clipped');
  bounds.slice(i+1).forEach(b=>{if(touches(a.b,b.b))issues.push(a.label+' overlaps '+b.label);});
  dots.forEach((dot,j)=>{if(touches(a.b,dot.getBoundingClientRect()))issues.push(a.label+' touches marker '+(bounds[j]?.label||j));});
 });
 return {labels:labels.length,issues};
};
