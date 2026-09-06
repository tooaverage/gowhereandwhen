# Soft Storybook edition

Separate main map and 74 country guides. Existing play/ and cartoon/ editions are preserved byte-for-byte.

Build with `python3 storybook-lab/build.py`, then `node build-preview.cjs`.

The authored Blender scenes and export scripts are in the sibling outputs/style-studies directory. Web exports use explicit base colours because procedural Blender colour nodes do not transfer to glTF. Country geometry retains monthly ratings. There are 3,012 deduplicated shared inland boundary segments; coastlines have no added outline.

The edition includes eleven individually constructed landmarks, including Canada Place in Vancouver, eight seasonal experiences, year-round Japanese seasonal scenery, recurring typhoon-season symbols, climate-normal rain/snow/sun, small coastal markers, slow boats and planes, and the Australia gradient trial. Permanent site labels are off. Models are clickable and a sight selector provides an accessible alternative. Seasonal symbols represent typical windows, not live weather or forecasts. Sources and existing monthly data are reused from the preserved play edition.

Japan has its own Storybook guide at storybook/country/japan. Its hero uses the approved Blender diorama and seasonal tree colour/growth. Every other country guide uses the Storybook world map as its interactive hero. Clicking another supported country opens its guide and retains the month. The flat SVG city-rating and itinerary maps stay on the guide pages.

Vancouver’s full diorama remains a standalone Blender preview outside the website, now on a white background with its blue water circle. The world map uses a separately sized Canada Place model.

Selected countries keep a highlighted name label. City labels use white pills and numerical colour-coded weather ratings. The original editorial content and scoring are unchanged.
