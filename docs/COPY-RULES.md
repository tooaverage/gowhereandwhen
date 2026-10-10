# GoWhereAndWhen copy rules

The site answers: **When should I go?**

SEO is the main growth goal. Earn visits with useful, accurate local answers. Use the fewest words that answer the question fully. No padding for search engines.

Read the ratchet log first. New entries update earlier style rules within their stated scope. They never override facts, accessibility, or an explicit user instruction.

## Priorities

1. **Useful search answers.** Help people pick a month, place or route. Keep the local detail that makes this page worth visiting.
2. **Clear and concise.** Explain it simply, at grade 5–6 reading level. No jargon or baby talk.
3. **Visual first.** Show comparisons and routes. Keep labels and key facts readable as text.
4. **Neutral voice.** This is a website, not a chat. Be specific to the place, not generic.

## When extra words belong

Add text when it answers a distinct traveller question, explains a real regional difference, or prevents a wrong decision. Use search-query evidence when available; label ideas as hypotheses when it is not.

Do not add text just to reach a word count, repeat a keyword, or make similar pages look different. Google has no preferred word count. Keep useful search headings, internal links, and accessible HTML text alongside visuals. A canvas or image must not be the only place the answer exists.

For AI search, offer useful maps, local comparisons and sourced facts. Measure referrals. Do not promise citations, rankings, or protection from summaries.

## Visual first

| Content | Default treatment |
| --- | --- |
| Months | 12-month strip with scores, weather labels and selected-month details |
| Best / avoid | Labelled month badges, tied to a named activity or score |
| Weather | One consistent icon set with text labels |
| Activities | Icon, name, months, one useful line |
| Regions | Map or small cards with the months that differ |
| Itineraries | Numbered map, stops, nights and transport links |
| Caveats | Short info note beside the relevant claim |
| Sources and methods | Accessible disclosure with links, dates and key limits |

Reuse Japan's shared city-map and itinerary components and the site design system. Use Lucide SVG icons consistently. No emojis anywhere in site copy or UI. Do not use Unicode weather symbols as icon substitutes. Decorative icons beside a text label are hidden from screen readers. Icon-only controls need an accessible name. Colour is never the only signal.
Check the rendered page after month selection: runtime code can replace a source SVG with a Unicode pictograph.

## Length targets

- Intro: 1–2 sentences, fewer than 30 words total.
- Body sentence: fewer than 20 words. Count sentences, not wrapped screen lines.
- Month note: fewer than 12 words.
- Region or activity description: fewer than 20 words.
- FAQ: answer first, normally one sentence. Add a second only when needed for accuracy.
- More than three sentences in a section: review whether a map, table, cards or disclosure would be clearer.

Use these as editing targets, not a reason to remove essential information. Record any exception and the reader question it answers in the release review, not in page copy. Reading-level scores are a signal, not proof; place names can distort them.

## Style

- Plain, neutral and direct. Answer first.
- Use “you” where useful. No first person, jokes or personal asides.
- Use months, place names and sourced numbers instead of vague claims. Do not invent precision.
- Short active sentences. Familiar words. Explain needed terms once.
- Idioms and parallel structure are allowed when clear; never use them as filler.
- No chat openers such as “So”, “And” or “Ya”. No emoji personality.
- Never use em dashes. Use full stops, commas, colons or “to” for ranges.

## Banned

- honestly, quietly
- leverage, streamline, seamless, effortless, unlock, empower, solution, offering
- “workflow” as a noun in visitor-facing copy
- Setup-punchline hooks and fragment twists
- Aphoristic closers, such as “That's the magic of Kyoto”
- Chat tone, jokes, personal asides and first-person recommendations

These rules apply to visitor-facing editorial copy, not source titles, URLs, code identifiers or quoted user feedback.

## Protect

**Facts:** temperatures, rain, scores, months and route details must match the approved data or cited sources. Never change a value to make a sentence simpler. Correct a factual error through a sourced data change, not a copy edit. Suggested route nights are editorial choices and must add up.

**Search headings:** preserve headings such as “Best time to visit Japan” and “Where to go in October”. Do not rename them during a style-only pass. Any deliberate SEO change needs a recorded reason.

