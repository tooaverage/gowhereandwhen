# SEO and performance release - 8 September 2026

Production remains the existing GitHub Pages workflow for gowhereandwhen.com. The legacy .openai preview configuration is not the production build.

## Build and verify

- Install locked development dependencies with `npm ci --ignore-scripts`.
- After editing Storybook source, run `python3 storybook-lab/build.py` to regenerate the Storybook edition.
- Run `npm run build && npm run check`. The public build includes 89 canonical pages: homepage, country directory, 74 country guides, 12 month comparisons and methodology.
- The GitHub Pages workflow runs the same build and checks before publishing.
- `scripts/enhance-public.cjs` owns public titles, crawlable directories, sitemap, methodology, archive indexing rules, inline styles and bundled runtime entrypoints.
- Keep the sitemap modification date tied to a material release, not every build invocation. The initial SEO release date is 2026-09-08.

## Map performance

Original scene assets remain available. Optimized assets use Meshopt compression with 16-bit positions and 12-bit normals; every scene node name and semantic extras record is preserved. Run `npm run optimize:models` when the original assets change, then regenerate Storybook.

The build precomputes 526 terrain queries from the exact optimized world model using the same Three.js code as the browser. `scripts/build-map-cache.cjs` regenerates that cache for every public build. The browser retains a raycast fallback for unknown positions or failed cache delivery. This removes repeated expensive work without moving landmarks or removing map features. Country labels use interior anchors from each country's largest Natural Earth polygon, with a capital fallback when a centroid is offshore.

The boundary repair corrects 249 missing height samples from the original Blender export while preserving every longitude/latitude endpoint and border connection. Nearby country labels stay visible at closer zooms, avoid the guide title, and point near the terrain. Baked snow material on country terrain follows the weather colour; decorative snowy scenery stays intact.

Procedural scenery reuses identical primitive geometries and merges typed buffers. Map initialization yields between landmarks and shader compilation. Labels avoid repeated forced layout, and animation pauses when the map is offscreen. Compressed geometry can decode in two Web Workers, with the synchronous decoder retained if workers are unavailable.

## Research and content boundaries

Lighthouse SEO already scored 100 before this work; that audit does not establish Google rankings or indexing. Query-intent titles, crawlable navigation, content usefulness and data provenance need separate attention.

Country weather values remain the existing curated estimates. Do not attribute them to an official station or 1991-2020 period without verifying the actual dataset. Scores are not measurements of ski conditions, hotel prices, crowds or forecasts. The Austria activity-season update cites Austria Tourism; the methodology explains source coverage limits.

Do not add fake authors, fabricated travel experience, automated backlinks or superficial translations. Keep personal trip planning out of public source and build output, as described in PROJECT-STATUS.md.

## Follow-through

After release, use Search Console URL Inspection for the homepage, Austria and a month guide; check Google's selected canonical and rendered content, submit sitemap.xml and request indexing for priority updated URLs. Compare impressions, indexed canonical pages, clicks and field Core Web Vitals over subsequent weeks. A good Lighthouse score does not guarantee rankings.
