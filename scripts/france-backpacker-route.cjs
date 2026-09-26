// Reuse the existing Japan-style route map, trip-length buttons and stop list.
const maps=require('../gen-maps.js');
module.exports=function franceRoute(){
 maps.PLACES[250]={clip:{minLon:-6,maxLon:10,minLat:41,maxLat:52},route:{
  title:'France by train',
  lead:'Pick your trip length. See the stops and nights below.',
  stops:[
   {name:'Paris',lat:48.8566,lng:2.3522,tier:3,nights:4,p:'Walk the neighbourhoods. Make time for your favourite museums.'},
   {name:'Bordeaux',lat:44.8378,lng:-.5792,tier:30,nights:4,via:'Train from Paris Montparnasse',p:'Explore the riverfront. Add a wine-country day trip if you have time.'},
   {name:'Lyon',lat:45.764,lng:4.8357,tier:7,nights:3,via:'Train to Lyon; a change may be needed',alt:{Paris:'Train from Paris to Lyon'},p:'Explore the old town and food markets.'},
   {name:'Nice',lat:43.7102,lng:7.262,tier:14,nights:3,lab:'left',via:'Train from Lyon to Nice',p:'End with coastal walks and beach time. Keep a rainy-day plan.'}
  ],sources:[
   {t:'Paris–Lyon trains',u:'https://www.sncf-connect.com/en-en/train/route/paris/lyon'},
   {t:'Lyon–Nice trains',u:'https://www.sncf-connect.com/en-en/train/route/lyon/nice'},
   {t:'Paris–Bordeaux trains',u:'https://www.sncf-connect.com/en-en/train/route/paris/bordeaux'},
   {t:'Bordeaux–Lyon trains',u:'https://www.sncf-connect.com/en-en/train/route/bordeaux/lyon'}
  ]
 }};
 const section=maps.routeSection({iso:250,name:'France'})
 .replace('class="section band"','class="guide-section route-section"')
 .replaceAll('Backpacker route','Travel itinerary').replaceAll('backpacker route map','travel route map')
 .replace(' Lines show the order of stops, not the roads or ferry tracks.',' Suggested stop order.')
 .replace(/<p class="disc" style="margin:18px 0 0">([\s\S]*?)<\/p>/,'<details class="guide-sources"><summary>Train links &amp; planning notes</summary><p>$1</p><p>Suggested nights. Compare tickets and rail passes for your dates.</p></details>');
 return section.replace('    <div class="cmapgrid">','<p class="route-season"><span aria-hidden="true">☀</span> <strong>Try May–June or September.</strong> Summer can be hot.</p><div class="cmapgrid">');
};
