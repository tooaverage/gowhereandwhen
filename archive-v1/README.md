# Restored first design explorations

Original preserved first-pass HTML, CSS, and JavaScript, copied without changes from `work/first-pass`. The original saved source remains untouched.

## Open

Serve this directory over HTTP, then open `index.html`. Examples:

- Explorer: `?theme=explorer#map`
- Travel Bureau: `?theme=brochure#map`
- Field Atlas: `?theme=atlas#map`
- Canada guide: append `#canada` instead of `#map`.

## Recovery provenance

- Explorer and Travel Bureau images are the original saved artwork from `work/artwork`, restored under the filenames expected by the original JavaScript.
- Map geometry was copied from the existing `gowhereandwhen/design-lab/assets/world.json`.
- The original build's score and geometry logic generated `data.json` using snapshots of the current site's `data.js`, `content.js`, and `engine.js` stored under `source-data/`.
- The adapted build only writes this archive's `data.json`. Run `node build-prototypes.cjs` from this directory to regenerate it.

## Known dependencies and limits

- The visual and interaction source is preserved; the original first-pass generated `data.json` was absent, so country content and scoring use the available current-site snapshot.
- Google Fonts and the original Field Atlas Wikimedia photo need network access. The original local illustration fallback remains active if the photo fails.
- Original non-Canada guide links open the public gowhereandwhen.com website.
- This is a historical design prototype, not a current forecast.
