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
   HNMS for Greece), cross-checked against climate-data.org, Weather Spark and
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
};

if (typeof module !== 'undefined' && module.exports) module.exports = { PLACES };
