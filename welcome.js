import { getSettings, saveSettings, SEASONS, buildMessage } from './shared.js';

const $ = id => document.getElementById(id);
const ALL_SITES = { origins: ['<all_urls>'] };

async function refreshAccess() {
  const ok = await chrome.permissions.contains(ALL_SITES);
  $('access').classList.toggle('ok', ok);
  $('accessText').textContent = ok
    ? 'Site access granted — flybys will appear on the page you’re viewing.'
    : 'Without site access, you’ll get a system notification instead of the animation. Chrome will warn that this can “read and change data on websites” — the extension only draws the flyby and never reads pages.';
  $('grant').hidden = ok;
}

$('grant').addEventListener('click', async () => {
  await chrome.permissions.request(ALL_SITES).catch(() => false);
  refreshAccess();
});

// One toggle row + one preview choice per season.
for (const season of SEASONS) {
  const row = document.createElement('div');
  row.className = 'row';
  row.innerHTML = `<div><b></b><small></small></div><input type="checkbox" class="switch">`;
  row.querySelector('b').textContent = `${season.emoji} ${season.name}`;
  row.querySelector('small').textContent = season.blurb;
  const box = row.querySelector('input');
  box.id = `season-${season.id}`;
  box.setAttribute('aria-label', season.name);
  box.addEventListener('change', persist);
  $('seasonRows').append(row);

  const opt = document.createElement('label');
  opt.innerHTML = `<input type="radio" name="pseason"><span></span>`;
  opt.querySelector('input').value = season.id;
  opt.querySelector('span').textContent = `${season.emoji} ${season.name}`;
  $('pseasons').append(opt);
}

async function load() {
  const s = await getSettings();
  $('morning').checked = s.morning;
  $('evening').checked = s.evening;
  $('eveningTime').value = s.eveningTime;
  $('everyday').checked = s.everyday;
  for (const season of SEASONS) $(`season-${season.id}`).checked = s.enabled[season.id] !== false;
  $('duration').value = s.durationSec;
  $('durLabel').textContent = `${s.durationSec} seconds across the screen`;
}

let t;
async function persist() {
  const s = await saveSettings({
    morning: $('morning').checked,
    evening: $('evening').checked,
    eveningTime: $('eveningTime').value,
    everyday: $('everyday').checked,
    durationSec: Number($('duration').value),
    enabled: Object.fromEntries(SEASONS.map(season => [season.id, $(`season-${season.id}`).checked]))
  });
  $('eveningTime').value = s.eveningTime;
  $('durLabel').textContent = `${s.durationSec} seconds across the screen`;
  $('saved').classList.add('on');
  clearTimeout(t);
  t = setTimeout(() => $('saved').classList.remove('on'), 1200);
}

['morning', 'evening', 'eveningTime', 'everyday', 'duration']
  .forEach(id => $(id).addEventListener('change', persist));
$('duration').addEventListener('input', () => ($('durLabel').textContent = `${$('duration').value} seconds across the screen`));

// Previews run flyby.js right here on this page.
document.querySelectorAll('.previews .btn').forEach(btn => btn.addEventListener('click', () => {
  document.getElementById('festive-flyby-host')?.remove();
  const seasonId = document.querySelector('input[name=pseason]:checked').value;
  const season = SEASONS.find(s => s.id === seasonId) || null;
  const msg = buildMessage(btn.dataset.kind, season);
  window.__festiveFlybyCfg = { ...msg, duration: Number($('duration').value), theme: document.querySelector('input[name=ptheme]:checked').value };
  const s = document.createElement('script');
  s.src = `flyby.js?${Date.now()}`;
  s.onload = () => s.remove();
  document.body.append(s);
}));

load();
refreshAccess();
