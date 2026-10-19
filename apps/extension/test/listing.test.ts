import { describe, expect, it } from 'vitest';
import { storeListing } from '../src/lib/listing.js';

describe('which listing to rate', () => {
  const CHROME_UA = 'Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36';
  const EDGE_UA = `${CHROME_UA} Edg/140.0.0.0`;

  it('the store a copy came from, whatever browser it runs in', () => {
    expect(storeListing('occcfljfhlijenkofoceocnimkfpdndl', EDGE_UA).url).toContain('chromewebstore.google.com');
    expect(storeListing('lnbabkbknabedpnmdihllnbhdmolianm', CHROME_UA).url).toContain('microsoftedge.microsoft.com');
  });

  it('an unpacked build goes by the browser', () => {
    expect(storeListing('a'.repeat(32), EDGE_UA).store).toBe('Edge Add-ons');
    expect(storeListing('a'.repeat(32), CHROME_UA).store).toBe('the Chrome Web Store');
  });
});
