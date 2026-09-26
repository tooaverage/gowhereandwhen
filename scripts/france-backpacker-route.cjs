const guideIcon=require('./guide-icon.cjs');
// Reuse the existing Japan-style route map, trip-length buttons and stop list.
const maps=require('../gen-maps.js');
module.exports=function franceRoute(){
 maps.PLACES[250]={clip:{minLon:-6,maxLon:10,minLat:41,maxLat:52},route:{
  title:'France by train',
  lead:'Pick your trip length. See the stops and nights below.',
  stops:require('./france-route-plan.cjs').stops.map(s=>({...s,tier:3,nights:1})),sources:[
   {t:'Normandy: Bayeux and the D-Day coast',u:'https://en.normandie-tourisme.fr/unmissable-sites/bayeux/'},
   {t:'Loire Valley castles',u:'https://www.touraineloirevalley.co.uk/discover/loire-valley-chateaux/'},
   {t:'Provence from Avignon',u:'https://avignon-tourisme.com/en/faqs/'},
   {t:'Paris–Bayeux trains',u:'https://www.sncf-connect.com/en-en/train/route/paris/bayeux'},
   {t:'Paris–Tours trains',u:'https://www.sncf-connect.com/en-en/train/route/paris/tours'},
   {t:'Paris–Strasbourg trains',u:'https://www.sncf-connect.com/en-en/train/route/paris/strasbourg'},
   {t:'Nice–Lyon trains',u:'https://www.sncf-connect.com/en-en/train/route/nice/lyon'},
   {t:'Tours–Bordeaux trains',u:'https://www.sncf-connect.com/en-en/train/route/tours/bordeaux'},
   {t:'Bordeaux–Avignon trains',u:'https://www.sncf-connect.com/train/trajet/bordeaux/avignon'},
   {t:'Avignon–Nice trains',u:'https://www.sncf-connect.com/en-en/train/route/avignon/nice'},
   {t:'Lyon–Strasbourg trains',u:'https://www.sncf-connect.com/en-en/train/route/lyon/strasbourg'},
   {t:'Paris–Lyon trains',u:'https://www.sncf-connect.com/en-en/train/route/paris/lyon'},
   {t:'Lyon–Nice trains',u:'https://www.sncf-connect.com/en-en/train/route/lyon/nice'},
   {t:'Paris–Bordeaux trains',u:'https://www.sncf-connect.com/en-en/train/route/paris/bordeaux'},
   {t:'Bordeaux–Lyon trains',u:'https://www.sncf-connect.com/en-en/train/route/bordeaux/lyon'}
  ]
 }};
 let section=maps.routeSection({iso:250,name:'France'})
 .replace('class="section band"','class="guide-section route-section"')
 .replaceAll('Backpacker route','Travel itinerary').replaceAll('backpacker route map','travel route map')
 .replace(' Lines show the order of stops, not the roads or ferry tracks.',' Suggested stop order.')
 .replace(/<p class="disc" style="margin:18px 0 0">([\s\S]*?)<\/p>/,'<details class="guide-sources"><summary>Train links &amp; planning notes</summary><p>$1</p><p>Suggested nights. Compare tickets and rail passes for your dates.</p></details>');
 const {plans,legs}=require('./france-route-plan.cjs');
 section=section.replace('var LEN=',`var PLANS=${JSON.stringify(plans)}, LEGS=${JSON.stringify(legs)}; var LEN=`);
 section=section.replace(/      var on=items.map[\s\S]*?      var k=0, prev=-1, pts=\[\];/,`      var plan=PLANS[d], nights={}, order=[];
      plan.forEach(function(stop){var i=items.findIndex(function(li){return li.dataset.name===stop[0];});order.push(i);nights[i]=stop[1];});
      var on=items.map(function(li,i){return order.includes(i);}),T=d-1;
      var k=0, prev=-1, pts=[];
      items.forEach(function(li,i){li.hidden=!on[i];marks[i].style.display=on[i]?'':'none';});`);
 section=section.replace('      items.forEach(function(li,i){\n        li.hidden', '      order.forEach(function(i){var li=items[i];list.append(li);\n        li.hidden');
 section=section.replace("(vias[pn] || list.dataset.onward)","(LEGS[pn+'|'+li.dataset.name] || list.dataset.onward)");
 section=section.replace('Suggested nights. Compare tickets and rail passes for your dates.','Suggested nights include travel time. Longer trips add regions, rather than stretching every stay. Arrange your return separately.');
 return section.replace('    <div class="cmapgrid">',`<p class="route-season">${guideIcon('sun')} <strong>Try May–June or September.</strong> Summer can be hot.</p><div class="cmapgrid">`);
};
