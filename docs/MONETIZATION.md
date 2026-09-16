# Subtle monetization — 16 September 2026

## Research and decision

| Publisher | Public evidence | Lesson for GoWhereAndWhen |
| --- | --- | --- |
| Earth Trekkers | [Disclosure](https://www.earthtrekkers.com/disclosure/) identifies Booking.com, GetYourGuide and Amazon affiliate programs; [its history](https://www.earthtrekkers.com/life-as-a-travel-blogger/) describes adding Mediavine advertising as traffic grew. | Put relevant booking links within useful planning content. Display advertising can wait. |
| Never Ending Footsteps | [FAQ](https://www.neverendingfootsteps.com/faq/) lists display ads, affiliate sales and photo licensing; its 2026 summary emphasizes ads and affiliates. These are self-reported figures, not audited or representative earnings. | Accommodation advice, budget guides and itineraries create natural booking opportunities. Do not copy income expectations from an established publisher. |
| Climate-Data.org | [Stay22 case study](https://www.stay22.com/case-studies/climatedata) describes weather-planning traffic monetized with affiliate links and Nova, reporting 40% RPM growth. This is vendor marketing, and the implementation included automatically opened tabs. | Weather research can precede purchases. Use intentional clicks; the reported uplift does not predict results from our quieter implementation. |

Start with Stay22 accommodation links and direct GetYourGuide activity links. No automatic new tabs, link-insertion scripts, embedded booking requests, display ads, or invented travel dates. Booking.com destination searches are functional noncommissioned fallbacks until Stay22 is configured. GetYourGuide searches remain noncommissioned until its partner ID is configured.

## Implemented

- Build real outbound links into all 74 public country guides, so they work without JavaScript.
- Remove the legacy affiliate hydrator from public guides; it generated discontinued Hotellook links and an iframe with a placeholder account ID.
- Replace blank map space with useful pre-booking advice. The Philippines gets an island shortlist instead of a Manila-only booking block.
- Add one quiet accommodation link to each of eight Philippines island portraits; retain editorial rankings, caveats, prices and sources.
- Replace broad Manila activity links with Bohol, El Nido and Coron searches.
- Remove month-specific links that invented a three-night stay on the 14th.
- Add per-island Stay22 campaigns and GetYourGuide campaign labels, sponsored link attributes only when configured, and accurate disclosure text for each account state.
- Extend existing consent-gated GA booking events with destination, placement and island. No new analytics service is loaded. The existing GA measurement ID remains blank in source; analytics activation is a separate pending setup.

## Account connection

GetYourGuide account access confirmed in Chrome on 16 September 2026. Public partner ID `OZOTIAM` verified against the dashboard link builder, including `utm_medium=online_publisher` and campaign attribution, and saved in `affiliate.config.json`. Stay22 registration remains pending. GetYourGuide displays a mandatory two-factor authentication setup notice; the user must complete authenticator enrollment. Payout details and completed-booking attribution have not been verified.

1. Complete [Stay22 registration](https://hub.stay22.com/en/auth/signup) and [GetYourGuide registration](https://partner.getyourguide.com/en-us/signup), including user-managed password creation, terms and email verification. Do not store credentials in the repository.
2. Retrieve the public affiliate IDs from the approved dashboards. Verify ownership and the generated link against the account's link builder.
3. Set `STAY22_AID` and `GETYOURGUIDE_PARTNER_ID` as GitHub Actions repository variables, or put the public identifiers in `affiliate.config.json`. Environment values take precedence. Blank IDs keep working direct links; placeholders fail the build.
4. Rebuild, check, deploy, then verify clicks in each partner dashboard. Completed bookings and commission payments are not validated by our local tests.

No application approval, payout setup, affiliate attribution or revenue is claimed until verified. Public identifiers are intentionally visible in outbound URLs. Banking and tax details belong in the provider dashboard only.

## Primary integration sources

- [Hotellook closure](https://support.travelpayouts.com/hc/en-us/articles/29534131568530-FAQ-on-the-closure-of-Hotellook): closed 20 October 2025.
- [Stay22 Allez](https://dev.stay22.com/docs/allez) and [parameters](https://dev.stay22.com/docs/allez/parameters): AID, location and campaign; travel dates are optional.
- [GetYourGuide manual links](https://partner.getyourguide.support/hc/en-us/articles/13830964721693-Trouble-with-unique-link-not-found-error): append the account's `partner_id`.
- [GetYourGuide deep links](https://partner.getyourguide.support/hc/en-us/articles/13981115676061-Deep-links-101): content placement, tracking and campaign reports.

## Measurement and next priorities

Track guide visits → intentional booking clicks → attributable completed bookings → paid commission. Separate island links, the bottom shortlist and activity links. Evaluate cancellation-adjusted earnings per outbound click and per 1,000 guide visits once there is a meaningful sample; a few initial clicks cannot establish a winner.

Prioritize richer destination/area guidance and useful internal links for traffic growth. Add specific accommodation recommendations only with verified locations, current details and clear sourcing. Do not call a property's Wi-Fi reliable based only on an amenity checkbox. Consider other affiliate partners only where the existing inventory misses a reader need.

Run `npm run build && npm run check`. The checks cover 89 canonical pages, weather/map preservation, analytics consent, booking URL encoding and attribution, blank-ID fallback behavior, no fabricated dates, removal of obsolete public integrations, and all eight island cards. Archived design editions retain their legacy scripts and are excluded from search indexing.
