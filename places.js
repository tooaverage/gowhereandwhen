/* ============================================================================
   When To Go: places inside a country.
   Big countries are not one climate. Each entry here gives a country a set of
   cities or areas with their own climate normals (rated by the same engine as
   the hub city) and a typical backpacker route, as travel guides describe it.
   The world map draws the cities as a heat layer when you zoom in, and the
   country page gets a city map, a city by month grid and the route map.

   Keyed by ISO 3166-1 numeric, like data.js. A city with hub: true reuses the
   hub-city normals from data.js so the numbers never drift apart.

   hi = avg daily high (C), lo = avg daily low (C), pr = avg monthly precip
   (mm), twelve values each, January to December. Rounded to whole numbers,
   as in data.js. Normals are 1991 to 2020 where published (DWD for Germany,
   HNMS for Greece, JMA for Japan), cross-checked against climate-data.org, Weather Spark and
   climatestotravel.com summaries. Treat as planning figures, not a forecast.

   Routes follow the loops most backpacker guides describe (see the sources
   list on each route). Nights are typical, not prescriptive.
   ========================================================================= */
const PLACES = {
  // Germany: a north to south gradient, and the Alps are a climate of their own.
  276: {
    cities: [
      { name: 'Berlin', lat: 52.52, lng: 13.405, hub: true, area: 'North and east' },
      { name: 'Hamburg', lat: 53.55, lng: 9.99, area: 'North coast',
        hi: [4,5,9,14,18,21,23,23,19,14,8,5], lo: [-1,-1,1,4,8,11,13,13,10,7,3,0],
        pr: [70,51,58,42,55,72,81,78,67,67,66,72] },
      { name: 'Cologne', lat: 50.94, lng: 6.96, area: 'Rhineland',
        hi: [6,7,11,15,19,22,25,25,20,15,10,6], lo: [1,1,3,5,9,12,14,14,11,7,4,1],
        pr: [66,58,58,45,63,79,80,78,64,66,64,72] },
      { name: 'Frankfurt', lat: 50.11, lng: 8.68, area: 'Rhine-Main',
        hi: [5,6,11,16,20,23,26,26,21,15,9,5], lo: [0,0,2,5,9,12,14,14,10,7,3,1],
        pr: [46,44,49,38,58,58,64,55,51,55,55,59] },
      { name: 'Dresden', lat: 51.05, lng: 13.74, area: 'Saxony',
        hi: [3,5,9,15,20,23,25,25,20,14,8,4], lo: [-2,-2,1,4,8,11,13,13,10,6,2,-1],
        pr: [46,37,42,42,60,66,84,79,49,44,45,45] },
      { name: 'Munich', lat: 48.137, lng: 11.575, area: 'Bavaria',
        hi: [3,5,10,15,19,22,25,24,19,14,8,4], lo: [-3,-3,0,3,8,11,13,13,9,5,1,-2],
        pr: [52,46,61,56,107,121,119,117,78,67,58,59] },
      { name: 'Freiburg', lat: 47.995, lng: 7.85, area: 'Black Forest',
        hi: [5,7,12,16,20,24,26,26,21,15,9,6], lo: [0,0,3,6,10,13,15,15,11,8,4,1],
        pr: [55,48,55,58,105,90,90,80,68,70,65,68] },
      { name: 'Garmisch', lat: 47.49, lng: 11.095, area: 'Bavarian Alps',
        hi: [2,4,8,12,17,20,22,22,17,13,6,2], lo: [-6,-5,-2,1,5,8,10,10,6,2,-2,-5],
        pr: [90,75,95,95,150,200,210,200,130,90,85,95] },
    ],
    route: {
      title: 'The classic Germany loop',
      length: '12 to 14 days, by train',
      lead: 'Most backpacker guides run Germany as one loop: Berlin south through Dresden and Nuremberg to Munich, then west along the Rhine to Cologne and up to Hamburg. Trains link every stop, and a Deutschland-Ticket or rail pass covers most of it.',
      stops: [
        { name: 'Berlin', lat: 52.52, lng: 13.405, nights: 3, p: 'Museums, the Wall, the nightlife. Most loops start here.' },
        { name: 'Dresden', lat: 51.05, lng: 13.74, nights: 2, via: 'Train, 2 hours', p: 'Baroque old town on the Elbe, with Saxon Switzerland a day trip away.' },
        { name: 'Nuremberg', lat: 49.45, lng: 11.08, nights: 1, via: 'Train, 3 to 4 hours', p: 'Medieval walls, the castle and the best bratwurst in the country.' },
        { name: 'Munich', lat: 48.137, lng: 11.575, nights: 3, via: 'Train, 1 hour', p: 'Beer halls and the English Garden. Day trip to Neuschwanstein castle and the Alps.' },
        { name: 'Heidelberg', lat: 49.40, lng: 8.69, nights: 1, via: 'Train, 3 hours', p: 'A castle above the Neckar and the old university town below it.' },
        { name: 'Cologne', lat: 50.94, lng: 6.96, nights: 2, via: 'Train, 1 to 2 hours', p: 'The cathedral, the Rhine and the Kölsch bars. Add a Rhine castle stop on the way.' },
        { name: 'Hamburg', lat: 53.55, lng: 9.99, nights: 2, via: 'Train, 4 hours', p: 'The harbour, Speicherstadt and the Reeperbahn. Two hours back to Berlin to fly out.' },
      ],
      sources: [
        { t: 'Hostelz, Germany 3-week backpacker itinerary', u: 'https://www.hostelz.com/solo-travel-itineraries/germany/germany-3-weeks-complete-backpacker-itinerary' },
        { t: 'kimkim, 2 weeks in Germany', u: 'https://www.kimkim.com/c/2-weeks-in-germany-unique-itineraries' },
        { t: 'Bucketlistly, 2 to 3 weeks Germany itinerary', u: 'https://www.bucketlistly.blog/posts/two-weeks-germany-itinerary' },
        { t: 'The Broke Backpacker, backpacking Germany', u: 'https://www.thebrokebackpacker.com/backpacking-germany-travel-guide/' },
      ],
    },
  },

  // Greece: the islands are drier and steadier than Athens, the north and the
  // Pindus are a different country in winter.
  300: {
    cities: [
      { name: 'Athens', lat: 37.9838, lng: 23.7275, hub: true, area: 'Attica' },
      { name: 'Thessaloniki', lat: 40.64, lng: 22.94, area: 'The north',
        hi: [9,12,15,20,25,30,32,32,28,22,16,11], lo: [2,4,7,11,15,20,22,22,18,13,8,4],
        pr: [36,34,40,40,51,38,26,22,34,47,48,53] },
      { name: 'Ioannina', lat: 39.665, lng: 20.85, area: 'Epirus and the Pindus',
        hi: [9,11,14,18,23,28,31,31,27,21,14,10], lo: [1,1,4,6,10,14,16,16,13,9,5,2],
        pr: [128,110,96,88,73,40,25,32,54,102,142,150] },
      { name: 'Corfu', lat: 39.62, lng: 19.92, area: 'Ionian islands', lab: 'l',
        hi: [14,14,16,19,24,28,31,31,28,23,18,15], lo: [6,6,8,10,14,17,20,20,17,14,10,8],
        pr: [140,120,95,75,45,20,10,25,75,130,190,175] },
      { name: 'Mykonos', lat: 37.445, lng: 25.33, area: 'Cyclades',
        hi: [14,14,16,19,23,27,28,28,26,22,18,15], lo: [9,9,10,13,16,20,22,22,20,17,13,11],
        pr: [70,45,40,20,10,3,1,1,7,40,55,75] },
      { name: 'Santorini', lat: 36.42, lng: 25.43, area: 'Cyclades',
        hi: [14,15,16,19,23,27,28,28,26,22,18,16], lo: [9,9,10,12,15,19,22,22,20,17,13,11],
        pr: [110,55,45,25,10,2,1,1,8,45,60,95] },
      { name: 'Rhodes', lat: 36.44, lng: 28.22, area: 'Dodecanese', lab: 'l',
        hi: [15,15,17,20,24,28,31,31,29,25,20,16], lo: [9,9,10,13,16,20,23,23,21,17,13,11],
        pr: [150,105,70,25,12,2,1,1,8,60,90,165] },
      { name: 'Heraklion', lat: 35.34, lng: 25.13, area: 'Crete',
        hi: [15,16,17,20,24,28,29,29,27,24,20,17], lo: [9,9,10,12,15,19,22,22,20,17,13,11],
        pr: [85,70,50,25,12,3,1,1,15,55,60,85] },
    ],
    route: {
      title: 'Athens, Meteora and down the Cyclades to Crete',
      length: '14 days, by train and ferry',
      lead: 'The usual backpacker line: a few days in Athens, a detour north to the monasteries at Meteora, then ferries south through the Cyclades to Santorini and on to Crete. Guides put the sweet spot for this route in late May, June and September, when the ferries are running, the sea is warm and the crowds are thinner.',
      stops: [
        { name: 'Athens', lat: 37.9838, lng: 23.7275, nights: 3, p: 'The Acropolis, Plaka and Psyrri. Base for the train north and the ferries south.' },
        { name: 'Meteora', lat: 39.71, lng: 21.63, nights: 1, via: 'Train to Kalabaka, 4 to 5 hours', p: 'Monasteries on rock pillars. One full day covers the main ones; cover shoulders and knees.' },
        { name: 'Athens', lat: 37.9838, lng: 23.7275, pass: true, via: 'Train back, then the ferry from Piraeus' },
        { name: 'Paros', lat: 37.085, lng: 25.15, nights: 2, lab: 'l', via: 'Ferry from Piraeus, 3 to 4 hours', p: 'Naoussa harbour, Parikia and the beaches in between. A sociable hub island.' },
        { name: 'Naxos', lat: 37.10, lng: 25.38, nights: 3, via: 'Ferry, 30 to 60 minutes', p: 'The biggest Cycladic island: long beaches, hill villages, and the best value of the group.' },
        { name: 'Santorini', lat: 36.42, lng: 25.43, nights: 2, via: 'Ferry, 1.5 to 2 hours', p: 'The caldera, Oia at sunset and the Fira to Oia walk. Two nights is plenty.' },
        { name: 'Heraklion, Crete', lat: 35.34, lng: 25.13, nights: 3, via: 'Ferry, 2 to 3 hours', p: 'Knossos, the old harbour, then Chania or the Samaria gorge. Fly home from Heraklion.' },
      ],
      sources: [
        { t: 'Santorini Dave, Greece itinerary and island hopping', u: 'https://santorinidave.com/greece-itinerary' },
        { t: 'Tourlane, Greece itinerary 2 weeks', u: 'https://www.tourlane.com/europe/greece/greece-itinerary-2-weeks/' },
        { t: 'Bucketlistly, 2 weeks backpacking Greece', u: 'https://www.bucketlistly.blog/posts/greece-backpacking-itinerary' },
        { t: 'Hostelz, Greek islands backpacking route', u: 'https://www.hostelz.com/solo-travel-itineraries/greece/greek-islands-solo-travel-backpacking-route' },
      ],
    },
  },

  // Japan: Hokkaido to Okinawa is a subarctic to subtropical spread, and the
  // Sea of Japan coast gets buried in winter snow while Tokyo stays dry.
  // The page map is clipped to the four main islands; Naha sits off the frame.
  392: {
    clip: { minLat: 30 },
    cities: [
      { name: 'Tokyo', lat: 35.68, lng: 139.69, hub: true, area: 'Kanto' },
      { name: 'Sapporo', lat: 43.06, lng: 141.35, area: 'Hokkaido',
        hi: [-1,0,4,12,17,21,25,26,22,16,8,2], lo: [-6,-6,-3,2,7,12,16,17,13,6,0,-4],
        pr: [108,92,78,55,56,60,91,127,142,110,114,115] },
      { name: 'Sendai', lat: 38.27, lng: 140.87, area: 'Tohoku',
        hi: [5,6,10,15,20,23,26,28,24,19,14,8], lo: [-1,-1,2,6,12,16,20,22,18,11,5,1],
        pr: [42,34,74,90,110,143,179,167,188,122,65,41], storm: { type: 'Typhoon', mo: [7,8] } },
      { name: 'Kanazawa', lat: 36.56, lng: 136.66, area: 'Sea of Japan coast', lab: 'l',
        hi: [7,8,12,18,23,26,30,32,27,22,16,10], lo: [1,1,3,8,13,18,22,23,19,13,8,3],
        pr: [256,163,157,144,138,170,233,179,232,177,251,301] },
      { name: 'Takayama', lat: 36.14, lng: 137.25, area: 'Japanese Alps', off: [26, -30],
        hi: [3,4,9,17,22,25,29,30,25,19,13,6], lo: [-5,-5,-2,3,8,13,18,19,14,7,1,-3],
        pr: [100,100,155,145,160,215,260,205,235,145,105,105] },
      { name: 'Kyoto', lat: 35.01, lng: 135.77, area: 'Kansai', off: [-30, -24], lab: 'l',
        hi: [9,10,14,20,25,28,32,34,29,23,17,11], lo: [1,2,4,9,14,19,23,24,20,14,8,3],
        pr: [53,66,124,127,151,201,236,144,181,121,72,54], storm: { type: 'Typhoon', mo: [8,9] } },
      { name: 'Osaka', lat: 34.69, lng: 135.50, area: 'Kansai', off: [-8, 30], lab: 'l',
        hi: [10,10,14,20,25,28,32,34,30,24,18,12], lo: [3,3,6,11,16,20,25,26,22,16,10,5],
        pr: [47,61,104,104,146,185,174,113,153,137,70,55], storm: { type: 'Typhoon', mo: [8,9] } },
      { name: 'Hiroshima', lat: 34.39, lng: 132.46, area: 'Chugoku', lab: 'l',
        hi: [10,11,14,20,25,27,31,33,29,23,17,12], lo: [2,2,5,10,15,19,24,25,21,14,8,4],
        pr: [46,64,118,141,170,227,280,131,163,109,69,54], storm: { type: 'Typhoon', mo: [8,9] } },
      { name: 'Fukuoka', lat: 33.59, lng: 130.40, area: 'Kyushu', lab: 'l',
        hi: [10,11,15,20,25,27,31,33,29,24,18,12], lo: [4,4,7,11,16,20,24,25,21,16,10,6],
        pr: [74,70,104,118,133,250,300,210,175,94,91,68], storm: { type: 'Typhoon', mo: [7,8,9] } },
      { name: 'Naha', lat: 26.21, lng: 127.68, area: 'Okinawa',
        hi: [20,20,22,25,27,30,32,32,31,28,25,21], lo: [15,15,17,19,22,25,27,26,25,23,20,16],
        pr: [102,115,143,161,245,284,188,240,275,179,119,110], storm: { type: 'Typhoon', mo: [6,7,8,9] } },
    ],
    route: {
      title: 'The Golden Route, Tokyo to Hiroshima',
      length: '14 days, by shinkansen',
      lead: 'Nearly every first-timer guide runs the same line: Tokyo, a night in Hakone under Fuji, then the shinkansen west to Kyoto, Nara, Osaka and Hiroshima with Miyajima. Guides agree three days each in Tokyo and Kyoto beat adding more cities. A 14-day rail pass or point-to-point tickets both work.',
      stops: [
        { name: 'Tokyo', lat: 35.68, lng: 139.69, nights: 4, p: 'Shibuya, Shinjuku, Asakusa and Akihabara. Day trip to Kamakura or Nikko if you have a spare day.' },
        { name: 'Hakone', lat: 35.23, lng: 139.10, nights: 1, via: 'Train, 1.5 hours', off: [16, 34], p: 'Hot springs, the ropeway and Mount Fuji across Lake Ashi on a clear day.' },
        { name: 'Kyoto', lat: 35.01, lng: 135.77, nights: 3, via: 'Shinkansen from Odawara, 2 hours', off: [-16, -34], lab: 'l', p: 'Fushimi Inari at dawn, Arashiyama, Gion and more temples than you can fit in.' },
        { name: 'Nara', lat: 34.685, lng: 135.83, nights: 1, via: 'Train, 45 minutes', off: [38, 30], p: 'The great Buddha at Todai-ji and the deer park. Many do it as a day trip from Kyoto.' },
        { name: 'Osaka', lat: 34.69, lng: 135.50, nights: 2, via: 'Train, 45 minutes', off: [-18, 34], lab: 'l', p: 'Dotonbori street food, the castle and the nightlife. Day trip to Himeji castle.' },
        { name: 'Hiroshima', lat: 34.39, lng: 132.46, nights: 2, via: 'Shinkansen, 1.5 hours', lab: 'l', p: 'The Peace Memorial and Miyajima island with its floating torii. Fly out of Osaka or shinkansen back to Tokyo in under 4.5 hours.' },
      ],
      sources: [
        { t: 'Japan National Tourism Organization, Golden Route', u: 'https://www.japan.travel/en/gc/itineraries/long-plan/' },
        { t: 'Bucketlistly, 2 weeks backpacking Japan', u: 'https://www.bucketlistly.blog/posts/japan-backpacking-itinerary' },
        { t: 'Never Ending Footsteps, two weeks in Japan', u: 'https://www.neverendingfootsteps.com/two-week-itinerary-japan/' },
        { t: 'Where Are Those Morgans, 14-day Japan itinerary', u: 'https://wherearethosemorgans.com/japan-itinerary-2-weeks/' },
      ],
    },
  },
};

if (typeof module !== 'undefined' && module.exports) module.exports = { PLACES };
