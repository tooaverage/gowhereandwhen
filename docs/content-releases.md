# Content releases

## 2026-09-26: workflow foundation

- Existing public coverage: 202 map records, 74 guides, 69 city records (36 carry a source object), plus Australia's ten-point regional prototype. Nine countries have multiple city records. These counts are an inventory, not a review certificate.
- Initial queue established in content-coverage.json. No country expansion batch has been completed under this daily workflow yet.
- Public UI clarifies travel weather comfort rather than temperature. Fixed-scale interpolation is explicitly regression-tested.
- City selection joins the consent-based analytics event set. Real traffic totals remain unverified until dashboard access succeeds.

## 2026-09-26: France pilot, published

- Deployment 36257801307 succeeded for commit 94f36e8; live six-city section and route verified.
- Updated /country/france/ with a compact six-city September/October comparison, a Paris–Lyon–Nice suggested rail route, source links, and clearer coastal/Alpine limitations. Existing canonical URL retained; no new competing page.
- Added NASA POWER daily-derived 2001–2020 climate for Lyon, Nice, Bordeaux, Brest and Strasbourg; Paris already existed. Full 12-month validation passes. Exact requests are in climate/france.json. These are regional samples, not complete mountain/Corsica/overseas coverage. The older Paris-only chart remains explicitly distinguished from the new sourced table.
- Sources: France.fr climate/geography and lavender guidance, SNCF Connect Paris–Lyon and Lyon–Nice route pages, NASA POWER daily API.
- Corrected a historical spring-lavender claim and unsupported snow certainty. Kept the shared Storybook design system. Fixed clipped camera labels at 320px.
- Lighthouse baseline: home 67 performance, France 59; both 100 accessibility/best practices/SEO in one simulated-mobile run. These are lab baselines, not rankings. Heavy 3D loading remains a performance backlog item. Added automatic post-deploy Lighthouse reports for home/France/Japan.
- Pilot is a manual execution of the workflow. The standalone Sol scheduler is configured separately and has not yet completed its first scheduled batch.

## 2026-09-26: France backpacker route expansion

- Added /country/france/#route with the existing shared route component used by Japan: geographic outline, numbered stops, 3/7/14/30-day selector and stop-specific night totals.
- Three days stays in Paris; one week adds Lyon; two weeks continues to Nice; the month adds Bordeaux before Lyon. Each leg links to SNCF route information, with no invented fixed fares or train times. Nights are editorial allocations and total trip length minus one.
- Removed the earlier brief route paragraph to avoid duplication. Added a separate Backpacker routes navigation link. Source geography comes from the existing Natural Earth/world-atlas topology.
- Browser-tested all four selectors, map stop counts and night totals. This is a researched rail itinerary, not a verified cheapest-trip claim or a complete rural-France route.

### France visual and writing pass, 26 September 2026

Replaced the September/October table with Japan's shared 12-month city map for six French cities. Shortened itinerary copy, renamed it Travel itinerary, grouped sources under disclosures, added activity and travel-note cards, and fixed shared prose spacing. Added less-is-more and grade-6 writing rules to the factory and design contract.

### France-only design sample, pending review

The combined city-weather/route map, closed month cards with stable badge positions, spaced footer and round icon tiles are LOCAL PREVIEW ONLY. Jaycee explicitly requested a sample, not rollout. Do not publish or apply these changes to other countries without her go-ahead. Preview: http://localhost:8765/country/france/#route. Copy rules now specify grade 5–6 language and plain source notes. The shared components remain unchanged for other countries.

France sample refinement: route stops now share the desktop map row and follow the map on mobile. City rankings and the year grid remain available under a disclosure. Month buttons show rounded mean comfort scores for visible route stops, using the existing fixed score bands. Tested month switching and four-stop route selection; narrow preview has no horizontal overflow. Added 4/8/24/48 spacing rules. Still local-only, pending review.

France heatmap experiment, local only: fixed 0–100 continuous colour scale blended between six climate samples, clipped to France, with route overlay. City cards show daytime highs and best-weather months. Non-route cities have + markers and an Extra spots key; Brest and Strasbourg remain outside the itinerary. Month controls now use bold existing weather bands. Verified January temperatures and map colours update, four-stop route preserves Brest/Strasbourg as extras, and no horizontal overflow in current preview. This is broad interpolation, not detailed mountain weather. Await sample review before publishing.

Travel-timing prototype, France only and unpublished: December Strasbourg gets an explicitly editorial 85 rating for Christmas markets, supported by Strasbourg tourism's Christmas-market FAQ. This is not a measured all-factor index. A local green highlight replaces the weather-only reading near Strasbourg; other cities remain weather-based. Temperature stays visible. January does not inherit the event highlight; route averages exclude off-route cities. Costs and real demand seasons are not yet scored. Existing engine high/shoulder/low labels are weather ranks and must not be reused as independent demand evidence. Pending research: real regional tourism seasonality plus activity windows, with transparent trade-offs rather than treating high demand as automatically better.

France recommendation revision, sample only: replaced the one-off Strasbourg boost with a shared editorial rule table for all six cities. Sources cover spring walks, autumn city breaks, Bordeaux harvest visits, Brest summer outings, Nice Carnival and Strasbourg Christmas markets. Labels are categorical, not an alleged measured overall score. Seasonal draws can lift recommendations; extreme heat/storm inputs still take precedence. Each stop/extra place now shows a reason and trade-off. Crowds, cost and closures remain explicitly unrated. Removed weather-derived demand-season summary from the France sample, clarified weather-only comparisons, consolidated source notes and reduced duplicated city cards. Tests: node scripts/check-france-timing.cjs and existing build/check. Do not roll out or publish until France sample is approved.

