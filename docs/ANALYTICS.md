# PostHog analytics

Configured for the separate GoWhereAndWhen organization and project 613152 (US region): https://us.posthog.com/project/613152. It does not send data to Design Recap or Get Thy Bread. Configuration lives in `analytics.config.json`: `projectToken` is the public ingestion token, and `apiHost` is the matching US/EU ingestion host. GitHub Actions variables `POSTHOG_PROJECT_TOKEN` and `POSTHOG_API_HOST` can override these. Never put a personal API key in the repository or browser code. An empty token disables integration entirely.

Analytics runs by default without a consent popup. Since 2026-10-27 each browser keeps one anonymous visitor ID so unique visitors, returning visitors and retention can be measured:

- `scripts/analytics.js` stores `gww-visitor` in localStorage: a random UUID plus a fixed expiry 12 months after creation. Later visits never extend it; after expiry a new ID is minted. The ID is passed to PostHog as `bootstrap.distinctID`.
- PostHog uses `persistence: 'sessionStorage'`, so a visit across several pages is one session and its state clears when the tab closes. PostHog also writes its own on/off flag (`__ph_opt_in_out_<token>`) to localStorage. No analytics cookies.
- `person_profiles: 'never'`, `$process_person_profile: false` and `$geoip_disable` stay on. The ID is never linked to a name, email or account.
- Opting out, a saved refusal, Global Privacy Control and `?internal=1` all block the SDK and delete `gww-visitor`. Re-enabling starts a new ID.
- The fixed 12-month expiry follows the shape of France's CNIL audience-measurement exemption (first-party, stats only, at most 13 months, not renewed). This is a design choice, not a legal conclusion about consent requirements.

Counts before 2026-10-27 (memory-only IDs, one "person" per page load) and before 2026-09-26 (consent-based persistent IDs) are not comparable with counts after.

Internal visits: open any page with `?internal=1` to set `localStorage.jd_internal = '1'`, which stops all tracking in that browser. `?internal=0` clears it. Do this once per browser and device you use.

Analytics preferences remains in the footer. Explicit refusals persist until changed. A visitor can re-enable analytics there. Local previews are excluded. Session replay, autocapture, profiles, advertising, surveys, feature flags and performance/error capture remain disabled. The SDK is bundled locally using `module.no-external`.

Events: `$pageview`, `open_guide`, `select_month`, `search_destination`, `booking_click`, `select_island`, `map_control`, `select_city`. Month changes do not create extra pageviews. Properties include recognized destination/island slugs, numeric month, provider hostname, booking type, control name and boolean state. Page and referring URLs exclude query strings and fragments. Automatic campaign/referrer persistence is off, and an event/property allowlist strips unexpected SDK enrichment and person properties. No raw search input or booking details are sent. IP geolocation enrichment is disabled; PostHog still receives network connections. Booking clicks represent referral intent, not completed bookings or revenue.

Run `npm run build && npm run check`. Checks cover default measurement without a popup, a stable visitor ID across page loads, its fixed expiry, ID deletion on opt-out and GPC, the internal flag, previous refusal, local exclusion, redaction, invalid input and loading races. Verify the production UI after deployment.

Official documentation reviewed 16 September 2026:
- https://posthog.com/docs/libraries/js
- https://posthog.com/docs/libraries/js/config
- https://posthog.com/docs/libraries/js/privacy

City selection from the map, featured picker and city search reports a normalized destination-city identifier when analytics is enabled. It never reports free-form search text. Query strings remain stripped.
