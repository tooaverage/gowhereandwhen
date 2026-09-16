// The consent controller is independent of the SDK and sends nothing before opt-in.
const id = document.querySelector('meta[name="gww-analytics"]')?.content;
const host = document.querySelector('meta[name="gww-analytics-host"]')?.content;
if (/^phc_[a-zA-Z0-9]+$/.test(id || '') && ['https://us.i.posthog.com','https://eu.i.posthog.com'].includes(host) && ['gowhereandwhen.com', 'www.gowhereandwhen.com'].includes(location.hostname)) {
  const key = 'gww-analytics-choice-v2-posthog';
  let choice = null, started = false;
  try { const saved = JSON.parse(localStorage.getItem(key)); if (saved && ['yes','no'].includes(saved.value) && Date.now() < saved.expires) choice = saved.value; } catch {}
  if (navigator.globalPrivacyControl) choice = 'no';
  const cleanURL = value => { if (!value) return ''; try { const u = new URL(value, location.href); return u.origin + u.pathname.replace(/\/index\.html$/, '/'); } catch { return ''; } };
  const allowed = () => choice === 'yes' && !navigator.globalPrivacyControl;
  let client, loading, generation = 0;
  function track(name, parameters = {}) {
    if (!allowed() || !client) return;
    client.capture(name, {...parameters, $current_url:cleanURL(location.href), $pathname:new URL(cleanURL(location.href)).pathname, $referrer:cleanURL(document.referrer), $referring_domain:document.referrer ? new URL(document.referrer).hostname : '$direct', $title:document.title});
  }
  async function start() {
    if (started || !allowed()) return;
    started = true;
    const run = ++generation;
    try {
      // Separate chunk: no SDK download, storage, or requests before consent.
      loading ||= import('./posthog-client.js');
      const {startClient} = await loading;
      if (run !== generation || !allowed()) return;
      client ||= startClient(id, host, allowed);
      client.opt_in_capturing({captureEventName:false});
      track('$pageview');
    } catch { started = false; loading = null; }
  }
  function stop() {
    started = false; generation++;
    client?.opt_out_capturing();
  }
  const panel = document.createElement('section');
  panel.className = 'analytics-choice'; panel.setAttribute('aria-label', 'Optional analytics');
  panel.innerHTML = '<p><strong>Help improve these travel guides?</strong> Allow PostHog analytics to measure visits and use of the site. It saves a random visitor ID in your browser. Session recording is off.</p><p><a href="/methodology/#privacy">Privacy details</a></p><div><button type="button" data-choice="no">No thanks</button><button type="button" data-choice="yes">Allow analytics</button></div>';
  document.body.append(panel);
  const preferences = document.createElement('button'); preferences.type = 'button'; preferences.className = 'analytics-preferences'; preferences.textContent = 'Analytics preferences';
  (document.querySelector('footer') || document.body).append(preferences);
  preferences.onclick = () => { panel.hidden = false; panel.querySelector('button').focus(); };
  panel.hidden = choice !== null;
  panel.addEventListener('click', e => {
    const selected = e.target.closest('[data-choice]')?.dataset.choice; if (!selected) return;
    choice = selected === 'yes' && !navigator.globalPrivacyControl ? 'yes' : 'no';
    try { localStorage.setItem(key, JSON.stringify({value:choice, expires:Date.now() + 15552000000})); } catch {}
    panel.hidden = true;
    if (choice === 'yes') start();
    else stop();
    preferences.focus();
  });
  window.addEventListener('storage', e => {
    if (e.key !== key) return;
    try { const saved = JSON.parse(e.newValue); choice = saved?.value === 'yes' && saved.expires > Date.now() ? 'yes' : 'no'; } catch { choice = 'no'; }
    if (allowed()) start(); else stop();
  });
  document.addEventListener('gww:month', e => {
    const {month, country} = e.detail || {};
    if (Number.isInteger(month) && month >= 0 && month < 12) track('select_month', {month:month + 1, destination:/^[a-z-]+$/.test(country || '') ? country : 'world'});
  });
  document.addEventListener('gww:search', e => {
    const country = e.detail?.country;
    if (/^[a-z-]+$/.test(country || '')) track('search_destination', {destination:country});
  });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (a) {
      const url = new URL(a.href), guide = url.pathname.match(/^\/country\/([a-z-]+)\/$/);
      if (url.origin === location.origin && guide) track('open_guide', {destination:guide[1]});
      else if (['stay22.com','getyourguide.com','aviasales.com','booking.com'].some(host => url.hostname === host || url.hostname.endsWith('.' + host))) {
        const safe = value => /^[a-z0-9_\/-]{1,80}$/.test(value || '') ? value : '';
        track('booking_click', {provider:safe(a.dataset.bookingProvider) || url.hostname, booking_type:safe(a.dataset.bookingType) || (url.hostname.endsWith('aviasales.com')?'flights':url.hostname.endsWith('getyourguide.com')?'activities':'accommodation'), destination:safe(location.pathname.split('/')[2]), placement:safe(a.dataset.bookingPlacement), island:safe(a.dataset.bookingIsland)});
      }
    }
    const island = e.target.closest('[data-island]')?.dataset.island;
    if (/^[a-z-]+$/.test(island || '')) track('select_island', {island});
  });
  document.addEventListener('change', e => {
    if (['map-motion','map-orbit','map-regional'].includes(e.target.id)) track('map_control', {control:e.target.id, enabled:!!e.target.checked});
  });
  start();
}
