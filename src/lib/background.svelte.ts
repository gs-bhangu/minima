const KEY = 'minima:background';

/** Sentinel stored in settings when the image comes from an uploaded file. */
export const STORED = '@stored';

const ATTEMPTS = [
  { edge: 2400, quality: 0.82 },
  { edge: 1920, quality: 0.72 },
  { edge: 1440, quality: 0.62 },
];

/** chrome.storage.local allows ~10 MB in total, so stay well under it. */
const MAX_CHARS = 5_000_000;

async function encode(file: File) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not read that image.');

  let last = '';
  for (const { edge, quality } of ATTEMPTS) {
    const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    last = canvas.toDataURL('image/jpeg', quality);
    if (last.length <= MAX_CHARS) break;
  }
  bitmap.close();

  if (last.length > MAX_CHARS) throw new Error('That image is too large to store.');
  return last;
}

class BackgroundStore {
  dataUrl = $state<string | null>(null);
  busy = $state(false);
  error = $state('');

  #loaded = false;

  async load() {
    if (this.#loaded) return;
    this.#loaded = true;
    try {
      const stored = (await browser.storage.local.get(KEY))[KEY];
      if (typeof stored === 'string') this.dataUrl = stored;
    } catch {
      // No stored image, or storage is unavailable.
    }
  }

  async save(file: File) {
    this.busy = true;
    this.error = '';
    try {
      const dataUrl = await encode(file);
      await browser.storage.local.set({ [KEY]: dataUrl });
      this.dataUrl = dataUrl;
      return true;
    } catch (error) {
      this.error =
        error instanceof Error ? error.message : 'Could not use that image.';
      return false;
    } finally {
      this.busy = false;
    }
  }

  async clear() {
    this.dataUrl = null;
    this.error = '';
    await browser.storage.local.remove(KEY);
  }
}

export const background = new BackgroundStore();
