# Content releases

## 2026-09-26: workflow foundation

- Existing public coverage: 202 map records, 74 guides, 69 city records (36 carry a source object), plus Australia's ten-point regional prototype. Nine countries have multiple city records. These counts are an inventory, not a review certificate.
- Initial queue established in content-coverage.json. No country expansion batch has been completed under this daily workflow yet.
- Public UI clarifies travel weather comfort rather than temperature. Fixed-scale interpolation is explicitly regression-tested.
- City selection joins the consent-based analytics event set. Real traffic totals remain unverified until dashboard access succeeds.

## 2026-09-26: France pilot, published

- Deployment 36257801307 succeeded for commit 94f36e8; live six-city section and route verified.
- Updated /country/france/ with a compact six-city September/October comparison, a Paris–Lyon–Nice suggested rail route, source links, and clearer coastal/Alpine limitations. Existing canonical URL retained; no new competing page.
- Added NASA POWER daily-derived 2001–2020 climate for Lyon, Nice, Bordeaux, Brest and Strasbourg; Paris already existed. Full 12-month validation passes. Exact requests are in climate/france.json. These are regional samples, not complete mountain/Corsica/overseas coverage. The older Paris-only chart remains explicitly distinguished from the new sourced table.
- Sources: France.fr climate/geography and lavender guidance, SNCF Connect Paris–Lyon and Lyon–Nice route pages, NASA POWER daily API.
- Corrected a historical spring-lavender claim and unsupported snow certainty. Kept the shared Storybook design system. Fixed clipped camera labels at 320px.
- Lighthouse baseline: home 67 performance, France 59; both 100 accessibility/best practices/SEO in one simulated-mobile run. These are lab baselines, not rankings. Heavy 3D loading remains a performance backlog item. Added automatic post-deploy Lighthouse reports for home/France/Japan.
- Pilot is a manual execution of the workflow. The standalone Sol scheduler is configured separately and has not yet completed its first scheduled batch.
