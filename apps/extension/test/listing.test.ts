import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { FIREFOX_ID, storeListing } from '../src/lib/listing.js';

describe('which listing to rate', () => {
  const CHROME_UA = 'Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36';
  const EDGE_UA = `${CHROME_UA} Edg/140.0.0.0`;
  const FIREFOX_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0';

  it('the store a copy came from, whatever browser it runs in', () => {
    expect(storeListing('occcfljfhlijenkofoceocnimkfpdndl', EDGE_UA).url).toContain('chromewebstore.google.com');
    expect(storeListing('lnbabkbknabedpnmdihllnbhdmolianm', CHROME_UA).url).toContain('microsoftedge.microsoft.com');
  });

  it('an unpacked build goes by the browser', () => {
    expect(storeListing('a'.repeat(32), EDGE_UA).store).toBe('edge');
    expect(storeListing('a'.repeat(32), CHROME_UA).store).toBe('chrome');
    expect(storeListing('{8b5c2f1e-0000-4000-8000-000000000000}', FIREFOX_UA).store).toBe('firefox');
  });

  it('Firefox’s copy, by the add-on id its manifest carries', async () => {
    const { GECKO_ID } = await import(pathToFileURL(resolve(import.meta.dirname, '../scripts/firefox.mjs')).href);
    expect(FIREFOX_ID).toBe(GECKO_ID);
    expect(storeListing(FIREFOX_ID, FIREFOX_UA)).toEqual({
      store: 'firefox',
      url: 'https://addons.mozilla.org/firefox/addon/authenticator@keyrook.com/',
    });
  });
});
