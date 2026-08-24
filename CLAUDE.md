# CLAUDE.md

**NEVER use em dashes. Anywhere. Not in user-facing strings, not in comments, not in commit messages, not in PR descriptions, not in docs. Use a period, comma, colon, parentheses, or rewrite the sentence. No exceptions.**

## What this is

When To Go (gowhereandwhen.com): an interactive world map plus per-country guides showing the best time of year to visit each place, month by month, colored by a 0 to 100 weather comfort rating.

## House rules

- Static site, no build step required to serve. The deployed artifact is these files at the repo root, published to GitHub Pages and served at gowhereandwhen.com. Vanilla JS, hand-rolled CSS, warm vintage theme, mobile-first.
- `index.html` is the standalone map app (self-contained: inline CSS/JS, climate data inlined as `DATA`). It loads the world map and fonts from CDNs only.
- Country pages are generated. `gen.js` reads `content.js` (editorial), `data.js` (climate normals) and `engine.js` (scoring) and writes `country/<slug>/index.html`, `country/index.html`, `sitemap.xml` and `llms.txt`. Run `node gen.js` after any change to those inputs, then commit the regenerated output.
- The scoring engine stays pure. No globals, no DOM access in the functions exported from `engine.js`. All thresholds live in `CFG`.
- `data.js` must stay byte-identical to the `DATA` array inlined in `index.html`.
- Design system is `styles/wtg.css`. Tasteful mid-century travel-brochure look: warm cream paper, one deep teal plus a muted terracotta accent, condensed display caps, a small script kicker. No gradients, no drop shadows, no rainbow headings, no cartoon badges. Restrained, editorial, not busy.
- User-facing strings are direct and short. No design jargon, no LLM flavour. If you can drop a word without losing meaning, drop it.
- Facts (months, seasons, hazards, events) are checked against current best-time-to-visit guides before publishing.

## Hero images (optional)

`gen-images.js` generates one vintage-style illustration per country with Nano Banana Pro (Gemini 3 Pro Image), saved to `images/<slug>.jpg`. `gen.js` drops the image into the top of each country cover when the file exists, and skips the band when it does not. Run it with a `GEMINI_API_KEY`, then rerun `gen.js`.

## Deploy

Push to `main`. The Pages workflow (`.github/workflows/deploy-pages.yml`) uploads the repo root and deploys. The `CNAME` file sets the custom domain.

## Backlog

- Auto-generated hero illustrations for all countries
- More countries and cities
- Stay22 and Travelpayouts affiliate IDs (currently public placeholders)
- Personal calibration, activity picker, runs-cold / runs-warm toggle
