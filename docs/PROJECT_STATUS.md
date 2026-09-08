# Project status

## Published

- Storybook is the production design at https://gowhereandwhen.com/.
- The Philippines Island life section includes eight destination photos, accessible comparison stars, editorial rankings and approximate CAD accommodation costs.
- Published feature commit: f59d53af2082208af8d0a6a65642dc62a91f5e0d.
- The comparison is general editorial guidance. Prices are dated reference examples, not live availability. Internet ratings describe available work options, not verified service in a particular room.

## Build and release

- Edit the island data and generator in `storybook-lab/`.
- Run `python3 storybook-lab/build.py`, then `node build-public.cjs`.
- Commit source and regenerated `storybook/` files. `public-dist/` is ignored.
- The existing GitHub Pages workflow publishes on pushes to `main`.
- The build explicitly selects public assets; this documentation is not included in the published output.

## Privacy boundary

- Keep personal travel planning, accommodation shortlists, booking quotes, account information, addresses, flight details and pasted conversations out of source control and public output.
- Do not turn private planning discussions into public site content without explicit authorization.
- Preserve required public photo attribution and licensing.
- A targeted review of tracked text and the generated public output found no personal planning identifiers or saved accommodation-list content.

## Resume

- The published feature is complete; no further implementation or deployment is pending for it.
- Await the next requested site change. Do not publish private planning notes as a follow-up task.
