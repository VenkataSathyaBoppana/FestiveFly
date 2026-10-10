import { getSettings, activeSeasons, nextSeason, daysUntil, eveningAt, dayKey } from './shared.js';

const $ = id => document.getElementById(id);
const fmtTime = d => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

async function render() {
  const s = await getSettings();
  const now = new Date();
  const today = dayKey(now);
  const { lastMorning, lastEvening } = await chrome.storage.local.get(['lastMorning', 'lastEvening']);

  const active = activeSeasons(now, s.enabled).map(x => x.season);
  const season = active[0] || null;
  if (season) {
    $('title').textContent = active.length > 1
      ? active.map(a => `${a.emoji} ${a.name}`).join(' + ')
      : `${season.emoji} ${season.name} season is on`;
    $('detail').textContent = active.map(a => {
      const n = daysUntil(a, now);
      return n > 1 ? `${n} days to ${a.name}` : n === 1 ? `${a.name} tomorrow` : n === 0 ? `${a.name} today!` : `${a.name} celebrations`;
    }).join(' · ');
  } else {
    const upcoming = nextSeason(now, s.enabled);
    $('title').textContent = s.everyday ? 'Everyday greetings ☀️🌙' : 'Resting until the holidays';
    $('detail').textContent = upcoming
      ? `${upcoming.season.emoji} ${upcoming.season.name} characters from ${upcoming.date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`
      : '';
  }

  const quiet = !season && !s.everyday;
  $('mStatus').textContent = !s.morning || quiet ? 'Off' : lastMorning === today ? 'Done today ✓' : now.getHours() < 12 ? 'Next time you browse' : 'Tomorrow';
  $('eStatus').textContent = !s.evening || quiet ? 'Off' : lastEvening === today ? 'Done today ✓' : fmtTime(eveningAt(s, now));
}

document.querySelectorAll('.btns .btn').forEach(b => b.addEventListener('click', async () => {
  const r = await chrome.runtime.sendMessage({ type: 'showNow', kind: b.dataset.kind });
  if (r?.ok) window.close();
  else $('err').textContent = r?.error || 'Couldn’t show it here.';
}));

$('settings').addEventListener('click', e => { e.preventDefault(); chrome.runtime.openOptionsPage(); });

render();
