"""Render the Philippines island portraits as readable, progressively enhanced HTML."""
import json
from html import escape
from pathlib import Path
from urllib.parse import quote

root = Path(__file__).resolve().parent
islands = json.loads((root / 'philippines-islands.json').read_text())


def link(label, url):
    return f'<a href="{escape(url, quote=True)}" target="_blank" rel="noopener noreferrer">{escape(label)} ↗</a>'


parts = ['''<section class="guide-section island-life" id="island-life" aria-labelledby="island-life-title"><div class="wrap">
<div class="island-intro"><div><p class="island-kicker">A place to settle into</p><h2 id="island-life-title">Find your kind of island</h2><p class="lead">The feel of a place, the beach outside your door, and what a stay actually costs.</p></div><p class="island-geography">Palawan is the wider region for El Nido and Coron. Panglao is a beach base in Bohol. The outings below are things to do from a base, not extra towns to squeeze into a trip.</p></div>
<div class="island-tabs" aria-label="Choose an island base">''']
for island in islands:
    parts.append(f'<button type="button" id="island-tab-{island["id"]}" data-island="{island["id"]}" aria-controls="island-{island["id"]}">{escape(island["name"])}</button>')
parts.append('</div><div class="island-portraits">')
for index, island in enumerate(islands):
    e = lambda key: escape(island[key])
    parts.append(f'''<article class="island-portrait" id="island-{e('id')}" data-season="{e('season')}" aria-labelledby="island-name-{e('id')}">
<header class="island-title"><div><p class="island-kicker">{e('area')}</p><h3 id="island-name-{e('id')}">{e('name')}</h3><p class="island-line">{e('line')}</p></div><a class="button island-map-link" href="https://www.google.com/maps/search/?api=1&amp;query={quote(island['map'])}" target="_blank" rel="noopener noreferrer">Google Maps ↗</a></header>
<ul class="island-tags" aria-label="At a glance">{''.join('<li>'+escape(tag)+'</li>' for tag in island['tags'])}</ul>
<div class="island-columns"><div class="island-story"><p class="island-vibe">{e('vibe')}</p>
<dl class="island-facts"><div><dt>The swimming</dt><dd>{e('beach')}</dd></div><div><dt>Working from here</dt><dd>{e('work')}</dd></div><div><dt>Getting around</dt><dd>{e('move')}</dd></div></dl>
<p class="island-catch"><strong>The catch</strong>{e('catch')}</p></div>
<aside class="island-budget" aria-label="{e('name')} costs"><p class="island-kicker">{e('costLabel')}</p><p class="island-price">{e('cost')}</p><p>{e('costNote')}</p><div><h4>Right on the water?</h4><p>{e('waterfront')}</p></div><div><h4>The rest of the budget</h4><p>{e('extraCost')}</p></div><p class="island-cost-foot">Philippine pesos · Room examples, not a total daily budget. Check dates, taxes and inclusions before booking.</p></aside></div>
<div class="island-season" hidden><div><p class="island-kicker">Your travel month</p><label for="island-month-{e('id')}">What changes in <select id="island-month-{e('id')}" class="island-month" aria-label="Travel month for {e('name')}">{''.join(f'<option value="{i}">{m}</option>' for i,m in enumerate(['January','February','March','April','May','June','July','August','September','October','November','December']))}</select></label></div><p class="island-season-note" aria-live="polite"></p></div>
<div class="island-daily"><div><h4>Eating well</h4><p>{e('food')}</p></div><div><h4>Finding company</h4><p>{e('social')}</p></div></div>
<div class="island-outings"><p class="island-kicker">Things to do from here</p><h4>Leave room for a little exploring</h4><ul>''')
    for name, kind, note in island['activities']:
        parts.append(f'<li><span>{escape(kind)}</span><strong>{escape(name)}</strong><p>{escape(note)}</p></li>')
    parts.append('</ul></div><details class="island-sources"><summary>Sources & price notes</summary><p>Reviewed September 7, 2026. Vibe descriptions are editorial judgments. Prices are linked examples or explicitly labelled planning allowances, not live availability. Workspace facilities are operator claims, not independently measured uptime.</p><ul>')
    parts.extend('<li>'+link(label, url)+'</li>' for label, url in island['sources'])
    parts.append('<li>'+link('PAGASA climate normals', 'https://www.pagasa.dost.gov.ph/climate/climatological-normals')+'</li></ul></details></article>')
parts.append('''</div><div class="island-practical"><div><p class="island-kicker">Before a longer stay</p><h3>Check the room, not just the island.</h3></div><div><p><strong>For calls:</strong> ask for a recent speed test and a short video call from the room at your working hour. Check upload stability, noise, backup internet and whether the router stays powered during an outage.</p><p><strong>For swimming:</strong> ask what the shore looks like at low tide. Sea view, waterfront and an easy sandy swimming beach are different things.</p><p><strong>For boat days:</strong> leave slack around ferries and island outings. Monthly climate describes a pattern, not your forecast; wind and gale warnings can stop trips even without all-day rain. <a href="https://www.pagasa.dost.gov.ph/marine/gale-warning" target="_blank" rel="noopener noreferrer">Check PAGASA marine advisories ↗</a></p></div></div></div></section>''')
(root / 'philippines-guide.html').write_text('\n'.join(parts))
print(f'Built {len(islands)} Philippines island portraits.')
