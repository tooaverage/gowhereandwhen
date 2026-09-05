# Explorer world editions

The main `/play/` world uses the corrected Blender export. `/cartoon/` uses a separate rounded export with the same travel data. The Japan guide's dedicated diorama is unchanged.

Build all preview editions in this order:

```
python3 game-lab/build.py
python3 bureau-lab/build.py
python3 game-lab/build-editions.py
node build-preview.cjs
```

The editable Blender sources and export scripts are in `../work/world-blender/`. `world-map-v7.blend` contains the lower terrain and smaller, spaced scenery. `world-cartoon-v7.blend` contains the rounded variant. Country geometry is illustrative elevation on geographic outlines, not a measured DEM.

`world-details.js` holds ten landmarks, seasonal experiences, beach-town markers, and the Australia regional experiment. Australia uses editorial monthly travel-season estimates for ten locations, interpolated by inverse-distance weighting. These are not measured climate observations or a live forecast. The existing national scores remain unchanged. The regional overlay is optional and clearly labelled.

Sources for seasonal windows are linked on the relevant map information cards: JNTO, Holland.com, Visit Finland, Visit Norway, Visit Iceland, Magical Kenya, Tanzania Parks, SANParks, PAGASA and JMA. Australia season context: https://www.australia.com/en/facts-and-planning/when-to-go/australias-seasons.html

Verification for this pass: JavaScript syntax; both GLB exports contain 206 country objects, six boat roots, four plane roots, and four cherry-tree roots; desktop country hover and selection; zoom floor at distance 18; constrained world panning; optional orbit and top view; monthly colours and seasonal visibility; Australia regional gradient; expanded mobile China prose at 390px with no horizontal overflow. The country-map hero module was checked unchanged.
