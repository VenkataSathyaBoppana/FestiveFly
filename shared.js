// Seasons, settings and message building — shared by background, popup and welcome page.

// Holiday seasons: during these dates the morning/evening flyby uses the holiday character + countdown.
// Fixed seasons use month/day. Lunar ones (Indian festivals) read their dates from LUNAR below, per year.
export const SEASONS = [
  { id: 'holi',      name: 'Holi',                emoji: '🎨', lunar: true, blurb: 'The week before Holi · colour splash + countdown' },
  { id: 'rakhi',     name: 'Raksha Bandhan',      emoji: '🧵', lunar: true, blurb: '5 days before Raksha Bandhan · rakhi + countdown' },
  { id: 'ganesh',    name: 'Ganesh Chaturthi',    emoji: '🌼', lunar: true, blurb: '5 days before, through Anant Chaturdashi · modaks + marigolds' },
  { id: 'halloween', name: 'Halloween',           emoji: '🎃', start: [10, 1],  end: [10, 31], day: [10, 31], blurb: 'October 1 – 31 · witch + countdown' },
  { id: 'navratri',  name: 'Navratri & Dussehra', emoji: '🏹', lunar: true, blurb: 'Navratri through Dussehra · flaming arrow + dandiya' },
  { id: 'diwali',    name: 'Diwali',              emoji: '🪔', lunar: true, blurb: 'Day after Dussehra through Bhai Dooj · diya, rangoli + crackers' },
  { id: 'christmas', name: 'Christmas',           emoji: '🎅', start: [12, 1],  end: [12, 26], day: [12, 25], blurb: 'December 1 – 26 · Santa + countdown' }
];

// Lunar-calendar festival dates (India), 'MM-DD'. Add each new year's row before its first season starts.
// Diwali side days default to Dhanteras −2, Choti Diwali −1, Govardhan +1, Bhai Dooj +2; null = no separate day that year.
// Ganesh season runs to Anant Chaturdashi, 10 days after Chaturthi.
export const LUNAR = {
  2026: { navratri: '10-11', dussehra: '10-20',
          dhanteras: '11-06', choti: null, diwali: '11-08', govardhan: '11-10', bhaiDooj: '11-11' },
  2027: { holi: '03-22', rakhi: '08-17', ganesh: '09-04', navratri: '09-30', dussehra: '10-09',
          dhanteras: '10-27', choti: '10-28', diwali: '10-29', govardhan: '10-30', bhaiDooj: '10-31' },
  2028: { holi: '03-11', rakhi: '08-05', ganesh: '08-23', navratri: '09-19', dussehra: '09-27',
          dhanteras: '10-15', choti: '10-16', diwali: '10-17', govardhan: '10-18', bhaiDooj: '10-19' },
  2029: { holi: '03-01', rakhi: '08-23', ganesh: '09-11', navratri: '10-08', dussehra: '10-16',
          dhanteras: '11-04', choti: null, diwali: '11-05', govardhan: '11-06', bhaiDooj: '11-07' }
};

export const MORNING_WINDOW = { from: 4, to: 12 };   // "morning" = first Chrome use between 4:00 and 11:59

export const DEFAULT_SETTINGS = {
  morning: true,              // greeting on first Chrome use of the morning
  evening: true,              // end-of-day sign-off
  eveningTime: '18:00',       // HH:MM, local time
  everyday: true,             // also fly outside holiday seasons (sun / moon)
  durationSec: 10,
  enabled: Object.fromEntries(SEASONS.map(s => [s.id, true]))
};

export const EVENING_ALARM = 'festive-evening';

export async function getSettings() {
  const { settings } = await chrome.storage.local.get('settings');
  const s = { ...DEFAULT_SETTINGS, ...(settings || {}) };
  s.enabled = { ...DEFAULT_SETTINGS.enabled, ...(settings?.enabled || {}) };
  return s;
}

