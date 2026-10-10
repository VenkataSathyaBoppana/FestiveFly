// Festive Flyby service worker: two flybys a day.
//   Morning  — on your first Chrome use between 4:00 and noon.
//   Evening  — at your end-of-day time (or the next time you're in Chrome that evening).
import { EVENING_ALARM, getSettings, buildConfig, isMorning, eveningAt, dayKey } from './shared.js';

const ALL_SITES = { origins: ['<all_urls>'] };

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  await scheduleEvening();
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    // Don't greet on the install day's morning — the welcome page is enough.
    await chrome.storage.local.set({ lastMorning: dayKey() });
    chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
  }
});

chrome.runtime.onStartup.addListener(async () => {
  await scheduleEvening();
  checkDue();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !changes.settings) return;
  if (changes.settings.oldValue?.eveningTime !== changes.settings.newValue?.eveningTime) scheduleEvening();
});

// Daily alarm at the end-of-day time.
async function scheduleEvening() {
  const settings = await getSettings();
  let when = eveningAt(settings);
  if (when <= new Date()) when = new Date(when.getTime() + 86400e3);
  await chrome.alarms.clear(EVENING_ALARM);
  await chrome.alarms.create(EVENING_ALARM, { when: when.getTime(), periodInMinutes: 1440 });
}

chrome.alarms.onAlarm.addListener(a => { if (a.name === EVENING_ALARM) checkDue(); });

// Any sign of the user being in Chrome → see if a flyby is due.
chrome.windows.onFocusChanged.addListener(id => { if (id !== chrome.windows.WINDOW_ID_NONE) checkDue(); });
chrome.tabs.onActivated.addListener(() => checkDue());
chrome.tabs.onUpdated.addListener((_id, info, tab) => { if (info.status === 'complete' && tab.active) checkDue(); });

let checking = false;
async function checkDue() {
  if (checking) return;
  checking = true;
  try {
    const now = new Date();
    const today = dayKey(now);
    const settings = await getSettings();
    const { lastMorning, lastEvening } = await chrome.storage.local.get(['lastMorning', 'lastEvening']);

    let kind = null;
    if (settings.evening && lastEvening !== today && now >= eveningAt(settings, now)) kind = 'evening';
    else if (settings.morning && lastMorning !== today && isMorning(now)) kind = 'morning';
    if (!kind) return;

    const cfg = await buildConfig(kind);
    if (!cfg) {                                        // nothing to show today (everyday greetings off, no season)
      await chrome.storage.local.set({ [kind === 'morning' ? 'lastMorning' : 'lastEvening']: today });
      return;
    }
    if (await tryShow(cfg)) {
      await chrome.storage.local.set({ [kind === 'morning' ? 'lastMorning' : 'lastEvening']: today });
      if (kind === 'evening' && lastMorning !== today) await chrome.storage.local.set({ lastMorning: today });
    }
    // Not shown (Chrome not focused / on a chrome:// page) → the next tab or focus event tries again.
  } finally {
    checking = false;
  }
}

// Returns true if the flyby was shown (or a notification was used instead).
async function tryShow(cfg) {
  const win = await chrome.windows.getLastFocused({ windowTypes: ['normal'] }).catch(() => null);
  if (!win?.focused) return false;
  const [tab] = await chrome.tabs.query({ active: true, windowId: win.id });
  if (!tab) return false;
  if (!(await chrome.permissions.contains(ALL_SITES))) { notify(cfg); return true; }
  if (!isInjectable(tab.url)) return false;
  return inject(tab.id, cfg);
}

async function inject(tabId, cfg) {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, func: c => { window.__festiveFlybyCfg = c; }, args: [cfg] });
    await chrome.scripting.executeScript({ target: { tabId }, files: ['flyby.js'] });
    return true;
  } catch {
    return false;
  }
}

function isInjectable(url = '') {
  if (!/^(https?|file):/.test(url)) return false;
  try {
    const u = new URL(url);
    if (u.hostname === 'chromewebstore.google.com') return false;
    if (u.hostname === 'chrome.google.com' && u.pathname.startsWith('/webstore')) return false;
  } catch { return false; }
  return true;
}

// Fallback when the user hasn't granted site access.
function notify(cfg) {
  const id = `flyby-${Date.now()}`;
  chrome.notifications.create(id, { type: 'basic', iconUrl: 'icons/icon128.png', title: cfg.title, message: cfg.sub, silent: true });
  setTimeout(() => chrome.notifications.clear(id), 8000);
}

// Popup buttons → inject into the current tab (activeTab covers this without site access).
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== 'showNow') return;
  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab || !isInjectable(tab.url || 'https://x')) return { ok: false, error: 'Open a regular web page first — Chrome pages can’t show the flyby.' };
    const cfg = (await buildConfig(msg.kind, { forceSeason: msg.season })) || (await buildConfig(msg.kind, { forceSeason: 'none' }));
    const ok = await inject(tab.id, cfg);
    return ok ? { ok: true } : { ok: false, error: 'This page doesn’t allow extensions to draw on it. Try another site.' };
  })().then(sendResponse);
  return true;
});
