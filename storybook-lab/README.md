# Soft Storybook edition

Separate main map and Japan guide. Existing play/ and cartoon/ editions are preserved byte-for-byte.

Build with `python3 storybook-lab/build.py`, then `node build-preview.cjs`.

The authored Blender scenes and export scripts are in the sibling outputs/style-studies directory. Web exports use explicit base colours because procedural Blender colour nodes do not transfer to glTF. Country geometry retains monthly ratings. There are 3,012 deduplicated shared inland boundary segments; coastlines have no added outline.

The edition includes ten individually constructed landmarks, eight seasonal experiences, year-round Japanese seasonal scenery, recurring typhoon-season symbols, climate-normal rain/snow/sun, small coastal markers, slow boats and planes, and the Australia gradient trial. Permanent site labels are off. Models are clickable and a sight selector provides an accessible alternative. Seasonal symbols represent typical windows, not live weather or forecasts. Sources and existing monthly data are reused from the preserved play edition.

Japan has its own Storybook guide at storybook/country/japan. Its hero uses the approved Blender diorama and seasonal tree colour/growth. Other country guides continue to use their existing play URLs.

Vancouver is a standalone original Blender preview outside the website and is not included in this edition.