export async function saveSettings(patch) {
  const cur = await getSettings();
  const next = { ...cur, ...patch, enabled: { ...cur.enabled, ...(patch.enabled || {}) } };
  next.durationSec = Math.min(Math.max(Number(next.durationSec) || 10, 6), 20);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(next.eveningTime)) next.eveningTime = DEFAULT_SETTINGS.eveningTime;
  await chrome.storage.local.set({ settings: next });
  return next;
}

// ---------- dates ----------

export const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const sameDay = (a, b) => !!a && !!b && a.getTime() === b.getTime();
const daysBetween = (from, to) => Math.round((startOfDay(to) - startOfDay(from)) / 86400000);

export function eveningAt(settings, date = new Date()) {
  const [h, m] = settings.eveningTime.split(':').map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m);
}

export function isMorning(date = new Date()) {
  const h = date.getHours();
  return h >= MORNING_WINDOW.from && h < MORNING_WINDOW.to;
}

function lunarDate(year, key) {
  const v = LUNAR[year]?.[key];
  if (!v) return null;
  const [m, d] = v.split('-').map(Number);
  return new Date(year, m - 1, d);
}

// A season's dates in a given year: { start, end, day, marks: [{ key, date }] }, or null if not known for that year.
export function windowFor(season, year) {
  if (!season.lunar) {
    const at = ([m, d]) => new Date(year, m - 1, d);
    return { start: at(season.start), end: at(season.end), day: at(season.day), marks: [] };
  }
  const L = LUNAR[year] || {};
  switch (season.id) {
    case 'navratri': {
      const start = lunarDate(year, 'navratri'), day = lunarDate(year, 'dussehra');
      return start && day ? { start, end: day, day, marks: [] } : null;
    }
    case 'diwali': {
      const day = lunarDate(year, 'diwali');
      if (!day) return null;
      const dussehra = lunarDate(year, 'dussehra');
      const marks = [['dhanteras', -2], ['choti', -1], ['govardhan', 1], ['bhaiDooj', 2]]
        .map(([key, off]) => ({ key, date: key in L ? lunarDate(year, key) : addDays(day, off) }))
        .filter(m => m.date && !sameDay(m.date, day));
      const end = marks.find(m => m.key === 'bhaiDooj')?.date || addDays(day, 2);
      return { start: dussehra ? addDays(dussehra, 1) : addDays(day, -14), end, day, marks };
    }
    case 'holi': case 'rakhi': case 'ganesh': {
      const day = lunarDate(year, season.id);
      if (!day) return null;
      const lead = season.id === 'holi' ? 7 : 5;
      return { start: addDays(day, -lead), end: season.id === 'ganesh' ? addDays(day, 10) : day, day, marks: [] };
    }
  }
  return null;
}

// Seasons running today, in the order they started.
export function activeSeasons(date = new Date(), enabled = null) {
  const today = startOfDay(date);
  return SEASONS.filter(s => !enabled || enabled[s.id])
    .map(s => ({ season: s, win: windowFor(s, today.getFullYear()) }))
    .filter(x => x.win && today >= x.win.start && today <= x.win.end)
    .sort((a, b) => a.win.start - b.win.start);
}

const isOwnDay = ({ win }, today) => sameDay(win.day, today) || win.marks.some(m => sameDay(m.date, today));

// Overlaps (e.g. Halloween + Navratri): on a festival's own day both flybys use it (two on the same day split
// morning/evening); otherwise the morning gets the season that started first and the evening gets the next one.
export function pickSeason(kind, date = new Date(), enabled = null) {
  const list = activeSeasons(date, enabled);
  if (!list.length) return null;
  const own = list.filter(x => isOwnDay(x, startOfDay(date)));
  const pool = own.length ? own : list;
  return (kind === 'evening' && pool[1] ? pool[1] : pool[0]).season;
}

export function activeSeason(date = new Date(), enabled = null) {
  return activeSeasons(date, enabled)[0]?.season || null;
}