## 2026-09-26: France sample approved for release

Jaycee approved shipping the current France sample. This supersedes the earlier France-only hold above; other countries remain outside this rollout. Includes the combined city/route map, bold month controls, temperatures beside stops, extra-place labels, compact spacing, and sourced seasonal reasons. Ratings cover weather, activities and events; crowds, price and closures are explicitly not rated. Seasonal recommendations are editorial, not measured all-factor scores.

Build, site checks and France timing regressions passed. France regressions now run in the deployment check suite. Desktop and narrow-screen checks were completed during the sample review; production and automated mobile Lighthouse verification follow deployment.

Next research: source real high/shoulder/low tourism seasons. The old weather-derived season ranks are not visitor data. Skiing and other seasonal draws should be assessed for the activity; crowds and price are trade-offs rather than automatic reasons to downgrade a worthwhile trip. Do not infer lastminute.com's methodology from its season legend.

Production follow-up: mobile Lighthouse found white-on-green month text and mismatched accessible button names. Changed green-month text to dark ink and aligned accessible names with the visible month abbreviation and rating. Initial France scores: performance 67, accessibility 96, best practices 100, SEO 100.

## 2026-09-26: France traveller-first itinerary correction

Replaced proportional night scaling with explicit 3/7/14/30-day plans. A month now has eight bases and 29 nights: Paris 5, Bayeux (Normandy) 3, Tours (Loire Valley) 3, Bordeaux 4, Avignon (Provence) 4, Nice 4, Lyon 3, Strasbourg (Alsace) 3. These are suggested editorial allocations, not measured average stays. Fourteen days adds Alsace with 4/3/3/3 nights across Paris, Strasbourg, Lyon and Nice.

Destination selection was cross-checked against three user-supplied traveller discussions and Nomadic Matt's France guide, then official Normandy, Touraine and Avignon tourism information and SNCF routes. No article wording copied. This is not a statistically representative popularity ranking. Comparable visitor counts are a next input, not yet implemented. Brest remains in underlying climate data but is no longer presented as a recommended extra stop on the France travel map.

Added traceable NASA POWER 2001–2020 daily-derived climate for Bayeux, Tours and Avignon after selecting these travel bases. Only the France guide uses the new destination set. Source links flag longer train legs, station changes, and local transport needs; return travel remains a separate booking choice. The map line shows stop order, not a railway track.

Previous release 243b415 verified in mobile Lighthouse: performance 66, accessibility 100, best practices 100, SEO 100. France-only route checks cover night totals, unique bases, deliberate 2–5-night stays, all legs and climate completeness.

## 2026-09-26: map-label and recommendation ratchets

Removed Nice's legacy left-side label and raised Avignon's text slightly without moving either geographic marker. The new rendered-bounds check caught the extra-place suffix touching Nice; the corrected layout passed all four trip lengths on desktop and both narrow viewport settings. The check verifies label collisions, marker collisions and SVG clipping. Normandy is now named on the map, with Bayeux, Normandy in the itinerary; Tours/Loire Valley and Avignon/Provence are also explicit in stop headings.

France editorial rating correction: suitable sightseeing months no longer need an event tag to earn Great. The current rule requires weather comfort at least 74 and average highs 18–28°C for that weather-based category. Verified special events may also earn Great, with their weather trade-off shown; heat above 28°C caps the rating at Good, and extreme heat/storm overrides remain. Ordinary autumn activity copy does not boost ratings by itself. Paris July is Great with mild/warm outdoor conditions; October is Good with a cool-day note. This is a stated editorial rule, not a validated universal preference or a visitor/cost/crowd index. Removed Paris's unsupported association with the generic autumn-city source.

Installed the personal correction-ratchet skill and added project AGENTS.md linking the maintained rules. Further calibration should use a country Jaycee knows; Germany is the proposed next sample, with Japan and Canada useful cross-checks. No other country was changed.

## 2026-09-27: Spain regional weather comparison (release candidate)

- Existing URL: https://gowhereandwhen.com/country/spain/ . No child URL: regional month decisions belong in the country overview. Before: Madrid-only month values and unsourced regional prose. After: a six-city, twelve-month table of average daytime highs and rain, with an explicit Madrid score limit and a source disclosure. Spain is not claimed as complete national coverage.
- Added daily-derived 2001–2020 NASA POWER / MERRA-2 data for Madrid, Seville, Bilbao, Malaga and Las Palmas; Barcelona's existing sourced series is reused. `climate/spain.json` stores coordinates, request URLs, units and derivation. Complete monthly highs, lows and precipitation are checked. Tourism climate context: https://www.spain.info/en/weather/ . The original Madrid score/chart uses different input values; the new table is not a new recommendation rating or forecast.
- Removed an unsupported fixed cheapest-month answer and a Spain sun pictograph. The copy rule already bans emoji; this correction is scoped to the checked Spain page, with other pages deferred to later checked batches. Travel-route depth and region maps remain future milestones.
- `python3 storybook-lab/build.py`, `npm run build` and `npm run check` passed. Rendered table inspected at 320, 390 and 1280px: it scrolls inside its container at narrow widths, with no page overflow. Existing production mobile Lighthouse report (run 36263627806): home 44, France 67, Japan 68 performance; accessibility, best practices and SEO 100 for each. Home map weight remains a performance gap. Live page and sitemap verified after deployment of `58a127c`; 390px live view has no page overflow or Spain sun pictograph. Post-deploy Lighthouse run 36332355753 passed: home 37, France 66, Japan 69 performance; all three scored 100 for accessibility, best practices and SEO. Home LCP rose from 4.5s to 17.4s in this lab run; repeat measurement and investigate the heavy map before attributing cause. Spain has been added to the next mobile audit.
