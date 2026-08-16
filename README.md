# Minima

A quiet new tab for Chrome. Time, date, weather, currencies and your bookmarks — nothing else.

Built with [WXT](https://wxt.dev), Svelte 5, TypeScript and plain CSS. Every
preference is stored in `chrome.storage.local`; there is no account, no sync
server and no analytics.

Open source. Maintained by [G S Bhangu](https://github.com/gs-bhangu).
Published by DistroGlobe Solutions Private Limited.

Source: [github.com/gs-bhangu/minima](https://github.com/gs-bhangu/minima)

## Features

**Header**

- Large, light clock with 12/24-hour, seconds, sans or mono numerals and a size slider.
  A second slider sizes the date, weather, world clocks, greeting and rates.
- Date in four formats, plus an optional time-aware greeting with your name.
- Temperature and condition from [Open-Meteo](https://open-meteo.com). Pick a city by
  name or detect an approximate location from your IP. Readings are cached for 20 minutes.
- World clocks: add any number of extra time zones and they appear in small type under the
  date, marked `+1` or `−1` when the day differs from yours.
- Currency rates from [Frankfurter](https://frankfurter.dev): pick a base currency (e.g. INR)
  and track others (USD, EUR, …). Each line shows how much 1 unit of that currency is worth
  in your base. Rates are cached for an hour.

**Editing on the page** — you rarely need to open settings:

- Right-click anywhere for _New shortcut_ and _New group_.
- Right-click a group for add, rename, colour, collapse, reorder and delete.
- Right-click a tile to open it in a new tab, edit it, copy its address, nudge it left or
  right, hide it, or delete it. A group can also open all of its links at once.
- Drag tiles between groups and drag group headers to reorder them. Double-click a group
  title to rename it in place. Drop a link from another tab straight into a group.
- Give any group a background tint from the eight-colour palette in its menu.

In bookmarks mode these edits write through to your real bookmarks: dragging moves the
bookmark, adding creates one, renaming a group renames the folder. Removing offers _Hide
from Minima_ first; anything that actually deletes is marked and asks for a second click.

Hiding is always reversible three ways: an Undo appears for a few seconds afterwards, the
page's right-click menu offers _Show N hidden items_, and Settings → Shortcuts lists
everything hidden with a Show button beside each.

**Shortcuts** — two sources, switchable at any time:

- _Browser bookmarks_ — read live from `chrome.bookmarks`. Choose any folder (or all
  bookmarks) as the root, arrange them by folder or as a single grid, optionally flatten
  nested folders, and give loose links their own group. Individual bookmarks or whole
  folders can be hidden, and any of them can get a custom icon.
- _Custom set_ — hand-built groups of shortcuts, independent of your bookmarks, edited
  either on the page or from the list in settings.

Icons come from the browser's own favicon cache by default, so nothing leaves the
machine. Switch to _Online_ if you would rather fetch missing icons from Google. Any
shortcut can instead use an emoji, one or two letters, or an image URL.

**Look**

- Auto / light / dark theme and six muted accents. The accent runs through the whole page,
  not just settings: search focus, tile hover, group headers, add buttons, drop indicators
  and completed to-dos.
- Background: the default paper, one of twelve colour presets, any colour you like, or your
  own picture. Pick a colour and Minima flips its text between light and dark to suit it.
  Pictures come from a file or an address and get Fit, Dim and Blur controls; panels frost
  over so text stays readable on top of them.
- Accent, background and group colours all take a hex code or the system colour picker
  alongside the presets.
- Optional paper grain.
- Icon greyscale slider with an optional return to colour on hover.
- Four icon shapes, three tile sizes, four content widths, one or two group columns.
- Labels, group titles, group cards, add buttons and animations can each be switched off.
- Per-group background tints.

**Search**

- A field for the web or an address. Queries go through Chrome’s Search API, so they
  use the search engine already set in the browser. Anything that looks like an address
  opens directly.
- While you type, matching shortcuts appear under the bar. Arrow keys select one, `Enter`
  opens it.

**Panels** — both off by default:

- _To-do_ — a checklist you type straight into. `Enter` starts the next task, `Backspace`
  on an empty task deletes it, and completed items clear in one click.
- _Notes_ — a scratchpad that grows as you write and saves as you type.

Either panel can sit in the main column or be pinned to the left or right edge: drag it by
its title and drop it on a side, or right-click it. Put both on one side to stack them, or
one on each side. Docked panels return to the column automatically when the window is too
narrow to hold them beside the content.

**Keyboard**

| Key      | Action                |
| -------- | --------------------- |
| `/`      | Focus the search box  |
| `Ctrl+K` | Focus the search box  |
| `Ctrl+,` | Open settings         |
| `Esc`    | Close settings, or clear the search box |

## Development

```bash
npm install
npm run dev          # dev build + auto-reloading browser
npm run check        # svelte-check
npm run build        # production build into .output/chrome-mv3
npm run zip          # packaged zip for the Chrome Web Store
```

To load it manually: `chrome://extensions` → enable Developer mode → **Load unpacked** →
select `.output/chrome-mv3`.

## Permissions

| Permission                                                  | Why                                              |
| ----------------------------------------------------------- | ------------------------------------------------ |
| `storage`                                                     | Saving your settings and background locally      |
| `bookmarks`                                                   | Reading bookmarks in bookmarks mode              |
| `favicon`                                                     | Browser's local favicon cache for tile icons     |
| `search`                                                      | The search field uses Chrome’s default engine    |
| `api.open-meteo.com`, `geocoding-api.open-meteo.com`          | Weather and city lookup                          |
| `ipapi.co`                                                    | Optional one-off location detection              |
| `api.frankfurter.dev`                                         | Optional currency rates                          |

Network calls are opt-in. Weather talks to Open-Meteo after you pick a place.
Detect-location talks to ipapi.co once, if you ask it to. Rates talk to
Frankfurter after you turn currencies on. Online tile icons (off by default)
load favicons from Google.

See [Privacy](PRIVACY.md).

## Project layout

```
src/
  entrypoints/
    background.ts        opens the new tab once after install
    newtab/              the page itself
  components/
    controls/            settings primitives (toggle, slider, segmented…)
    settings/            settings panel and its editors
  lib/
    settings.svelte.ts   reactive store backed by chrome.storage.local
    sections.svelte.ts   one shape for both shortcut sources
    mutations.ts         edits, applied to the custom set or to real bookmarks
    bookmarks.svelte.ts  bookmark tree → sections, with live updates
    weather.svelte.ts    Open-Meteo client and cache
    currency.svelte.ts   Frankfurter rates client and cache
    currencies.ts        currency labels and formatting
    clock.svelte.ts      shared ticker, pauses when the tab is hidden
    timezones.ts         world clock formatting
    search.ts            address vs query; queries use chrome.search
  styles/app.css         reset, design tokens and shared primitives
```

## License

[MIT](LICENSE) © DistroGlobe Solutions Private Limited
