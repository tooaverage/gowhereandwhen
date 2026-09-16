const fs = require('node:fs'), path = require('node:path');
const { bookingLink, cleanId } = require('./affiliate-links.cjs');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const attr = (tag, name) => decode(tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] || '');
const disclosure = active => active
  ? 'We may earn a commission when you book through these links, at no extra cost to you. Recommendations and weather ratings are independent of commission.'
  : 'Booking links open external travel sites. Choose your dates there and check the total price and cancellation terms.';
module.exports = function monetizePublic(root, out) {
  const saved = JSON.parse(fs.readFileSync(path.join(root, 'affiliate.config.json')));
  const config = {
    stay22Aid: cleanId(process.env.STAY22_AID || saved.stay22Aid, 'Stay22 ID'),
    getYourGuidePartnerId: cleanId(process.env.GETYOURGUIDE_PARTNER_ID || saved.getYourGuidePartnerId, 'GetYourGuide ID')
  };
  const active = !!(config.stay22Aid || config.getYourGuidePartnerId);
  const guides = JSON.parse(fs.readFileSync(path.join(root, 'storybook/data.json')));
  const islands = JSON.parse(fs.readFileSync(path.join(root, 'storybook-lab/philippines-islands.json')));
  function anchor(kind, destination, label, campaign, placement, island = '') {
    const result = bookingLink(kind, destination, campaign, config);
    return `<a href="${esc(result.href)}" class="booking-link" data-booking-type="${kind}" data-booking-provider="${result.provider}" data-booking-placement="${placement}" data-booking-island="${island}" rel="${result.tracked ? 'sponsored ' : ''}noopener" target="_blank">${esc(label)} ↗</a>`;
  }
  for (const guide of guides) {
    const file = path.join(out, 'country', guide.slug || '', 'index.html');
    if (!guide.slug || !fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    // The old hydrator reintroduces Hotellook and the unconfigured iframe.
    html = html.replace(/<script\b[^>]*src="[^"]*affiliates\.js[^\"]*"[^>]*><\/script>/g, '');
    html = html.replace(/<a\b[^>]*\bdata-month="[^"]*"[^>]*\bdata-hotel[^>]*>[\s\S]*?<\/a>|<a\b[^>]*\bdata-hotel[^>]*\bdata-month="[^"]*"[^>]*>[\s\S]*?<\/a>/g, '');
    html = html.replace(/<a\b[^>]*\bdata-(?:hotel|tours|flights)(?:="[^"]*")?[^>]*>[\s\S]*?<\/a>/g, tag => {
      const kind = /\bdata-hotel\b/.test(tag) ? 'accommodation' : /\bdata-tours\b/.test(tag) ? 'activities' : 'flights';
      const destination = kind === 'accommodation' ? `${attr(tag, 'data-city') || guide.city}, ${guide.name}` : kind === 'activities' ? (attr(tag, 'data-q') || `${guide.city}, ${guide.name}`) : attr(tag, 'data-iata');
      const result = bookingLink(kind, destination, `${guide.slug}_${kind}_guide`, config);
      return tag.replace(/\bhref="[^"]*"/, `href="${esc(result.href)}"`).replace(/\s(?:target|rel)="[^"]*"/g, '').replace('<a ', `<a data-booking-type="${kind}" data-booking-provider="${result.provider}" data-booking-placement="guide" target="_blank" rel="${result.tracked ? 'sponsored ' : ''}noopener" `);
    });
    html = html.replace(/<div\b[^>]*\bdata-stay22[^>]*>\s*<\/div>/g,
      '<div class="booking-checklist"><h3>Before you choose a stay</h3><ul><li>Check the exact location and transport connections.</li><li>Compare the full price, including taxes and fees.</li><li>Read cancellation terms before you book.</li></ul><p>Your travel month helps with planning. Enter your own dates on the booking site.</p></div>');
    html = html.replace(/Compare hotels and rentals around ([^<]+), then book the month you want\./g, 'Compare places to stay around $1. Choose your dates on the booking site.');
    html = html.replaceAll('Some links on this page are affiliate links, at no cost to you.', active ? 'Some booking links earn us a commission, at no extra cost to you.' : 'Booking links open external travel sites.');
    html = html.replaceAll('Some links are affiliate links.', active ? 'Some booking links earn us a commission, at no extra cost to you.' : 'Booking links open external travel sites.');
    html = html.replace(/(<section class="guide-section stay-section" id="stay">[\s\S]*?<p class="lead">[\s\S]*?<\/p>)/, `$1<p class="booking-disclosure">${disclosure(active)}</p>`);
    if (guide.slug === 'philippines') {
      for (const island of islands) {
        const destination = `${island.name.replace('Bohol / Panglao', 'Panglao, Bohol')}, Philippines`;
        const label = `Explore ${island.name} stays`;
        const card = `<aside class="island-booking" aria-label="Places to stay in ${esc(island.name)}"><h4>Find a stay that fits your plans</h4><p>Use the area advice above, then check the exact location, beach access and room setup.</p>${anchor('accommodation', destination, label, `philippines_${island.id}_stay`, 'island', island.id)}<p class="booking-disclosure">${disclosure(!!config.stay22Aid)}</p></aside>`;
        const start = html.indexOf(`id="island-${island.id}"`), end = html.indexOf('</article>', start);
        if (start < 0 || end < 0) throw Error(`Missing island portrait: ${island.id}`);
        const insertion = html.indexOf('<div class="island-season"', start);
        if (insertion < 0 || insertion > end) throw Error(`Missing island season: ${island.id}`);
        html = html.slice(0, insertion) + card + html.slice(insertion);
      }
      const shortlist = islands.sort((a,b) => a.rank-b.rank).map(island => anchor('accommodation', `${island.name.replace('Bohol / Panglao','Panglao, Bohol')}, Philippines`, island.name, `philippines_${island.id}_shortlist`, 'shortlist', island.id)).join('');
      html = html.replace(/<section class="guide-section stay-section" id="stay">[\s\S]*?<\/section>/,
        `<section class="guide-section stay-section" id="stay"><div class="wrap"><h2>Find a stay on your island</h2><p class="lead">Start with the base that suits you. Enter your own dates and compare the exact location before booking.</p><div class="booking-islands">${shortlist}</div><p class="booking-disclosure">${disclosure(!!config.stay22Aid)}</p><p class="booking-secondary">Stopping in the capital? ${anchor('accommodation', 'Manila, Philippines', 'Compare Manila stays', 'philippines_manila_stopover', 'stopover')}</p></div></section>`);
      html = html.replace(/<div class="toursrow">\s*<a[^>]*data-booking-type="activities"[\s\S]*?<\/div>/,
        `<div class="booking-activities"><h3>Explore with a local guide</h3><p>Compare routes, pickup points and cancellation terms for the outings that fit your trip.</p><div class="booking-islands">${anchor('activities','Bohol day trips','Bohol day trips','philippines_bohol_activities','activities')}${anchor('activities','El Nido island hopping','El Nido boat trips','philippines_el_nido_activities','activities')}${anchor('activities','Coron island hopping','Coron boat trips','philippines_coron_activities','activities')}</div><p class="booking-disclosure">${disclosure(!!config.getYourGuidePartnerId)}</p></div>`);
    }
    html = html.replace('</head>', `<style>${fs.readFileSync(path.join(root,'scripts/booking.css'),'utf8')}</style></head>`);
    fs.writeFileSync(file, html);
  }
  console.log(`Booking links built: Stay22 ${config.stay22Aid ? 'configured' : 'pending (direct hotel links)'}, GetYourGuide ${config.getYourGuidePartnerId ? 'configured' : 'pending (direct activity links)'}. No booking widgets or automatic tabs.`);
};
