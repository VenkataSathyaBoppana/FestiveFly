# Festive Flyby (Chrome MV3)

Two flybys a day. A character crosses the page you're viewing with a short message trailing behind.

| When | Everyday | Oct 1–31 | Dec 1–26 |
|---|---|---|---|
| **Morning**: first Chrome use between 4 AM and noon | Smiling sun + coffee, weekday line ("It's Friday! 🎉") | Witch + Halloween countdown | Santa + Christmas countdown |
| **End of day**: at your chosen time (default 6 PM), or when you're next in Chrome after it | Sleepy moon in a nightcap ("That's a wrap for today 🌙") | Witch | Santa |

### v1.2: Indian festivals
| Season | 2026–27 dates | Character |
|---|---|---|
| 🏹 Navratri & Dussehra | Oct 11 – Oct 20, 2026 · Sep 30 – Oct 9, 2027 | Flaming arrow, dandiya sticks, marigolds |
| 🪔 Diwali | Oct 21 – Nov 11, 2026 (Dhanteras, Diwali, Govardhan Puja and Bhai Dooj each get their own message) | Diya, rangoli, phuljhadi + crackers bursting across the screen (6 bursts; 12 on Diwali day; off with "reduce motion") |
| 🎨 Holi | Week before Holi (Mar 22, 2027) | Pichkari + gulaal |
| 🧵 Raksha Bandhan | 5 days before (Aug 17, 2027) | Rakhi + sweets box |
| 🌼 Ganesh Chaturthi | 5 days before through Anant Chaturdashi (Sep 4–14, 2027) | Modaks, marigold toran, diya |

**Overlaps:** when seasons overlap, as Navratri and Halloween do, the morning flyby gets the season that started first and the evening flyby gets the other one. On a festival's own day, both flybys use that festival.

**Dates:** these follow the lunar calendar, so they live in the `LUNAR` table in `shared.js`. 2026 (remaining festivals) through 2029 are filled in. Add each new year's row before its first season starts; a season with no row for the year simply doesn't run.

- **Theme contrast:** the card is white in dark mode and black in light mode.
- **Once each per day:** each greeting shows at most once a day. If Chrome isn't focused, or you're on a `chrome://` page, it waits for your next tab or window switch.
- **Holidays only:** the "Every day" toggle off means flybys happen only during the festival seasons you have turned on.
- **Install day:** there's no morning greeting on the day you install; the welcome page opens instead.

## How it works
- There is no interval timer. The morning check runs on `tabs.onActivated`, `tabs.onUpdated`, `windows.onFocusChanged` and `runtime.onStartup`.
- The evening uses one daily `chrome.alarms` alarm, plus the same activity checks as a catch-up.
- `lastMorning` / `lastEvening` day keys in `chrome.storage.local` prevent repeats.
- The animation is injected with `scripting.executeScript` into a closed shadow DOM. It uses `pointer-events: none`, **Esc** dismisses it, and it fades instead of flying when "reduce motion" is on.
- Site access is **optional**. Without it you get a system notification instead. The popup's "Show now" buttons work anywhere (`activeTab`).

## Files
```
manifest.json   background.js (triggers + injector)   shared.js (seasons, settings, messages)
flyby.js        (injected animation + original SVG art: sun, moon, Santa, witch, Navratri, Diwali, Holi, Rakhi, Ganesh)
welcome.html/js (onboarding, settings, previews)   popup.html/js   styles.css   icons/
```

## Store listing notes
- **Single purpose:** show a short animated morning greeting and end-of-day message on the current page, with holiday characters in season.
- **Permission justifications:**
  - `alarms`: the daily end-of-day time.
  - `scripting` + optional `<all_urls>`: draw the animation on the page you're viewing. It never reads pages.
  - `activeTab`: the "Show now" buttons.
  - `storage`: settings and last-shown dates.
  - `notifications`: fallback when site access isn't granted.
- **Data:** none collected.
- **Artwork:** all original SVG.
