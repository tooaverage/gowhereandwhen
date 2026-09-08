"""Render the Philippines island portraits as readable, progressively enhanced HTML."""
import json
import re
from html import escape
from pathlib import Path
from urllib.parse import quote

root = Path(__file__).resolve().parent
islands = json.loads((root / 'philippines-islands.json').read_text())
islands.sort(key=lambda island: island['rank'])
fx = json.loads((root / 'philippines-fx.json').read_text())
photos = {photo['destination']: photo for photo in json.loads((root / 'assets/islands/credits.json').read_text())}


def cad_number(value):
    return f'{round(float(value) * fx["cadPerPHP"]):,}'


def cad_text(value):
    def convert(match):
        first = cad_number(match.group(1).replace(',', ''))
        second = '–' + cad_number(match.group(2).replace(',', '')) if match.group(2) else ''
        return 'CA$' + first + second
    return re.sub(r'₱([\d,]+)(?:–([\d,]+))?', convert, value)


def cad_range(island):
    return 'CA$' + '–'.join(cad_number(value) for value in island['roomPHP'])


metrics = [('swim', 'Swimming'), ('outdoors', 'Land adventures'), ('quiet', 'Quiet'), ('value', 'Value'), ('work', 'Work options'), ('scooter', 'Scooter exploring')]


def stars(value, label):
    return f'<span class="island-stars" role="img" aria-label="{escape(label)}: {value} out of 5" title="{escape(label)}: {value} out of 5"><span aria-hidden="true">{"★" * value}<span class="island-stars-empty">{"☆" * (5-value)}</span></span></span>'


def link(label, url):
    return f'<a href="{escape(url, quote=True)}" target="_blank" rel="noopener noreferrer">{escape(label)} ↗</a>'


parts = ['''<section class="guide-section island-life" id="island-life" aria-labelledby="island-life-title"><div class="wrap">
<div class="island-intro"><div><p class="island-kicker">A place to settle into</p><h2 id="island-life-title">Find your kind of island</h2><p class="lead">Beach days, nature, and a place to work. Here’s where we’d start.</p></div><p class="island-geography">Palawan is the wider region for El Nido and Coron. Panglao is a beach base in Bohol. The outings below are things to do from a base, not extra towns to squeeze into a trip.</p></div>
<div class="island-comparison" aria-labelledby="island-compare-title"><div class="island-compare-heading"><div><p class="island-kicker">The shortlist, in order</p><h3 id="island-compare-title">Compare your island days</h3></div><span class="island-currency-label">Prices in CAD</span></div><p class="island-ranking-brief">Ordered for calm swimming, nature, value and a working stay, with no diving or surfing required. These are editorial fit ratings, not guest reviews or measured internet reliability.</p><p class="island-table-hint">Scroll sideways to compare every column. Select a place for photos and the full picture.</p><div class="island-table-scroll" tabindex="0" role="region" aria-label="Island comparison, scroll horizontally for all ratings"><table class="island-compare-table"><caption class="island-sr">Eight islands ranked for beach life and a working stay. Stars run from one, a weaker fit, to five, a stronger fit.</caption><thead><tr><th scope="col">Place / overall order</th>''']
for key, label in metrics:
    parts.append(f'<th scope="col">{label}</th>')
parts.append('<th scope="col">Room / night<br><span>Approx. CAD</span></th></tr></thead><tbody>')
for island in islands:
    e = lambda key: escape(island[key])
    parts.append(f'<tr><th scope="row"><a class="island-compare-place" href="#island-{e("id")}" data-island-jump="{e("id")}"><span class="island-rank">{island["rank"]}</span><img src="../../assets/islands/{e("id")}-thumb.webp" alt="" width="72" height="54" loading="lazy" decoding="async"/><span><strong>{e("name")}</strong><small>{e("recommendation")}</small></span></a></th>')
    for key, label in metrics:
        parts.append('<td>'+stars(island['ratings'][key],label)+'</td>')
    parts.append(f'<td class="island-table-cost"><strong>{cad_range(island)}</strong><small>{"Planning estimate" if "estimate" in island["costLabel"] or "allowance" in island["costLabel"] else "Room examples"}</small></td></tr>')
parts.append('''</tbody></table></div><div class="island-comparison-notes"><p><strong>Reading the stars:</strong> 1 = weaker fit, 5 = stronger fit. “Land adventures” covers walks, hikes and nature outings. “Work options” describes the setup available, not guaranteed call quality. Value is an editorial judgment; the room examples vary in standard and location.</p><p><strong>Month matters:</strong> January is the first month we’d explore for most of this beach shortlist. October and November need more flexibility. Siargao’s wetter winter pattern is different; open a place and change the month for context.</p></div>''')
parts.append(f'<p class="island-fx-note">CAD estimates use {link(fx["sourceLabel"],fx["source"])} from September 7, 2026: CA$1 ≈ ₱{fx["phpPerCAD"]:.2f}. Rounded to whole dollars, before currency-conversion fees. Room costs exclude meals, transport and activities.</p></div>')
parts.append('<div class="island-tabs" aria-label="Choose an island base">')
for island in islands:
    parts.append(f'<button type="button" id="island-tab-{island["id"]}" data-island="{island["id"]}" aria-controls="island-{island["id"]}"><span class="island-tab-rank">{island["rank"]}.</span> {escape(island["name"])}</button>')
