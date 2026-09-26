import posthog from 'posthog-js/dist/module.no-external';

// Explicit allowlist prevents SDK-added URLs, campaign values, person properties,
// or future autocaptured data from bypassing the site's privacy rules.
const events = new Set(['$pageview','open_guide','select_month','search_destination','booking_click','select_island','map_control','select_city']);
const properties = new Set(['token','distinct_id','$device_id','$session_id','$window_id','$lib','$lib_version','$browser','$browser_version','$os','$os_version','$device_type','$screen_height','$screen_width','$viewport_height','$viewport_width','$timezone','$timezone_offset','$current_url','$pathname','$referrer','$referring_domain','$title','destination','month','provider','placement','booking_type','island','control','enabled','city']);
export function sanitizeEvent(event, allowed) {
  if (!allowed() || !event || !events.has(event.event)) return null;
  const clean = {};
  for (const [key,value] of Object.entries(event.properties || {})) {
    if (properties.has(key) && ['string','number','boolean'].includes(typeof value)) clean[key] = value;
  }
  for (const key of ['$current_url','$referrer']) {
    if (!clean[key]) continue;
    try { const u = new URL(clean[key]); clean[key] = u.origin + u.pathname.replace(/\/index\.html$/, '/'); } catch { delete clean[key]; }
  }
  // The site uses anonymous event analysis, without person profiles or IP geolocation.
  clean.$process_person_profile = false;
  clean.$geoip_disable = true;
  return {...event, properties:clean};
}
export function startClient(token, host, allowed) {
  posthog.init(token, {
    api_host:host,
    persistence:'localStorage',
    person_profiles:'never',
    autocapture:false, capture_pageview:false, capture_pageleave:false,
    capture_dead_clicks:false, rageclick:false, capture_heatmaps:false,
    capture_performance:false, capture_exceptions:false,
    disable_session_recording:true, disable_surveys:true,
    disable_conversations:true, disable_product_tours:true,
    disable_external_dependency_loading:true,
    advanced_disable_flags:true, opt_in_site_apps:false,
    save_campaign_params:false, save_referrer:false,
    opt_out_capturing_by_default:true, opt_out_persistence_by_default:true,
    request_batching:false, ip:false, debug:false,
    before_send:event => sanitizeEvent(event, allowed),
  });
  return posthog;
}
