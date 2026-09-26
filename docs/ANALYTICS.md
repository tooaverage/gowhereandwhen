# PostHog analytics

Configured for the separate GoWhereAndWhen organization and project 613152 (US region): https://us.posthog.com/project/613152. It does not send data to Design Recap or Get Thy Bread. Configuration lives in `analytics.config.json`: `projectToken` is the public ingestion token, and `apiHost` is the matching US/EU ingestion host. GitHub Actions variables `POSTHOG_PROJECT_TOKEN` and `POSTHOG_API_HOST` can override these. Never put a personal API key in the repository or browser code. An empty token disables integration entirely.

The deferred first-party consent controller dynamically imports a separate, locally bundled PostHog SDK only after opt-in. The pinned SDK uses `module.no-external` to prevent loading extension scripts. Session replay, autocapture, person profiles, feature flags, heatmaps, surveys, error capture, performance capture and advertising integrations are disabled. No SDK or third-party request is made before consent. Localhost and every hostname other than the two production domains are excluded.

Visitors can decline or withdraw using Analytics preferences in the footer. Global Privacy Control is respected. The consent choice expires after six months; the SDK is not loaded on expired consent. Withdrawal calls the SDK opt-out and clears its persistence (with `opt_out_persistence_by_default`). Consent changes synchronize between open tabs. Provider-specific consent uses a new key so any earlier Google Analytics consent is not reused. No Google Analytics tag is installed alongside PostHog.

Events: `$pageview`, `open_guide`, `select_month`, `search_destination`, `booking_click`, `select_island`, `map_control`, `select_city`. Month changes do not create extra pageviews. Properties include recognized destination/island slugs, numeric month, provider hostname, booking type, control name and boolean state. Page and referring URLs exclude query strings and fragments. Automatic campaign/referrer persistence is off, and an event/property allowlist strips unexpected SDK enrichment and person properties. No raw search input or booking details are sent. IP geolocation enrichment is disabled; PostHog still receives network connections. Booking clicks represent referral intent, not completed bookings or revenue.

Run `npm run build && npm run check`. The analytics checks cover pre-consent isolation, opt-out, GPC, local exclusion, redaction, SDK configuration, invalid input and consent races. After deploying a configured project, verify an opted-in visit and a few named interactions in PostHog Activity, plus Web Analytics page views. Test a declined visit separately. Initial-load audits without consent do not measure the cost of the asynchronously loaded SDK for returning opted-in visitors.

Official documentation reviewed 16 September 2026:
- https://posthog.com/docs/libraries/js
- https://posthog.com/docs/libraries/js/config
- https://posthog.com/docs/libraries/js/privacy

City selection from the map, featured picker and city search reports a normalized destination-city identifier after consent. It never reports free-form search text. Query strings remain stripped.