**Caveats:** retain the meaning that estimates are not forecasts; comfort scores do not measure ski snow, prices or crowds; source coverage varies. Put the applicable limitation near the claim. Keep fuller details in the methodology page or source disclosure. Never hide a limitation needed to understand the recommendation.

**Local scope:** a reference-city score is not a country-wide verdict. Name the city beside the score and compare regions before making a national timing claim. Do not mark a country “Avoid” solely because one city has poor weather.

## Examples are style references

Do not publish the supplied Japan examples as verified facts. Blossom timing, driest-month claims, typhoon peaks and cheapest months need region-specific evidence. Climate data alone cannot support a cheapest-month claim. Avoid rewriting an example into a rule for every destination.

Safe structural examples:

- Intro: “Best for [activity]: [sourced months]. Compare [regions] below.”
- Region: “[Place] · [months]. [One sourced local difference].”
- Itinerary: “[Stop 1] → [Stop 2] → [Stop 3]”, with nights from route data.
- Caveat: “Planning estimates, not a forecast. Scores exclude snow, prices and crowds.”

Replace placeholders only with checked facts; never ship placeholder text.

## Before publishing

1. Check rendered editorial text for banned wording and em dashes. A raw file scan is a first pass, not a complete check.
2. Compare numbers, months, stops and night totals with the data and sources.
3. Check search headings, useful local detail, links and caveats remain.
4. Review sentence length and reading level. Cut filler; record necessary exceptions.
5. Check visuals have text equivalents, icons have labels, and content remains accessible.
6. Inspect mobile and desktop spacing, controls and overflow. Run the repository checks and review Lighthouse.
7. Log the changed URLs, source evidence, exceptions and remaining gaps. Notify Jaycee after publishing.

A writing rule is not yet an automatic test. Current repository checks cover technical regressions; human/agent review still covers these editorial targets. Add mechanical checks only where they reliably catch an actual mistake. Do not claim grade-6 compliance or a site-wide pass without reviewing it.

## Ratchet process

When Jaycee edits copy or reports a problem:

1. Compare the old and new text, or identify the concrete issue when no edited version exists.
2. State the change in one line.
3. Add a dated entry below, with her words when provided. State scope and a checkable outcome.
4. Apply it to the current change. Find other affected pages and track them in the release log.
5. Update existing pages in checked batches until covered. Do not silently rewrite unrelated facts or publish unchecked pages.
6. Record checked pages and pending pages. Never say “all fixed” before verification.

Treat corrections as evidence. Do not defend stylistic habits. Flag a conflict with facts or accessibility briefly and offer a concise alternative.

## Ratchet log

- **2026-09-26, all visitor copy:** “less = more”, “grade 6 reading level”, “show visuals where it makes sense”. Use neutral, concise, visual-first copy. No chat voice, personal asides, jokes, emoji personality, setup-punchline hooks or aphoristic endings. Idioms and parallel structure are allowed when useful.
- **2026-09-26, country guides:** Japan is the component reference. Use city/month maps and numbered itineraries; call them “Travel itinerary” or “Travel route”. Fix heading spacing. Put detailed sources in disclosures while retaining essential limits beside claims.
- **2026-09-26, SEO priority:** “if we need them for SEO then add the words”. Add useful answers and distinct local detail, never filler to meet a word count. Keep explanations concise and jargon-free. Proposed interpretation: word limits are targets with documented accuracy/usefulness exceptions.

- **2026-09-26, all site copy and UI:** “no emojis!!” Use labelled Lucide SVG icons. Decorative icons beside labels are hidden from screen readers. Check changed pages for emoji and Unicode pictographs before publishing.
- **2026-10-07, Japan checked page:** The month script replaced source icons with pictographs. Remove them in the checked Japan batch and inspect the rendered controls. Other guides remain for later checked batches.
- **2026-10-09, China checked page:** The Beijing score was presented beside broad China-wide dry/mild season claims, while the only sourced city records were Hong Kong and Macao. Add sourced mainland city comparisons, keep the Beijing limit visible, and inspect the rendered month controls. Other guides remain for checked batches.

