# Travel heatmap and city coverage

The homepage has a worldwide continuous weather-colour filter, a 20-city picker, city search, local monthly panels and a linked comparison table. Query parameters `heat=1`, `country`, `city` and zero-based `m` preserve a selected view.

The featured collection uses the publicly verified 2025 Euromonitor international-arrivals top ten plus ten additional major destinations. It is labelled “20 popular cities”, not an unsupported current top-20 ranking. The site links to the source and explains the distinction.

`climate/top-cities.json` stores 20 complete monthly records from NASA POWER daily data for 2001-2020, with exact request URLs. `scripts/import-city-climate.py` refreshes these records explicitly. Builds do not call a weather API. Temperature values are means of daily highs and lows, not the monthly extreme parameters returned by the climatology API. Precipitation is the mean of complete calendar-month totals, including leap years. Regional reanalysis cannot resolve every city microclimate.

`node scripts/build-city-climate.cjs` enriches Storybook source data using the existing comfort formula. It runs within `python3 storybook-lab/build.py`. Regenerate with that command, then `npm run build` and `npm run check`.

`storybook-lab/travel-heat.mjs` interpolates a country's own city samples and available reference hub using distance weights with longitude wrapping. Single-sample countries remain uniform. Unrated geometry stays grey. Australia preserves its original ten editorial season estimates. The interpolated surface is illustrative, not full-resolution worldwide climate coverage. Monthly vertex colours are cached in the map renderer; toggling the filter restores ordinary country colours.

Validation includes source completeness, daily-average plausibility, interpolation endpoints, dateline handling, missing-data fallback and seasonal contrast. Browser checks cover all 20 city selections, monthly panel updates, the layer toggle, deep links and a 390px phone layout. Existing public-page, boundary, analytics and booking checks also pass.