// The season's window running today, else the next one to start.
function currentOrNextWindow(season, date) {
  const today = startOfDay(date);
  for (const y of [today.getFullYear(), today.getFullYear() + 1]) {
    const w = windowFor(season, y);
    if (w && today <= w.end) return w;
  }
  return null;
}

export function nextSeason(date = new Date(), enabled = null) {
  const today = startOfDay(date);
  return SEASONS.filter(s => !enabled || enabled[s.id])
    .map(s => ({ season: s, win: currentOrNextWindow(s, date) }))
    .filter(x => x.win && x.win.start > today)
    .map(x => ({ season: x.season, date: x.win.start }))
    .sort((a, b) => a.date - b.date)[0] || null;
}

// Days from today to the season's main day (negative once it has passed, e.g. Dec 26). null if dates unknown.
export function daysUntil(season, date = new Date()) {
  const w = currentOrNextWindow(season, date);
  return w ? daysBetween(date, w.day) : null;
}

// ---------- messages ----------

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

const LINES = {
  morning: {
    everyday: ['Good morning! ☀️', 'Rise and shine! 🌤️', 'Morning! Coffee first ☕', 'A fresh day, a fresh start 🌱', 'Hello, sunshine! 🌞'],
    christmas: ['Good morning! Ho ho ho! 🎅', 'Rise and jingle! 🔔', 'Morning! Santa’s already busy 🎁'],
    halloween: ['Good morning, boo! 👻', 'Rise and haunt! 🦇', 'Morning! Witch coffee brewing ☕🧙'],
    navratri: ['Shubh Navratri! 🌼', 'Good morning! Garba tonight? 💃', 'Rise and dandiya! 🥢'],
    diwali: ['Shubh Deepavali! 🪔', 'Good morning! Lights on ✨', 'Rise and shine like a diya 🪔'],
    holi: ['Bura na mano, Holi hai! 🎨', 'Rise and splash! 💦', 'Morning! Gulaal ready? 🌈'],
    rakhi: ['Good morning! Rakhi ready? 🧵', 'Rise and shine, siblings! 💛', 'Morning! Don’t forget the sweets 🍬'],
    ganesh: ['Ganpati Bappa Morya! 🌼', 'Good morning! Modak time 🍡', 'Rise and shine, Bappa’s here 🌼']
  },
  evening: {
    everyday: ['That’s a wrap for today 🌙', 'Great work today — time to log off ✨', 'Day done. Go rest! 😴', 'Close the laptop, you earned it 💤', 'Signing off for the night 🌜'],
    christmas: ['Sleigh bells & sign-off 🛷', 'Day done — hot cocoa time ☕🎄', 'Santa says: go home! 🎅'],
    halloween: ['Home before the witching hour! 🧙', 'Day done — beware the dark 🕸️', 'Fly home safe tonight 🦇'],
    navratri: ['Day done, garba time! 💃', 'Log off and grab your dandiya 🥢', 'Go home, the aarti’s starting 🪔'],
    diwali: ['Light a diya, log off 🪔', 'Day done, mithai time 🍬', 'Sign off and sparkle ✨'],
    holi: ['Day done, go wash off the colours 🎨', 'Go home, gujiya is waiting 😋', 'Colourful evening ahead 🌈'],
    rakhi: ['Day done, call your sibling 📞', 'Sign off and tie a rakhi 🧵', 'Go home, the sweets are waiting 🍬'],
    ganesh: ['Day done, aarti time 🪔', 'Sign off, Bappa’s waiting 🌼', 'Go home for modaks 🍡']
  }
};

function weekdayLine(when, date) {
  const d = date.getDay(); // 0 Sun … 6 Sat
  if (when === 'morning') {
    return ['Enjoy your Sunday 🛋️', 'New week, let’s go 💪', 'Tuesday: you’ve got this 🚀', 'Halfway there — happy Wednesday 🐫',
            'Thursday! Almost there 🏁', 'It’s Friday! 🎉', 'Happy Saturday — take it easy 🌈'][d];
  }
  return ['Rest up for the week ahead 🌙', 'Monday: done ✅', 'Two down, three to go ✌️', 'Over the hump! 🐪',
          'One more day to go 🙌', 'Weekend starts now! 🥳', 'Enjoy your Saturday night 🌟'][d];
}

