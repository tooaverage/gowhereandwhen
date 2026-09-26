# PostHog analytics

Configured for the separate GoWhereAndWhen organization and project 613152 (US region): https://us.posthog.com/project/613152. It does not send data to Design Recap or Get Thy Bread. Configuration lives in `analytics.config.json`: `projectToken` is the public ingestion token, and `apiHost` is the matching US/EU ingestion host. GitHub Actions variables `POSTHOG_PROJECT_TOKEN` and `POSTHOG_API_HOST` can override these. Never put a personal API key in the repository or browser code. An empty token disables integration entirely.

Analytics now runs by default without an automatic consent popup. The SDK uses `persistence: memory` and `disable_persistence: true`: random analytics IDs live only within a page load. This sacrifices reliable unique-person, returning-visitor and cross-page funnel measurement. Do not compare these counts directly with the previous consent-based persistent-ID period (before 2026-09-26). Pageviews and named interactions remain useful. This configuration is data minimization, not a legal conclusion about consent requirements.

Analytics preferences remains in the footer. Explicit refusals, including previously saved refusals, block SDK loading and events; GPC also blocks them. Refusals persist until changed. Only the preference is saved in local storage. A visitor can re-enable analytics there. Local previews are excluded. Session replay, autocapture, profiles, advertising, surveys, feature flags and performance/error capture remain disabled. The SDK is bundled locally using `module.no-external`.

Events: `$pageview`, `open_guide`, `select_month`, `search_destination`, `booking_click`, `select_island`, `map_control`, `select_city`. Month changes do not create extra pageviews. Properties include recognized destination/island slugs, numeric month, provider hostname, booking type, control name and boolean state. Page and referring URLs exclude query strings and fragments. Automatic campaign/referrer persistence is off, and an event/property allowlist strips unexpected SDK enrichment and person properties. No raw search input or booking details are sent. IP geolocation enrichment is disabled; PostHog still receives network connections. Booking clicks represent referral intent, not completed bookings or revenue.

Run `npm run build && npm run check`. Checks cover default measurement without a popup, memory-only configuration, previous refusal, opt-out, GPC, local exclusion, redaction, invalid input and loading races. Verify the production UI after deployment.

Official documentation reviewed 16 September 2026:
- https://posthog.com/docs/libraries/js
- https://posthog.com/docs/libraries/js/config
- https://posthog.com/docs/libraries/js/privacy

City selection from the map, featured picker and city search reports a normalized destination-city identifier when analytics is enabled. It never reports free-form search text. Query strings remain stripped.
