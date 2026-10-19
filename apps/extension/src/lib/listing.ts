import type { StoreListing } from '@authx/ui/host.js';

const CHROME_ID = 'occcfljfhlijenkofoceocnimkfpdndl';
const EDGE_ID = 'lnbabkbknabedpnmdihllnbhdmolianm';

/**
 * Where this copy was installed from, so the rating lands on the listing the
 * person actually uses. The store builds are known by their ids; an unpacked
 * build goes by the browser.
 */
export function storeListing(
  extensionId: string = chrome.runtime.id,
  userAgent: string = navigator.userAgent,
): StoreListing {
  const edge = extensionId === EDGE_ID || (extensionId !== CHROME_ID && / Edg\//.test(userAgent));
  return edge
    ? { store: 'Edge Add-ons', url: `https://microsoftedge.microsoft.com/addons/detail/${EDGE_ID}` }
    : { store: 'the Chrome Web Store', url: `https://chromewebstore.google.com/detail/${CHROME_ID}/reviews` };
}
