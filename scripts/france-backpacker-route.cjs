// Reuse the existing Japan-style route map, trip-length buttons and stop list.
const maps=require('../gen-maps.js');
module.exports=function franceRoute(){
 maps.PLACES[250]={clip:{minLon:-6,maxLon:10,minLat:41,maxLat:52},route:{
  title:'Backpacking France by train',
  lead:'Choose 3 days, a week, two weeks or a slow month. Start in Paris, add Lyon, then continue to Nice. The month-long version adds Bordeaux before Lyon. These are suggested itineraries, not a claim that this is the cheapest route.',
  stops:[
   {name:'Paris',lat:48.8566,lng:2.3522,tier:3,nights:4,p:'Start with neighbourhood walks and time for the museums you care about. With three days, stay here instead of spending your short break changing cities.'},
   {name:'Bordeaux',lat:44.8378,lng:-.5792,tier:30,nights:4,via:'Paris → Bordeaux by train. Check the service from Paris Montparnasse.',p:'Add an Atlantic-side city base on the slower trip. Keep wine-country excursions optional and check local transport separately; the train itinerary does not include a countryside tour.'},
   {name:'Lyon',lat:45.764,lng:4.8357,tier:7,nights:3,via:'Bordeaux → Lyon by train. Some journeys involve connections; compare the whole travel day.',alt:{Paris:'Paris → Lyon by train. Check departure and arrival stations for your service.'},p:'Use a second base for food, old-town walks and a slower pace. The one-week option ends here, leaving time in both cities instead of rushing to the coast.'},
   {name:'Nice',lat:43.7102,lng:7.262,tier:14,nights:3,lab:'left',via:'Lyon → Nice by train. Reserve a travel day and check the dated timetable.',p:'Finish with coastal walks and flexible beach time. Leave room for a wet day. Compare an onward departure from Nice with the time and fare needed to return to Paris.'}
  ],sources:[
   {t:'Paris–Lyon trains',u:'https://www.sncf-connect.com/en-en/train/route/paris/lyon'},
   {t:'Lyon–Nice trains',u:'https://www.sncf-connect.com/en-en/train/route/lyon/nice'},
   {t:'Paris–Bordeaux trains',u:'https://www.sncf-connect.com/en-en/train/route/paris/bordeaux'},
   {t:'Bordeaux–Lyon trains',u:'https://www.sncf-connect.com/en-en/train/route/bordeaux/lyon'}
  ]
 }};
 const section=maps.routeSection({iso:250,name:'France'}).replace('class="section band"','class="guide-section route-section"').replace('Route drawn from','Transport links checked against').replace('Check timetables for the month you travel.','Suggested stop order and nights are our editorial choices. Check dated timetables and fares before booking. Reviewed 26 September 2026.');
 return section.replace('    <div class="cmapgrid">','    <p><strong>When to go:</strong> May–June or September is a useful sightseeing starting point. July and August can mean hotter days; October suits flexible city plans better than a guaranteed beach holiday. Compare each city’s weather above.</p><div class="cmapgrid">').replace('    <p class="disc" style="margin:18px 0 0">','    <h3>Keep the trip affordable</h3><p>Compare individual train tickets with any rail pass before buying. Price accommodation for the same dates, including transport to it. Fewer bases can save transfer costs; a longer itinerary does not automatically mean better value. We have not quoted a daily budget because fares and room prices vary.</p><p class="disc" style="margin:18px 0 0">');
};
