const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { bookingLink } = require('./affiliate-links.cjs');
for (const config of [{}, {stay22Aid:'test_site',getYourGuidePartnerId:'TEST123'}]) {
  const hotel = bookingLink('accommodation','Panglao, Bohol, Philippines','philippines-panglao-stay',config);
  const u = new URL(hotel.href);
  assert.equal(u.searchParams.get(config.stay22Aid?'address':'ss'),'Panglao, Bohol, Philippines');
  assert.equal(hotel.tracked,!!config.stay22Aid);
  assert.equal(u.searchParams.has('checkin'),false);
  assert.equal(u.searchParams.has('checkout'),false);
  if(config.stay22Aid){assert.equal(u.searchParams.get('aid'),'test_site');assert.equal(u.searchParams.get('campaign'),'philippines_panglao_stay');}
  const tour = new URL(bookingLink('activities','Bohol day trips','philippines_bohol_activities',config).href);
  assert.equal(tour.searchParams.get('q'),'Bohol day trips');
  assert.equal(tour.searchParams.get('partner_id'),config.getYourGuidePartnerId || null);
}
assert.throws(()=>bookingLink('accommodation','Manila','test',{stay22Aid:'REPLACE_WITH_ID'}));
const root = path.join(__dirname,'../public-dist/country');
const saved = JSON.parse(fs.readFileSync(path.join(__dirname,'../affiliate.config.json')));
const partnerId = process.env.GETYOURGUIDE_PARTNER_ID || saved.getYourGuidePartnerId;
let count = 0;
for(const item of fs.readdirSync(root,{withFileTypes:true})) {
  if(!item.isDirectory())continue;
  const html = fs.readFileSync(path.join(root,item.name,'index.html'),'utf8');
  assert.ok(!/hotellook|REPLACE_WITH|data-stay22|affiliates\.js|data-month="[^"]*"[^>]*data-hotel|data-hotel[^>]*data-month=/i.test(html), `${item.name}: stale integration`);
  assert.ok(/data-booking-type="accommodation"[^>]*href="https:|href="https:[^"]*"[^>]*data-booking-type="accommodation"/.test(html),`${item.name}: missing usable hotel link`);
  const activities = html.match(/<a\b[^>]*data-booking-type="activities"[^>]*>/g) || [];
  assert.ok(activities.length, `${item.name}: missing activity links`);
  for (const tag of activities) {
    const url = new URL(tag.match(/href="([^"]+)"/)[1].replaceAll('&amp;', '&'));
    assert.equal(url.searchParams.get('partner_id'), partnerId || null, `${item.name}: wrong affiliate account`);
    if (partnerId) {
      assert.equal(url.searchParams.get('utm_medium'), 'online_publisher');
      assert.ok(url.searchParams.get('cmp'));
      assert.match(tag, /rel="sponsored noopener"/);
    }
  }
  count++;
}
assert.equal(count,74);
const ph = fs.readFileSync(path.join(root,'philippines/index.html'),'utf8');
assert.equal((ph.match(/class="island-booking"/g)||[]).length,8);
assert.ok(ph.includes('Find a stay on your island'));
assert.ok(ph.includes('Bohol day trips'));
assert.ok(!ph.includes('Top tours in Manila'));
console.log('Passed booking attribution, fallback, dates, 74-guide and 8-island checks.');
