/**
 * The products that share a Keyrook account, each with a data key of its own.
 *
 * Every product names itself with a constant in its own code, and binds its
 * keys to that name. It never uses a name the server reports: a server that
 * could choose the name could make one product's box open as another's.
 */
import { toBase64, utf8, wipe } from '../util/bytes.js';
import { deriveKeyCheck } from '../sync/recovery.js';

export const AUTHENTICATOR = 'authenticator';
export const PASSHOLD = 'passhold';

/** Lower case, a letter first: names go into labels, and nothing in them may be read two ways. */
const PRODUCT_NAME = /^[a-z][a-z0-9-]{1,30}$/;
/** The server's own id for the account, never the email, which can change. */
const ACCOUNT_ID = /^[A-Za-z0-9_-]{1,64}$/;

export function assertProductName(product: string): void {
  if (!PRODUCT_NAME.test(product)) throw new Error('Not a Keyrook product name.');
}

export function assertAccountId(accountId: string): void {
  if (!ACCOUNT_ID.test(accountId)) throw new Error('Malformed account id.');
}

/**
 * Proof of holding a product's key, for the server to check before it lets a
 * device change that product's box. Unlinkable to the key: HKDF under a label
 * that names the product.
 *
 * Keyrook Authenticator's key is the account's data key from before keys
 * were per product, and every server already checks its proof under
 * `authx:v1:key-check`; it keeps that one.
 */
export async function deriveProductKeyCheck(product: string, productKey: CryptoKey): Promise<string> {
  assertProductName(product);
  if (product === AUTHENTICATOR) return deriveKeyCheck(productKey);
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', productKey));
  try {
    const key = await crypto.subtle.importKey('raw', raw as BufferSource, 'HKDF', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: new Uint8Array(0) as BufferSource,
        info: utf8(`keyrook:v1:key-check:${product}`) as BufferSource,
      },
      key,
      256,
    );
    return toBase64(new Uint8Array(bits));
  } finally {
    wipe(raw);
  }
}
