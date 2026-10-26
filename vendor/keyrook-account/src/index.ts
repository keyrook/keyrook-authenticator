/**
 * The Keyrook account, as every Keyrook product reaches it: how a password
 * becomes keys, what goes over the wire, the recovery kit, and moving the key
 * to a new browser.
 *
 * Products copy this package and never edit their copy. Nothing in here may
 * reference `chrome.*`, `window` or the DOM.
 */

// Crypto
export * from './crypto/kdf.js';
export * from './crypto/aead.js';

// The account
export * from './sync/adapter.js';
export * from './sync/account.js';
export * from './sync/protocol.js';
export * from './sync/http.js';
export * from './sync/kit.js';
export * from './sync/recovery.js';
export * from './sync/pairing.js';

// Keys per product: the account's root, each product's box, its pin
export * from './keys/product.js';
export * from './keys/root.js';
export * from './keys/box.js';
export * from './keys/pin.js';
// Proof a device was removed by a holder of the product's key
export * from './keys/removal.js';

// The flows every product runs on those keys
export * from './flows/product-key.js';
export * from './flows/recovery.js';
export * from './flows/start-over.js';
export * from './flows/console.js';
export * from './flows/passkey.js';

// Utilities worth exposing to app code
export { crockfordDecode, crockfordEncode, group } from './util/crockford.js';
export { toBase64, toBase64Url, fromBase64, toHex, fromHex, utf8, fromUtf8 } from './util/bytes.js';
export { newId, randomBytes } from './util/id.js';