const DIWALI_DAYS = {
  dhanteras: 'Happy Dhanteras! ✨', choti: 'Happy Choti Diwali! 🪔',
  govardhan: 'Happy Govardhan Puja! 🙏', bhaiDooj: 'Happy Bhai Dooj! 💛'
};

function seasonLine(season, date) {
  const n = daysUntil(season, date);
  if (n === null) return `Happy ${season.name}! ${season.emoji}`;   // no dates for this year yet
  const today = startOfDay(date);
  const countdown = (what, emoji) => n === 1 ? `${what} is tomorrow! ${emoji}` : `${n} days until ${what} ${emoji}`;
  switch (season.id) {
    case 'christmas':
      return n === 0 ? 'Merry Christmas! 🎄' : n === 1 ? 'It’s Christmas Eve! 🎁' : n < 0 ? 'Hope you had a merry Christmas! ❄️' : `${n} days until Christmas 🎄`;
    case 'halloween':
      return n === 0 ? 'Happy Halloween! 🎃' : n === 1 ? 'Halloween is tomorrow! 🕸️' : `${n} days until Halloween 🎃`;
    case 'navratri': {
      if (n === 0) return 'Happy Dussehra! Good wins 🏹';
      const k = daysBetween(currentOrNextWindow(season, date).start, today) + 1;   // Navratri day number
      if (k === 1) return 'Navratri begins today! 🪔';
      if (n === 1) return 'Dussehra is tomorrow! 🏹';
      return k >= 2 && k <= 9 ? `Navratri day ${k} · ${n} days to Dussehra 🏹` : `${n} days until Dussehra 🏹`;
    }
    case 'diwali': {
      if (n === 0) return 'Happy Diwali! 🪔🎆';
      const mark = currentOrNextWindow(season, date).marks.find(m => sameDay(m.date, today));
      if (mark) return DIWALI_DAYS[mark.key];
      return n < 0 ? 'Hope you had a sparkling Diwali ✨' : countdown('Diwali', '🪔');
    }
    case 'holi':
      return n === 0 ? 'Happy Holi! 🎨' : n === 1 ? 'Holika Dahan tonight, Holi tomorrow! 🔥' : `${n} days until Holi 🎨`;
    case 'rakhi':
      return n === 0 ? 'Happy Raksha Bandhan! 🧵' : countdown('Raksha Bandhan', '🧵');
    case 'ganesh':
      if (n === 0) return 'Happy Ganesh Chaturthi! 🌼';
      if (n === -10) return 'Ganpati Bappa Morya! Visarjan today 🌊';
      return n < 0 ? `Ganeshotsav day ${1 - n} 🌼` : countdown('Ganesh Chaturthi', '🌼');
  }
  return `${season.emoji} ${season.name}`;
}

// kind: 'morning' | 'evening'
export function buildMessage(kind, season, date = new Date()) {
  if (!season) return { art: kind === 'morning' ? 'sun' : 'moon', title: pick(LINES[kind].everyday), sub: weekdayLine(kind, date) };
  const msg = { art: season.id, title: pick(LINES[kind][season.id]), sub: seasonLine(season, date) };
  if (season.id === 'diwali') msg.bursts = daysUntil(season, date) === 0 ? 12 : 6;   // crackers across the screen
  return msg;
}

// forceSeason: a season id | 'none' | undefined (auto from date)
export async function buildConfig(kind, { forceSeason, date = new Date() } = {}) {
  const settings = await getSettings();
  const season = forceSeason === 'none' ? null
    : forceSeason ? SEASONS.find(s => s.id === forceSeason)
    : pickSeason(kind, date, settings.enabled);
  if (!season && !settings.everyday && !forceSeason) return null;   // outside seasons and everyday greetings are off
  return { ...buildMessage(kind, season, date), duration: settings.durationSec };
}
