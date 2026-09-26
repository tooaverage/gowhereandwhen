// Editorial rules for the France sample, not a measured universal travel score.
// Month windows below are our planning interpretation of the linked seasonal guides.
const sources={
 spring:'https://www.france.fr/en/article/top-french-cites-sunny-strolls/',
 autumn:'https://www.france.fr/en/article/french-cities-amazing-autumn-break/',
 wine:'https://www.bordeaux-tourism.co.uk/holidays/autumn',
 coast:'https://brest.fr/dossier-metropole/un-ete-plein-de-redecouvertes',
 carnival:'https://www.france.fr/en/event/Nice-carnival/',
 normandy:'https://en.normandie-tourisme.fr/unmissable-sites/bayeux/',
 loire:'https://www.touraineloirevalley.co.uk/discover/loire-valley-chateaux/',
 provence:'https://avignon-tourisme.com/en/faqs/',
 christmas:'https://www.visitstrasbourg.fr/en/discover/the-capital-of-christmas/strasbourg-christmas-market-faq/'
};
const rules={
 Paris:[{months:[3,4],reason:'Spring walks and parks',source:'spring'}],
 Lyon:[{months:[8,9],reason:'Old-town walks and food stops',source:'autumn'}],
 Nice:[{months:[1],reason:'Nice Carnival',source:'carnival',event:true},{months:[3,4],reason:'Spring city and coastal walks',source:'spring'}],
 Bordeaux:[{months:[8,9],reason:'Wine country in harvest season',source:'wine'}],
 Brest:[{months:[5,6,7],reason:'Coastal walks and summer outings',source:'coast'}],
 Strasbourg:[{months:[3,4],reason:'Spring canals and city walks',source:'spring'},{months:[8,9],reason:'Autumn canals and cycling',source:'autumn'},{months:[11],reason:'Christmas markets',source:'christmas',event:true}]
};
const draws={Paris:'Museums and neighbourhood walks',Bayeux:'Normandy and D-Day history',Tours:'Loire Valley castles',Bordeaux:'Wine and riverfront walks',Avignon:'Provence, palace and nearby towns',Nice:'Old town and Riviera day trips',Lyon:'Food markets and old-town walks',Strasbourg:'Alsace, canals and Colmar'};
const levels=[{label:'Poor',key:'avoid',value:15},{label:'Poor',key:'fair',value:35},{label:'Fair',key:'good',value:55},{label:'Good',key:'great',value:70},{label:'Great',key:'ideal',value:90}];
function assess(city,m,weather,record={}){
 const highlight=(rules[city]||[]).find(r=>r.months.includes(m));
 const storm=record.storm?.mo?.includes(m),heat=record.hi?.[m]>=35;
 const mildOutdoorDays=record.hi?.[m]>=18&&record.hi?.[m]<=28;
 let level=weather>=74&&mildOutdoorDays?4:weather>=60?3:weather>=44?2:1;
 if(highlight&&(highlight.event||(weather>=74&&mildOutdoorDays)))level=4;
 if(record.hi?.[m]>28)level=Math.min(level,3);
 if(storm||heat)level=0;
 const weatherText=heat?'Extreme heat limits outdoor plans':storm?'Seasonal storm risk':record.hi?.[m]<12?'Cold days; pack warm layers':record.hi?.[m]>28?'Hot days; plan breaks':record.pr?.[m]>90?'Keep a rainy-day plan':record.hi?.[m]>=18?'Mild to warm days for outdoor stops':record.hi?.[m]>=12?'Cool days; bring a jacket':'Check local weather before booking';
 return {...levels[level],reason:highlight?.reason||draws[city]||'Sightseeing',weather:weatherText,source:highlight?sources[highlight.source]:null,event:!!highlight?.event,tradeoff:highlight?.event?'Only during event dates; check before booking':highlight?.source==='wine'?'Book visits; harvest work can affect access':weatherText};
}
function rating(city,m,weather,record){return assess(city,m,weather,record).value;}
module.exports={sources,rules,levels,assess,rating};
