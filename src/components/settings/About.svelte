<script lang="ts">
  const manifest = browser.runtime.getManifest();
  const year = new Date().getFullYear();
</script>

<div class="about">
  <div class="mark">
    <span class="name">Minima</span>
    <span class="version">v{manifest.version}</span>
  </div>

  <p class="tagline">
    A quiet new tab. Time, date, weather, currencies and your bookmarks — nothing else.
  </p>

  <dl>
    <div>
      <dt>Author</dt>
      <dd>
        <a href="https://github.com/gs-bhangu" target="_blank" rel="noopener noreferrer">
          G S Bhangu
        </a>
      </dd>
    </div>
    <div>
      <dt>Publisher</dt>
      <dd>DistroGlobe Solutions Private Limited</dd>
    </div>
    <div>
      <dt>Source</dt>
      <dd>
        Open source on
        <a href="https://github.com/gs-bhangu/minima" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        ·
        <a
          href="https://github.com/gs-bhangu/minima/blob/main/LICENSE"
          target="_blank"
          rel="noopener noreferrer"
        >
          MIT
        </a>
      </dd>
    </div>
    <div>
      <dt>Storage</dt>
      <dd>Everything stays in <code>chrome.storage.local</code> on this device.</dd>
    </div>
    <div>
      <dt>Network</dt>
      <dd>
        Weather, city lookup and currency rates, and only after you turn those on. No
        analytics, no accounts, no tracking.
      </dd>
    </div>
  </dl>

  <p class="copyright">© {year} DistroGlobe Solutions Private Limited</p>
</div>

<style>
  .about {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
    border-radius: var(--r-md);
    border: 1px solid var(--line);
    background: var(--bg);
  }

  .mark {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .name {
    font-size: 15px;
    font-weight: 300;
    letter-spacing: 0.06em;
  }

  .version {
    font-size: 10.5px;
    font-variant-numeric: tabular-nums;
    color: var(--text-faint);
  }

  .tagline {
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-muted);
  }

  dl {
    display: flex;
    flex-direction: column;
    gap: 9px;
    margin: 0;
    padding-top: 2px;
    border-top: 1px solid var(--line);
  }

  dl div {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-top: 7px;
  }

  dt {
    font-size: 9.5px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-faint);
  }

  dd {
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
    color: var(--text);
  }

  a {
    color: inherit;
    text-decoration: none;
    border-bottom: 1px solid var(--line);
  }

  a:hover {
    border-bottom-color: var(--text-muted);
  }

  code {
    font-family: var(--font-mono);
    font-size: 10.5px;
    padding: 1px 4px;
    border-radius: 4px;
    background: var(--surface);
  }

  .copyright {
    font-size: 10.5px;
    color: var(--text-faint);
  }
</style>
