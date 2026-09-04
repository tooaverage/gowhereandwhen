# When To Go

An interactive world map that shows, by color, when each country is good to visit.
Pick a month and the map paints every country in five steps from red (avoid)
through orange and yellow to green (ideal). Tap a country to see its full year
arc and the best months to go. Covers over 180 countries.

This is a standalone project. It shares nothing with the rest of this repo and
is meant to be lifted into its own repo later.

## Run it

Open `index.html` in any browser. No build, no server, no keys.

- `index.html` is the whole app: HTML, CSS, data and engine in one file.
- The world map geometry is fetched at runtime from a CDN (world-atlas 50m,
  falling back to 110m), which includes most small island nations. If the fetch
  is blocked, the app falls back to the Grid view, which shows every country and
  every month and works fully offline from the embedded data.
- Seasonal patterns have been cross-checked against published best-time-to-visit
  guides across every region and the tricky climate types (monsoon, dual rainy
  seasons, hurricane and cyclone belts, southern hemisphere, equatorial islands).

## How scores work

Each country uses climate normals (average high, average low, monthly rainfall)
for one representative hub city, shown in the detail panel. The engine turns
those into a 0 to 100 comfort score per month, then maps the score to five
strong discrete colors (red, orange, yellow, light green, green) so good and
bad seasons read at a glance.

Comfort is limited by the worst factor: a dry but freezing month is still bad,
and a warm but storm-prone month is still bad. The score leans on whichever of
temperature and rain is worse, then folds in:

- daytime high temperature, with an ideal band around 20 to 28 C
- overnight chill, penalized hard when nights get cold
- extreme heat, penalized hard above the low 30s C
- monthly rainfall, penalized as it climbs, with a gentler slope above 150 mm
  a month: tropical rain falls in short heavy bursts, so a 250 mm trade-wind
  month is unpleasant on paper but fine on the ground
- a penalty during tropical-storm season (typhoon, hurricane, cyclone), which
  is a curated per-country field because it does not show up in average rainfall

Tapping a country also surfaces the season factors people mean by high vs low
season:

- hazard tags per month: storm risk, heavy monsoon, wet season, extreme heat,
  hard cold. These show as colored dots under the year arc and as chips for the
  selected month.
- a high / shoulder / low season readout. Here season tracks weather quality
  (the four best-weather months are High), which for most destinations lines up
  with crowds and prices.

All thresholds live in the `CFG` block. The scoring functions are pure: no DOM,
no globals, no network. `engine.js` and `data.js` are the same logic and data
broken out for the Node sanity check; `index.html` inlines its own copy so it
stays a true single file.

This is a planning guide based on long-run averages, not a forecast.

## Cities and routes inside a country

A hub city cannot stand for a big country, so `places.js` gives some countries
(Germany and Greece so far) a set of cities with their own climate normals and
a typical backpacker route, as travel guides describe it.

- On the world map, zoom in on such a country (or tap it, which zooms for you)
  and the cities appear as a heat layer: one dot per city in the month's band
  colour, with the score inside once you are close. The country itself fades
  to a wash so the dots carry the colour. The detail panel lists the cities
  best-first for the chosen month.
- The country page gets a city map with a month picker, a city by month grid,
  and a route map with numbered stops and the leg between each stop.
- Country outlines for those page maps come from `geo/<iso>.json`, written by
  `gen-geo.js` from the world-atlas npm package (Natural Earth 50m) so the
  build never fetches anything. `gen-maps.js` draws the SVGs for `gen.js`,
  and `gen.js` also copies `places.js` into `index.html` between the
  `<places>` markers so the two never drift.

To add a country: give it an entry in `places.js`, run `node gen-geo.js
<path to countries-50m.json>`, then `node gen.js`.

## Backlog

- Embed the map geometry so there is no runtime fetch at all
- More countries, and city sets and routes for more of the big ones
- Pull live climate normals from an API instead of hand-curated data
- Real crowd and price data for true high vs low season, not a weather proxy
- More hazards: wildfire smoke, air quality, sea temperature for beach trips
- Filters: beach vs city vs hiking, tolerance for heat or rain
- Shareable links that open on a chosen month and country
