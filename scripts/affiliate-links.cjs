const cleanId = (value, name) => {
  const id = String(value || '').trim();
  if (id && (!/^[A-Za-z0-9_-]+$/.test(id) || /REPLACE|PLACEHOLDER/i.test(id))) throw Error(`Invalid ${name}`);
  return id;
};
function bookingLink(kind, destination, campaign, config) {
  const label = campaign.replace(/[^a-z0-9_]/gi, '_').slice(0, 100);
  let url, tracked = false;
  if (kind === 'accommodation') {
    const aid = cleanId(config.stay22Aid, 'Stay22 ID');
    url = new URL(aid ? 'https://www.stay22.com/allez/roam' : 'https://www.booking.com/searchresults.html');
    url.searchParams.set(aid ? 'address' : 'ss', destination);
    if (aid) { url.searchParams.set('aid', aid); url.searchParams.set('campaign', label); tracked = true; }
  } else if (kind === 'activities') {
    const id = cleanId(config.getYourGuidePartnerId, 'GetYourGuide ID');
    url = new URL('https://www.getyourguide.com/s/');
    url.searchParams.set('q', destination);
    if (id) { url.searchParams.set('partner_id', id); url.searchParams.set('utm_medium', 'online_publisher'); url.searchParams.set('cmp', label); tracked = true; }
  } else {
    url = new URL('https://www.aviasales.com/');
    url.searchParams.set('destination', destination);
  }
  // A climate month is not a check-in date. Never invent dates or guest counts.
  return { href: url.href, tracked, provider: tracked && kind === 'accommodation' ? 'stay22' : kind === 'accommodation' ? 'booking' : kind === 'activities' ? 'getyourguide' : 'aviasales' };
}
module.exports = { bookingLink, cleanId };
