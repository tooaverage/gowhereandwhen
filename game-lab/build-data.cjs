const fs=require('fs'),path=require('path');
const {DATA}=require('../data.js'),{CONTENT}=require('../content.js'),{PLACES}=require('../places.js'),E=require('../engine.js');
const months = r => r.hi.map((_,m)=>({score:E.score(r,m),band:E.band(E.score(r,m)),tags:E.monthTags(r,m),season:E.seasonOf(r,m)}));
const all=DATA.map(r=>{
 const editorial=CONTENT.find(c=>c.iso===r.iso);
 const cities=(PLACES[r.iso]?.cities||[]).map(c=>{const w=c.hub?{...r,...c}:c;return {...w,months:months(w)};});
 return {...r,slug:editorial?.slug,hub:editorial?.hub,lead:editorial?.heroLead,markers:editorial?.markers||[],bestFor:editorial?.bestFor||[],whatsOn:editorial?.whatsOn||[],months:months(r),cities};
});
fs.writeFileSync(path.join(__dirname,'data.json'),JSON.stringify(all));
