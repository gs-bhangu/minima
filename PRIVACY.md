# Privacy

Minima has no account, no server of its own, and no analytics.

## What stays on this device

Settings, notes, to-dos, custom shortcuts, hidden-item lists and an optional
background picture are stored in `chrome.storage.local` on the computer. Nothing
is synced through Minima.

In bookmarks mode, Minima reads the browser bookmark tree so it can draw the
page. Edits you make there are written back to Chrome’s bookmarks. That data
does not leave the browser except as described below.

## What can go out on the network

Only if you turn the feature on:

| Feature | Destination | What is sent |
| ------- | ----------- | ------------ |
| Weather | [Open-Meteo](https://open-meteo.com) | The place you picked (coordinates) |
| City search | Open-Meteo geocoding | The letters you type |
| Detect location | [ipapi.co](https://ipapi.co) | Your IP address, once, to guess a city |
| Currency rates | [Frankfurter](https://frankfurter.dev) | The currency codes you track |
| Online tile icons | Google’s favicon service | The site address of each shortcut |

Search and “ask an AI” open the engine you chose in a tab. Minima does not
proxy those queries.

Default setup: weather is on but has no place until you set one; currencies are
off; tile icons use the browser’s local cache.

## What Minima does not do

- No advertising
- No tracking pixels
- No fingerprinting
- No sale of data
- No remote code

## Contact

Issues and questions: [github.com/gs-bhangu/minima](https://github.com/gs-bhangu/minima).

Published by DistroGlobe Solutions Private Limited.