- **2026-09-26, source notes and footer:** Avoid scientific phrasing such as “gridded climate averages”, “reference dataset” and “climate normals”. Use plain words such as “past weather averages”. Keep the source name, years and material differences in a short source disclosure. Do not repeat the full method in the footer.
- **2026-09-26, shared UI:** Month panels need closed rounded borders and score badges that stay in place when opened. Footer groups need clear spacing. Icons should feel round and playful through SVG strokes and soft backgrounds, never emojis.

## Evidence behind the SEO rule

- [Google: helpful, reliable content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google: optimizing for generative AI search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

Reviewed 26 September 2026. Recheck when evidence or guidance changes; do not promise results.

- **2026-09-26, France sample only:** Group related content with 4px between label and heading, 8px between heading and supporting text, 24px between groups, and 48px between sections. Keep route stops beside the map on desktop and directly below on mobile. Colour route-month controls by the same fixed weather score scale; show numbers and explain that the score averages the selected stops. Review before applying elsewhere.

- **2026-09-26, France sample controls:** Related choices belong in one compact panel with matching labels. Remove inherited picker margins and padding before adding group gaps. Keep the season tip beside the month label; do not repeat weather explanations beside the route.

- **2026-09-26, France sample:** Show selected-month daytime highs beside itinerary city names. Month buttons use deep shadows in a darker shade of their own colour. “Best time to go” is the product goal, but current numeric scores cover weather only. Do not relabel them as overall travel scores without sourced crowd, cost and activity inputs and an explained method.

- **2026-09-26, France sample recommendation model:** Use “Travel rating: weather + activities + events” beside recommendation controls and map legends. Explain the seasonal reason and trade-off at each place. Keep weather-only charts explicitly labelled weather. Do not imply crowds, prices or closures are rated until supported. Use categorical recommendations instead of false-precision overall numbers. These instructions supersede the earlier weather-only map direction for this sample; no global rollout is authorized.

- **2026-09-26, France travel ratings:** Use the same ordered labels everywhere: Great, Good, Fair, Poor. Do not mix actions (“Go”, “Plan”) with rating adjectives. Every rating needs a plain reason; demand-season labels are a separate concept.

- **2026-09-26, destination selection and routes:** “top places travellers want to go to” and “NOT JUST WEATHER”. Choose worthwhile travel bases using comparable official visitor data, repeated traveller recommendations and independent guide cross-checks. Weather samples do not automatically belong on an itinerary. Use Low season, Shoulder season and High season for tourism demand, with sourced local windows. Plan each trip length explicitly; never stretch a few stops proportionally to fill a month. Allow travel time and explain each stop's draw. Crowds and cost are trade-offs, not automatic penalties against skiing or major seasonal events.

- **2026-09-26, country map labels:** Nice's legacy left-side label collided with Avignon. Default labels to the right; make exceptions only for a documented layout need. Recheck rendered label/marker collisions and clipping whenever destinations change.
- **2026-09-26, corrections:** Every requested correction must produce a scoped, durable lesson or a clearly marked one-off decision. Merge into the existing rule rather than creating duplicates. Apply it within the authorized scope and record the actual verification; a correction does not authorize a site-wide rollout.

- **2026-09-26, France recommendations:** “there should also be great” and “it's not clear why Paris is only good not great in July”. Every rating needs an evidence-based reason. Do not cap suitable months at Good simply because they lack an event tag. Do not invent crowd or price penalties. Use fixed criteria; never force every route to display every colour or label.

- **2026-09-26, region discoverability:** “why wasn't Normandy added”. When a route represents a region through a base town, show both names in the itinerary and the recognisable region on the map where practical. Bayeux alone does not make Normandy discoverable. Apply the same principle to Tours/Loire Valley and Avignon/Provence.
- **2026-09-26, rating calibration:** General autumn suggestions do not by themselves justify Great. Explanations must distinguish mild/warm sightseeing days from cool or hot trade-offs and exceptional events. These are editorial criteria, not a measured universal preference. Validate the next sample in a country the owner knows before wider rollout.

- **2026-10-10, published Germany guide:** The old loop implied a Deutschland-Ticket covers intercity trains. State its local-transport scope and that ICE, IC and EC usually need a separate ticket, using Deutsche Bahn as the source. Check the rendered route lead and source link. This corrects the established guide; the newer Germany recommendation preview remains unpublished.
