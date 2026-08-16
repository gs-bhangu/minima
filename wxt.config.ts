import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    name: 'Minima',
    short_name: 'Minima',
    author: 'G S Bhangu',
    homepage_url: 'https://github.com/gs-bhangu/minima',
    description:
      'A quiet new tab. Time, date, weather, currencies and your bookmarks — nothing else.',
    permissions: ['storage', 'bookmarks', 'favicon', 'search'],
    host_permissions: [
      'https://api.open-meteo.com/*',
      'https://geocoding-api.open-meteo.com/*',
      'https://ipapi.co/*',
      'https://api.frankfurter.dev/*',
    ],
  },
});
