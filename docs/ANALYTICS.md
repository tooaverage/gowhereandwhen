# Analytics setup

The integration is ready but inactive until the owner's real GA4 measurement ID is supplied. No placeholder tracking ID is published. Set the GitHub Actions repository variable `GA_MEASUREMENT_ID`, or the public `measurementId` in `analytics.config.json`, then deploy. The ID is public, not an API credential.

In the owner's Google Analytics account, create or choose the GoWhereAndWhen property and its web stream for `https://gowhereandwhen.com`. Disable Enhanced Measurement for this stream: the integration sends explicit canonical page views and events, while map month changes use `history.replaceState` and must not create extra page views. Keep Google Signals and advertising links off. Confirm the preferred account reporting timezone, currency and retention settings in that account.

After activation, verify an opted-in real production visit in Realtime and verify refusal sends no Google requests. Never send a test event from localhost to the production property. Local previews are excluded even if a real ID is configured. The initial default is no tracking until the visitor opts in. Advertising storage, user data and personalization remain denied. Visitors can withdraw through Analytics preferences in the footer; Global Privacy Control is respected.

Events: `page_view`, `open_guide`, `select_month`, `search_destination`, `booking_click`, `select_island`, and `map_control`. Custom events use recognized destination slugs, numeric months, provider hostnames and predefined control values. They do not send typed search text, hotel booking parameters or URL queries/fragments. Add event-scoped dimensions for `destination`, `month`, `provider`, `booking_type`, `island` and `control` when configuring the property. Booking clicks can be marked as a key event; they are referral intent, not completed bookings or revenue.

The small first-party consent controller is deferred and the Google script loads asynchronously only after consent. Test both first-time and returning opted-in performance after activation; an audit without consent does not measure the cost of the loaded Google library.

Google documentation checked 8 September 2026:
- https://support.google.com/analytics/answer/14183469
- https://developers.google.com/tag-platform/security/concepts/consent-mode
- https://developers.google.com/analytics/devguides/collection/ga4/reference/config
