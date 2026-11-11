import type { StoreListing } from '@authx/ui/host.js';

const CHROME_ID = 'occcfljfhlijenkofoceocnimkfpdndl';
const EDGE_ID = 'lnbabkbknabedpnmdihllnbhdmolianm';
/** The add-on's id on Firefox, chosen rather than given (scripts/firefox.mjs, GECKO_ID). */
export const FIREFOX_ID = 'authenticator@keyrook.com';

/**
 * Where this copy was installed from, so the rating lands on the listing the
 * person actually uses. The store builds are known by their ids; an unpacked
 * build goes by the browser.
 */
export function storeListing(
  extensionId: string = chrome.runtime.id,
  userAgent: string = navigator.userAgent,
): StoreListing {
  if (extensionId === FIREFOX_ID || / Firefox\//.test(userAgent)) {
    // addons.mozilla.org finds an add-on by its id as well as by the name in
    // its address, which is chosen only when the listing is made.
    return { store: 'firefox', url: `https://addons.mozilla.org/firefox/addon/${FIREFOX_ID}/` };
  }
  const edge = extensionId === EDGE_ID || (extensionId !== CHROME_ID && / Edg\//.test(userAgent));
  return edge
    ? { store: 'edge', url: `https://microsoftedge.microsoft.com/addons/detail/${EDGE_ID}` }
    : { store: 'chrome', url: `https://chromewebstore.google.com/detail/${CHROME_ID}/reviews` };
}
