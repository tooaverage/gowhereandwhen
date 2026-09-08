const section = document.querySelector('#island-life');
if (section) {
  const tabs = [...section.querySelectorAll('[data-island]')];
  const panels = [...section.querySelectorAll('.island-portrait')];
  const selectors = [...section.querySelectorAll('.island-month')];
  const params = new URL(location.href).searchParams;
  let month = params.has('m') ? Number(params.get('m')) : new Date().getMonth();
  if (!Number.isInteger(month) || month < 0 || month > 11) month = new Date().getMonth();

  function seasonalNote(region, m) {
    if (region === 'siargao') {
      if ([10, 11, 0, 1].includes(m)) return ['Wetter eastern-coast months', 'Build in indoor days. Siargao does not share Manila’s winter dry-season pattern.'];
      if ([7, 8, 9].includes(m)) return ['Surf window, not a calm-sea promise', 'Swell and storm disruption can matter more than rainfall for swimming or boat plans.'];
      return ['Outside the wettest stretch', 'Rain remains possible. Pick swimming spots around tides, reefs and the day’s conditions.'];
    }
    if (region === 'camiguin') return ['Green and tropical, with rain possible', 'Allow a flexible day for hikes and boat trips. Mountain visibility and sea conditions need local checks.'];
    if ([0, 1, 2, 3].includes(m)) return ['A generally drier travel window', 'A useful starting point for beach plans. Wind, tides and local advisories still decide the day.'];
    if ([4, 10, 11].includes(m)) return ['A seasonal transition', 'Expect variable days and keep boat outings flexible. November is not uniformly dry across the islands.'];
    return ['More weather flexibility needed', 'Rain and storm disruption can affect ferries and tours. Leave space between island transfers and flights.'];
  }
  function updateMonth(value) {
    if (!Number.isInteger(value) || value < 0 || value > 11) return;
    month = value;
    selectors.forEach(select => { select.value = String(month); });
    panels.forEach(panel => {
      const [title, body] = seasonalNote(panel.dataset.season, month);
      const note = panel.querySelector('.island-season-note');
      const strong = document.createElement('strong');
      strong.textContent = title;
      note.replaceChildren(strong, document.createTextNode(body));
    });
    section.querySelectorAll('.island-season').forEach(el => { el.hidden = false; });
  }
  function choose(id, save = true) {
    const chosen = tabs.find(tab => tab.dataset.island === id) || tabs[0];
    tabs.forEach(tab => {
      const active = tab === chosen;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => { panel.hidden = panel.id !== chosen.getAttribute('aria-controls'); });
    if (save) {
      const url = new URL(location.href);
      url.searchParams.set('island', chosen.dataset.island);
      history.replaceState(null, '', url);
    }
  }
  section.querySelector('.island-tabs').setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    tab.addEventListener('click', () => choose(tab.dataset.island));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      choose(tabs[next].dataset.island);
      tabs[next].focus();
    });
  });
  selectors.forEach(select => select.addEventListener('change', () => {
    updateMonth(Number(select.value));
    const url = new URL(location.href);
    url.searchParams.set('m', month);
    history.replaceState(null, '', url);
    document.dispatchEvent(new CustomEvent('island-month-change', { detail: month }));
  }));
  document.addEventListener('guide-month-change', event => updateMonth(event.detail));
  window.addEventListener('popstate', () => {
    const url = new URL(location.href);
    choose(url.searchParams.get('island'), false);
    updateMonth(Number(url.searchParams.get('m')));
  });
  updateMonth(month);
  choose(params.get('island'), false);
  section.classList.add('enhanced');
}
