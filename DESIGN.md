## Production contract (26 September 2026)

The live site uses Storybook, built from storybook-lab through build-public.cjs. Older directions below are historical, not permission to mix styles. Reuse Lilita One headings, Nunito Sans text, shared game.css and seo.css tokens, established components and semantic weather colours. Country content uses guide-section/wrap, weather-table/table-scroll and existing navigation. Verify 320px, 390px and desktop; tables may scroll inside their container but the whole page must not overflow. No per-country theme, fonts or invented card system.

# When to go design exploration

## Active direction

A low-poly travel game. Faceted land, coast layers, trees, small city buildings and clickable destination markers make the full-width world map explorable. Japan has a rotatable original low-poly diorama in the country header. It is clearly labelled illustrative. Geographic city maps retain real outlines and coordinates; terrain relief is stylized, not elevation data.

## Typography and color

Lilita One supplies the playful display lettering. Nunito Sans carries readable UI and prose. No handwritten type, no uppercase small text; uppercase is limited to place names. Red, orange, yellow, light green and deep green carry the unchanged weather score bands. Weather badges have verified text contrast above 4.5:1. Borders and short vertical offsets on controls intentionally reference physical game pieces.

## Mobile first

Single-column country guides, a compact map overlay, all twelve global month controls in two rows, expandable monthly details, and a persistent accommodation shortcut. City weather tables scroll within their own container. Keyboard controls, focus rings, color-independent labels and reduced motion are retained.

## Complete content

Original lead, introduction, region prose, activity advice, events, warnings, monthly values, route variants and sources, FAQs, schema and affiliate hooks are preserved. The route continues to support 3, 7, 14 and 30 days. A shared month drives country graphs and city weather. Tokyo and Manila now correctly inherit their hub storm penalties in city scores.

## Versions

/play/ contains the low-poly Explorer. /archive-v1/ preserves the original three Canada directions, including the brochure header. /prototypes/ preserves the terrain and restyled original guide layout. /versions/ links to every round. Original production-site source remains unchanged.

## Travel Bureau and heatmap revision

/bureau/ is the current brochure edition, including the same 74 complete guides. Japan and the Philippines have authentic, credited photography paired with source geography. Barlow Condensed, DM Serif Display and DM Sans replace the handwritten style. Cream, dark teal, ochre and blue-green map paper follow the supplied historical references; weather colors retain all five semantic bands.

Both maps recolor country surfaces for the selected month. Explorer keeps faceted shading with fewer trees, small cities, selected lakes and shore detail. Bureau uses flat fills, thin geographic boundaries and a coordinate grid. Date-line clipping preserves Russia and Alaska. Measured label boxes control collisions, and map wheel capture handles trackpad pinch without scaling the page. City filters leave the expanded monthly prose untouched to preserve reading position.

Build with node game-lab/build-data.cjs, python3 game-lab/build.py, python3 bureau-lab/build.py, then node build-preview.cjs. Generated play and bureau pages are built from the unchanged original country articles. /versions/ links current and archived rounds.

## Country guide standard

Japan is the reference for city-by-month and route maps. Less is more: grade 6 reading level, short decision-led copy, labelled icons where helpful, sources under disclosure controls, consistent space between headings and content. Reuse shared components across countries as their local data becomes available. No wall-of-text source disclaimers. Keep material score limitations visible in plain language.

The maintained editorial contract is [docs/COPY-RULES.md](docs/COPY-RULES.md). No emojis. Use the shared Lucide SVG helper with visible text labels. The initial France card emojis have been replaced.

### Spacing ratchet, France sample pending review

Use 4px for label-to-heading, 8px for closely related content, 24px between control/content groups, and 48px between sections. Opening disclosures must not move adjacent score badges. Keep route and map together. Avoid stacking component margins to create accidental gaps. Inspect desktop and mobile before expanding this sample.

### Map-label ratchet, 26 September 2026

City names sit to the right of their marker by default. Do not retain a place-specific left-side override after changing neighbouring destinations. An exception needs a documented clipping or collision reason. After adding places or changing map layout, check actual rendered label boxes against other labels, markers and the SVG bounds on desktop and narrow screens, including extra-place suffixes and every trip length. Keep geographic coordinates fixed; use a labelled leader line if a marker ever needs a visual offset. The read-only browser check is `scripts/check-map-label-layout.js`.
