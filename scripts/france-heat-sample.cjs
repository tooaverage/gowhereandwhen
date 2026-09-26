// Fixed 0–100 scale, blended between observed city samples; never normalize by month.
module.exports=function heatSample(svg,record,engine){
 const timing=require('./france-travel-timing.cjs');
 const d=svg.match(/<path class="land" d="([^"]+)"/)[1];
 const box=svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);const width=+box[1],height=+box[2];
 const points=[...svg.matchAll(/<g class="city"[\s\S]*?<circle class="dot" cx="([\d.]+)" cy="([\d.]+)"/g)].map((m,i)=>({x:+m[1],y:+m[2],scores:record.cities[i].hi.map((_,n)=>timing.rating(record.cities[i].name,n,engine.score(record.cities[i],n),record.cities[i]))}));
 const palette=[[188,69,62],[238,152,73],[238,208,88],[150,203,90],[32,129,78]];
 function colour(score){const n=Math.min(3,Math.floor(score/25)),t=Math.min(1,(score-n*25)/25);return '#'+palette[n].map((v,i)=>Math.round(v+(palette[n+1][i]-v)*t).toString(16).padStart(2,'0')).join('');}
 let cells='';
 for(let y=0;y<height;y+=24)for(let x=0;x<width;x+=24){
  const distances=points.map(p=>Math.hypot(x+12-p.x,y+12-p.y));
  const weights=distances.map(d=>1/Math.max(10,d)**2),total=weights.reduce((a,b)=>a+b,0);
  const fills=Array.from({length:12},(_,m)=>Math.min(...distances)>170?'#d6e0dd':colour(points.reduce((sum,p,i)=>sum+p.scores[m]*weights[i],0)/total));
  cells+=`<rect x="${x}" y="${y}" width="25" height="25" fill="${fills[8]}" data-heat-colours="${fills.join(',')}"/>`;
 }
 const layer=`<defs><clipPath id="france-heat-clip"><path d="${d}"/></clipPath><filter id="france-heat-soft"><feGaussianBlur stdDeviation="12"/></filter></defs><g clip-path="url(#france-heat-clip)" aria-hidden="true"><g filter="url(#france-heat-soft)">${cells}</g></g>`;
 return svg.replace(/(<path class="land"[^>]+\/>)/,'$1'+layer);
};
