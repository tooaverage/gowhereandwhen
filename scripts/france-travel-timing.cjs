// Editorial rules for the France sample, not a measured universal travel score.
// Month windows below are our planning interpretation of the linked seasonal guides.
const sources={
 spring:'https://www.france.fr/en/article/top-french-cites-sunny-strolls/',
 autumn:'https://www.france.fr/en/article/french-cities-amazing-autumn-break/',
 wine:'https://www.bordeaux-tourism.co.uk/holidays/autumn',
 coast:'https://brest.fr/dossier-metropole/un-ete-plein-de-redecouvertes',
 carnival:'https://www.france.fr/en/event/Nice-carnival/',
 christmas:'https://www.visitstrasbourg.fr/en/discover/the-capital-of-christmas/strasbourg-christmas-market-faq/'
};
const rules={
 Paris:[{months:[3,4],reason:'Spring walks and parks',source:'spring'},{months:[8,9],reason:'Autumn walks and museums',source:'autumn'}],
 Lyon:[{months:[8,9],reason:'Old-town walks and food stops',source:'autumn'}],
 Nice:[{months:[1],reason:'Nice Carnival',source:'carnival',event:true},{months:[3,4],reason:'Spring city and coastal walks',source:'spring'}],
 Bordeaux:[{months:[8,9],reason:'Wine country in harvest season',source:'wine'}],
 Brest:[{months:[5,6,7],reason:'Coastal walks and summer outings',source:'coast'}],
 Strasbourg:[{months:[3,4],reason:'Spring canals and city walks',source:'spring'},{months:[8,9],reason:'Autumn canals and cycling',source:'autumn'},{months:[11],reason:'Christmas markets',source:'christmas',event:true}]
};
const levels=[{label:'Poor',key:'avoid',value:15},{label:'Poor',key:'fair',value:35},{label:'Fair',key:'good',value:55},{label:'Good',key:'great',value:70},{label:'Great',key:'ideal',value:90}];
function assess(city,m,weather,record={}){
 const highlight=(rules[city]||[]).find(r=>r.months.includes(m));
 const storm=record.storm?.mo?.includes(m),heat=record.hi?.[m]>=35;
 let level=weather>=74?3:weather>=44?2:1;
 if(highlight&&(highlight.event||weather>=44))level=4;
 if(storm||heat)level=0;
 const weatherText=heat?'Extreme heat limits outdoor plans':storm?'Seasonal storm risk':record.hi?.[m]<12?'Cold days; pack warm layers':record.hi?.[m]>28?'Hot days; plan breaks':record.pr?.[m]>90?'Keep a rainy-day plan':'Weather suits outdoor stops';
 return {...levels[level],reason:highlight?.reason||'Flexible sightseeing trip',weather:weatherText,source:highlight?sources[highlight.source]:null,event:!!highlight?.event,tradeoff:highlight?.event?'Only during event dates; check before booking':highlight?.source==='wine'?'Book visits; harvest work can affect access':weatherText};
}
function rating(city,m,weather,record){return assess(city,m,weather,record).value;}
module.exports={sources,rules,levels,assess,rating};