parts.append('</div><div class="island-portraits">')
for index, island in enumerate(islands):
    e = lambda key: escape(cad_text(island[key]))
    photo = photos[island['id']]
    parts.append(f'''<article class="island-portrait" id="island-{e('id')}" data-season="{e('season')}" aria-labelledby="island-name-{e('id')}">
<figure class="island-photo"><img src="../../assets/islands/{e('id')}.webp" alt="{escape(photo['caption'])}" width="{photo['width']}" height="{photo['height']}" loading="lazy" decoding="async"/><figcaption><span>{escape(photo['caption'])}</span><a href="#photo-credit-{e('id')}" class="island-credit-jump">Photo credit ↓</a></figcaption></figure>
<header class="island-title"><div><p class="island-kicker">{e('area')}</p><h3 id="island-name-{e('id')}">{e('name')}</h3><p class="island-line">{e('line')}</p></div><a class="button island-map-link" href="https://www.google.com/maps/search/?api=1&amp;query={quote(island['map'])}" target="_blank" rel="noopener noreferrer">Google Maps ↗</a></header>
<div class="island-verdict"><span class="island-rank">{island['rank']}</span><p><strong>{e('recommendation')}</strong>{e('whyRank')}</p></div>
<ul class="island-tags" aria-label="At a glance">{''.join('<li>'+escape(tag)+'</li>' for tag in island['tags'])}</ul>
<div class="island-columns"><div class="island-story"><p class="island-vibe">{e('vibe')}</p>
<dl class="island-facts"><div><dt>The swimming</dt><dd>{e('beach')}</dd></div><div><dt>Working from here</dt><dd>{e('work')}</dd></div><div><dt>Getting around</dt><dd>{e('move')}</dd></div></dl>
<p class="island-catch"><strong>The catch</strong>{e('catch')}</p></div>
<aside class="island-budget" aria-label="{e('name')} costs"><p class="island-kicker">{e('costLabel')}</p><p class="island-price">≈ {cad_range(island)}</p><p>{e('costNote')}</p><div><h4>Right on the water?</h4><p>{e('waterfront')}</p></div><div><h4>The rest of the budget</h4><p>{e('extraCost')}</p></div><p class="island-cost-foot">Approximate Canadian dollars · Room costs, not a total daily budget. Check dates, taxes and inclusions before booking.</p></aside></div>
<div class="island-season" hidden><div><p class="island-kicker">Your travel month</p><label for="island-month-{e('id')}">What changes in <select id="island-month-{e('id')}" class="island-month" aria-label="Travel month for {e('name')}">{''.join(f'<option value="{i}">{m}</option>' for i,m in enumerate(['January','February','March','April','May','June','July','August','September','October','November','December']))}</select></label></div><p class="island-season-note" aria-live="polite"></p></div>
<div class="island-daily"><div><h4>Eating well</h4><p>{e('food')}</p></div><div><h4>Finding company</h4><p>{e('social')}</p></div></div>
<div class="island-outings"><p class="island-kicker">Things to do from here</p><h4>Leave room for a little exploring</h4><ul>''')
    for name, kind, note in island['activities']:
        parts.append(f'<li><span>{escape(kind)}</span><strong>{escape(name)}</strong><p>{escape(note)}</p></li>')
    parts.append('</ul></div><details class="island-sources"><summary>Sources & price notes</summary><p>Reviewed September 7, 2026. Vibe descriptions and star ratings are editorial judgments. Prices are linked examples or explicitly labelled planning allowances, not live availability. Workspace facilities are operator claims, not independently measured uptime.</p><ul>')
    parts.extend('<li>'+link(label, url)+'</li>' for label, url in island['sources'])
    parts.append('<li>'+link('PAGASA climate normals', 'https://www.pagasa.dost.gov.ph/climate/climatological-normals')+'</li></ul></details>')
    parts.append(f'<p class="island-photo-credit" id="photo-credit-{e("id")}">Photo: {link(photo["author"],photo["source_page_url"])} · {link(photo["license"],photo["license_url"])}. Resized and compressed; display may crop. Photo derivatives retain the linked licence.</p><a class="island-back-compare" href="#island-compare-title">↑ Back to comparison</a></article>')
parts.append('''</div><div class="island-practical"><div><p class="island-kicker">Before a longer stay</p><h3>Check the room, not just the island.</h3></div><div><p><strong>For calls:</strong> ask for a recent speed test and a short video call from the room at your working hour. Check upload stability, noise, backup internet and whether the router stays powered during an outage.</p><p><strong>For swimming:</strong> ask what the shore looks like at low tide. Sea view, waterfront and an easy sandy swimming beach are different things.</p><p><strong>For boat days:</strong> leave slack around ferries and island outings. Monthly climate describes a pattern, not your forecast; wind and gale warnings can stop trips even without all-day rain. <a href="https://www.pagasa.dost.gov.ph/marine/gale-warning" target="_blank" rel="noopener noreferrer">Check PAGASA marine advisories ↗</a></p></div></div></div></section>''')
(root / 'philippines-guide.html').write_text('\n'.join(parts))
print(f'Built {len(islands)} Philippines island portraits.')
