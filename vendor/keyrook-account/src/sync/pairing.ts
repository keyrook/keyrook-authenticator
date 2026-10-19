/**
 * Joining a browser to an account by approval from one already in it — how a
 * provider account, which has no password, gets its key to a new device.
 *
 * Both browsers make an ephemeral ECDH P-256 key pair. The server carries the
 * public halves between them, and so could swap either for its own: swap the
 * requester's and it receives the key; swap the approver's and it hands the
 * new browser a key of its choosing, then reads everything added there. So
 * both browsers show a code computed over *both* public keys, and the person
 * approving checks the two screens agree. The code is 75 bits because the
 * server sees both keys before the codes are shown and could search for a
 * pair that collides with a short one; six digits would take it a second.
 *
 * The key then travels wrapped under a key only the two browsers can derive,
 * and the wrap is bound to this pairing and these two keys, so it cannot be
 * replayed into another.
 *
 * Two versions. The first, under `authx` labels, moves the account's one data
 * key and stays for Keyrook Authenticator 0.3. The second binds the code and
 * the wrap to the product and the account as well: each browser names its own
 * product from a constant in its own code, so a server that routes a
 * Passhold browser's request to an Authenticator browser gets two different
 * codes on the two screens, and a wrap that opens for neither.
 */
import { DecryptionError, type SealedBox } from '../crypto/aead.js';
import { CURVE, importPublicPoint, transcript } from '../crypto/ecdh.js';
import { fromBase64, toBase64, utf8 } from '../util/bytes.js';
import { crockfordEncode, group } from '../util/crockford.js';
import { randomBytes } from '../util/id.js';
import { assertAccountId, assertProductName } from '../keys/product.js';

const V1 = { code: 'authx:v1:pairing-code', wrap: 'authx:v1:pairing-wrap', aad: 'authx.pairing:v1' };
const V2 = { code: 'keyrook:v1:pairing-code', wrap: 'keyrook:v1:pairing-wrap', aad: 'keyrook.pairing:v1' };
/** Fifteen Crockford characters — 75 bits — in three groups of five. */
export const PAIRING_CODE_LENGTH = 15;

export interface PairingKeys {
  privateKey: CryptoKey;
  /** The raw public point, base64: what goes to the server. */
  publicKey: string;
}

/**
 * A fresh key pair for one pairing. The private half is extractable only so
 * the requesting browser can keep it in session storage while it waits — a
 * service worker can be stopped at any moment during the minutes a person
 * takes to approve — and it never leaves memory.
 */
export async function newPairingKeys(): Promise<PairingKeys> {
  const pair = await crypto.subtle.generateKey(CURVE, true, ['deriveBits']);
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey));
  return { privateKey: pair.privateKey, publicKey: toBase64(raw) };
}

export async function exportPairingKeys(keys: PairingKeys): Promise<{ privateKey: JsonWebKey; publicKey: string }> {
  return { privateKey: await crypto.subtle.exportKey('jwk', keys.privateKey), publicKey: keys.publicKey };
}

export async function importPairingKeys(stored: { privateKey: JsonWebKey; publicKey: string }): Promise<PairingKeys> {
  const privateKey = await crypto.subtle.importKey('jwk', stored.privateKey, CURVE, true, ['deriveBits']);
  return { privateKey, publicKey: stored.publicKey };
}

async function importPublic(publicKey: string): Promise<CryptoKey> {
  const key = await importPublicPoint(publicKey);
  if (!key) throw new Error('Malformed pairing key.');
  return key;
}

/**
 * What a code and a wrap are bound to. Version 1 binds the pairing and the two
 * keys; version 2 puts the product and the account before them.
 */
interface Binding {
  labels: typeof V1;
  scope: string[];
  pairingId: string;
  requesterKey: string;
  approverKey: string;
}

function bound(binding: Binding, label: string): Uint8Array {
  if (binding.requesterKey === binding.approverKey) throw new Error('A pairing needs two different keys.');
  return transcript(label, ...binding.scope, binding.pairingId, binding.requesterKey, binding.approverKey);
}

function v2(product: string, accountId: string): string[] {
  assertProductName(product);
  assertAccountId(accountId);
  return [product, accountId];
}

async function code(binding: Binding): Promise<string> {
  await importPublic(binding.requesterKey);
  await importPublic(binding.approverKey);
  const digest = new Uint8Array(
    await crypto.subtle.digest('SHA-256', bound(binding, binding.labels.code) as BufferSource),
  );
  return group(crockfordEncode(digest.subarray(0, 10)).slice(0, PAIRING_CODE_LENGTH), 5);
}

