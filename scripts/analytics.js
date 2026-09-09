// Basic consent mode: do not load Google or send any analytics before opt-in.
const id = document.querySelector('meta[name="gww-analytics"]')?.content;
if (/^G-[A-Z0-9]+$/.test(id || '') && ['gowhereandwhen.com', 'www.gowhereandwhen.com'].includes(location.hostname)) {
  const key = 'gww-analytics-choice-v1';
  let choice = null, started = false;
  try { const saved = JSON.parse(localStorage.getItem(key)); if (saved && ['yes','no'].includes(saved.value) && Date.now() < saved.expires) choice = saved.value; } catch {}
  if (navigator.globalPrivacyControl) choice = 'no';
  const cleanURL = value => { if (!value) return ''; try { const u = new URL(value, location.href); return u.origin + u.pathname.replace(/\/index\.html$/, '/'); } catch { return ''; } };
  const denied = {analytics_storage:'denied', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'};
  function gtag() { window.dataLayer.push(arguments); }
  function track(name, parameters = {}) {
    if (choice !== 'yes' || !started || navigator.globalPrivacyControl) return;
    gtag('event', name, {...parameters, page_location:cleanURL(location.href), page_referrer:cleanURL(document.referrer)});
  }
  function start() {
    if (started || choice !== 'yes' || navigator.globalPrivacyControl) return;
    started = true; window['ga-disable-' + id] = false;
    window.dataLayer = window.dataLayer || [];
    gtag('consent', 'default', denied);
    gtag('consent', 'update', {...denied, analytics_storage:'granted'});
    gtag('js', new Date());
    gtag('config', id, {send_page_view:false, allow_google_signals:false, allow_ad_personalization_signals:false, cookie_expires:15552000, page_location:cleanURL(location.href), page_referrer:cleanURL(document.referrer)});
    track('page_view', {page_title:document.title});
    const script = document.createElement('script'); script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.append(script);
  }
  const panel = document.createElement('section');
  panel.className = 'analytics-choice'; panel.setAttribute('aria-label', 'Optional analytics');
  panel.innerHTML = '<p><strong>Help improve these travel guides?</strong> Allow Google Analytics cookies to measure visits and use of the site. Advertising features are off.</p><p><a href="/methodology/#privacy">Privacy details</a></p><div><button type="button" data-choice="no">No thanks</button><button type="button" data-choice="yes">Allow analytics</button></div>';
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
    else {
      window['ga-disable-' + id] = true;
      if (started) gtag('consent', 'update', denied);
      for (const cookie of document.cookie.split(';')) {
        const name = cookie.split('=')[0].trim(); if (!/^_ga(?:_|$)/.test(name)) continue;
        for (const domain of ['', ';domain=' + location.hostname, ';domain=.gowhereandwhen.com']) document.cookie = name + '=;Max-Age=0;path=/' + domain;
      }
    }
    preferences.focus();
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
      else if (['hotellook.com','getyourguide.com','aviasales.com','booking.com'].some(host => url.hostname === host || url.hostname.endsWith('.' + host))) track('booking_click', {provider:url.hostname, booking_type:url.hostname.endsWith('aviasales.com')?'flights':url.hostname.endsWith('getyourguide.com')?'activities':'accommodation'});
    }
    const island = e.target.closest('[data-island]')?.dataset.island;
    if (/^[a-z-]+$/.test(island || '')) track('select_island', {island});
  });
  document.addEventListener('change', e => {
    if (['map-motion','map-orbit','map-regional'].includes(e.target.id)) track('map_control', {control:e.target.id, enabled:!!e.target.checked});
  });
  start();
}
