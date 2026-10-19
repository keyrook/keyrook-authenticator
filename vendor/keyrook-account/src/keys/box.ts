/**
 * A product's data key, sealed to the account's root.
 *
 * Any device of the product can seal its key to the root's public half; only
 * the root's private half opens it. So a product adds its key to what the
 * password and the recovery key open without ever seeing the root's private
 * half, the recovery key, or another product's key — and a device holding
 * one product's key holds nothing that opens another's box.
 *
 * Each box is sealed with a fresh ephemeral key pair, and bound to the account
 * and the product, so the server cannot hand one product another's box, or an
 * account another account's.
 */
import { DecryptionError, importDataKey, open, seal } from '../crypto/aead.js';
import { CURVE, importPublicPoint, transcript } from '../crypto/ecdh.js';
import { toBase64, utf8, wipe } from '../util/bytes.js';
import type { AccountRoot } from './root.js';
import { assertAccountId, assertProductName } from './product.js';

const BOX_INFO = 'keyrook:v1:product-box';

export interface ProductBox {
  /** The ephemeral public point this box was sealed with, base64. */
  epk: string;
  iv: string;
  ct: string;
}

function aad(accountId: string, product: string): Uint8Array {
  assertAccountId(accountId);
  assertProductName(product);
  return utf8(`keyrook.product-box:v1:${accountId}:${product}`);
}

async function boxKey(privateKey: CryptoKey, peer: string, epk: string, root: string): Promise<CryptoKey> {
  const point = await importPublicPoint(peer);
  if (!point) throw new Error('Malformed account key.');
  const shared = await crypto.subtle.deriveBits({ name: 'ECDH', public: point }, privateKey, 256);
  const material = await crypto.subtle.importKey('raw', shared, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: transcript(epk, root) as BufferSource, info: utf8(BOX_INFO) as BufferSource },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/** Seals a product's key to the root's public half. */
export async function sealProductBox(
  productKey: CryptoKey,
  rootPublicKey: string,
  accountId: string,
  product: string,
): Promise<ProductBox> {
  const bound = aad(accountId, product);
  const ephemeral = await crypto.subtle.generateKey(CURVE, false, ['deriveBits']);
  const epk = toBase64(new Uint8Array(await crypto.subtle.exportKey('raw', ephemeral.publicKey)));
  const key = await boxKey(ephemeral.privateKey, rootPublicKey, epk, rootPublicKey);
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', productKey));
  try {
    return { epk, ...(await seal(key, raw, bound)) };
  } finally {
    wipe(raw);
  }
}

/**
 * Opens a product's box with the root's private half. A box sealed to another
 * root, for another account or another product, or tampered with in any way,
 * fails as a `DecryptionError`.
 */
export async function openProductBox(
  box: ProductBox,
  root: AccountRoot,
  accountId: string,
  product: string,
): Promise<CryptoKey> {
  const bound = aad(accountId, product);
  let key: CryptoKey;
  try {
    key = await boxKey(root.privateKey, box.epk, box.epk, root.publicKey);
  } catch {
    throw new DecryptionError('That box was not sealed to this account.');
  }
  const raw = await open(key, box, bound);
  try {
    return await importDataKey(toBase64(raw));
  } finally {
    wipe(raw);
  }
}