/** The AES key only the two browsers in this pairing can derive. */
async function wrappingKey(own: PairingKeys, peerKey: string, binding: Binding): Promise<CryptoKey> {
  const shared = await crypto.subtle.deriveBits({ name: 'ECDH', public: await importPublic(peerKey) }, own.privateKey, 256);
  const material = await crypto.subtle.importKey('raw', shared, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: bound(binding, binding.labels.wrap) as BufferSource,
      info: utf8(binding.labels.wrap) as BufferSource,
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['wrapKey', 'unwrapKey'],
  );
}

const wrapParams = (iv: Uint8Array, binding: Binding): AesGcmParams => ({
  name: 'AES-GCM',
  iv: iv as BufferSource,
  tagLength: 128,
  additionalData: bound(binding, binding.labels.aad) as BufferSource,
});

async function wrap(key: CryptoKey, approver: PairingKeys, binding: Binding): Promise<SealedBox> {
  const wrapping = await wrappingKey(approver, binding.requesterKey, binding);
  const iv = randomBytes(12);
  const wrapped = await crypto.subtle.wrapKey('raw', key, wrapping, wrapParams(iv, binding));
  return { iv: toBase64(iv), ct: toBase64(new Uint8Array(wrapped)) };
}

async function unwrap(requester: PairingKeys, binding: Binding, box: SealedBox): Promise<CryptoKey> {
  const wrapping = await wrappingKey(requester, binding.approverKey, binding);
  try {
    return await crypto.subtle.unwrapKey(
      'raw',
      fromBase64(box.ct) as BufferSource,
      wrapping,
      wrapParams(fromBase64(box.iv), binding),
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt'],
    );
  } catch {
    throw new DecryptionError('That approval did not come from the browser whose code you checked.');
  }
}

/**
 * The code both browsers show, as ABCDE-FGHIJ-KLMNO. Equal codes mean both
 * browsers hold the same two public keys — that nothing in between swapped one.
 */
export function pairingCode(pairingId: string, requesterKey: string, approverKey: string): Promise<string> {
  return code({ labels: V1, scope: [], pairingId, requesterKey, approverKey });
}

/** The approving browser: the account's data key, wrapped for the requester's key. */
export function wrapDataKeyForPairing(
  dataKey: CryptoKey,
  approver: PairingKeys,
  pairingId: string,
  requesterKey: string,
): Promise<SealedBox> {
  return wrap(dataKey, approver, { labels: V1, scope: [], pairingId, requesterKey, approverKey: approver.publicKey });
}

/**
 * The requesting browser: the data key, from a wrap made for its key by the
 * holder of `approverKey`. Anything else — another pairing's wrap, a different
 * approver key, a tampered box — fails as a `DecryptionError`.
 *
 * Opening proves the wrap came from whoever holds the approver key the codes
 * were compared over; it does not prove the key is the account's. The caller
 * checks that against something only the account's key opens before adopting
 * it.
 */
export function unwrapPairedDataKey(
  requester: PairingKeys,
  pairingId: string,
  approverKey: string,
  box: SealedBox,
): Promise<CryptoKey> {
  return unwrap(requester, { labels: V1, scope: [], pairingId, requesterKey: requester.publicKey, approverKey }, box);
}

/**
 * The code both browsers of one product show. `product` is the caller's own
 * constant, never a name the server reported.
 */
export function productPairingCode(
  product: string,
  accountId: string,
  pairingId: string,
  requesterKey: string,
  approverKey: string,
): Promise<string> {
  return code({ labels: V2, scope: v2(product, accountId), pairingId, requesterKey, approverKey });
}

/** The approving browser: its product's key, wrapped for the requester's key. */
export function wrapProductKeyForPairing(
  product: string,
  accountId: string,
  productKey: CryptoKey,
  approver: PairingKeys,
  pairingId: string,
  requesterKey: string,
): Promise<SealedBox> {
  return wrap(productKey, approver, {
    labels: V2,
    scope: v2(product, accountId),
    pairingId,
    requesterKey,
    approverKey: approver.publicKey,
  });
}

/**
 * The requesting browser: its product's key, from a wrap the approving
 * browser made for it. A wrap made by another product, for another account or
 * another pairing fails as a `DecryptionError`. As with version 1, the caller
 * checks the key against its product's key check before adopting it.
 */
export function unwrapPairedProductKey(
  product: string,
  accountId: string,
  requester: PairingKeys,
  pairingId: string,
  approverKey: string,
  box: SealedBox,
): Promise<CryptoKey> {
  return unwrap(
    requester,
    { labels: V2, scope: v2(product, accountId), pairingId, requesterKey: requester.publicKey, approverKey },
    box,
  );
}
