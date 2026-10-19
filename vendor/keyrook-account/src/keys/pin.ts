/**
 * What a product remembers about the account's root, sealed under its own key.
 *
 * The server holds it, but cannot write one: it is sealed under the product's
 * key and bound to the account and the product. A device that holds the
 * product's key therefore knows, without trusting the server, which root its
 * product sealed itself to, and when it last saw the recovery key open that
 * root itself. A root that does not match the pin is a root change: accepted
 * only when a person acts on this product's own screen (`root.ts`).
 */
import { openJson, sealJson, type SealedBox } from '../crypto/aead.js';
import { utf8 } from '../util/bytes.js';
import { assertAccountId, assertProductName } from './product.js';
import { assertRootPublicKey } from './root.js';

export interface RootPin {
  /** The root's public half this product sealed its key to, base64. */
  root: string;
  /**
   * When the recovery key last opened this root on this product's own screen:
   * issued here, or typed here. Null until then. Whether the recovery key
   * protects this product is decided from this, never from what the server
   * says about the recovery key.
   */
  sheetVerifiedAt: number | null;
}

function aad(accountId: string, product: string): Uint8Array {
  assertAccountId(accountId);
  assertProductName(product);
  return utf8(`keyrook.root-pin:v1:${accountId}:${product}`);
}

export function sealRootPin(productKey: CryptoKey, pin: RootPin, accountId: string, product: string): Promise<SealedBox> {
  return sealJson(productKey, { root: pin.root, sheetVerifiedAt: pin.sheetVerifiedAt }, aad(accountId, product));
}

/** Opens a pin. One sealed under another key, or for another account or product, fails as a `DecryptionError`. */
export async function openRootPin(
  productKey: CryptoKey,
  box: SealedBox,
  accountId: string,
  product: string,
): Promise<RootPin> {
  const pin = await openJson<RootPin>(productKey, box, aad(accountId, product));
  // Authentic means a device of this product wrote it, not that it is well
  // formed; a buggy build is still a possibility.
  if (typeof pin?.root !== 'string' || !(pin.sheetVerifiedAt === null || Number.isFinite(pin.sheetVerifiedAt))) {
    throw new Error('Malformed root pin.');
  }
  await assertRootPublicKey(pin.root);
  return { root: pin.root, sheetVerifiedAt: pin.sheetVerifiedAt };
}
