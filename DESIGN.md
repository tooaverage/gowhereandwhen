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
