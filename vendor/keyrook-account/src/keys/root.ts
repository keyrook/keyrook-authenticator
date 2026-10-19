/**
 * The account's root key: what lets one password and one printed recovery
 * key open every product's data, while no product holds another's key.
 *
 * The root is an ECDH P-256 key pair. Its public half sits on the server, and
 * each product seals its own data key to it (`box.ts`). Its private half is
 * stored only wrapped: once under a key derived from the account password,
 * once under the recovery key. It is in a device's memory only while a person
 * has just typed one of those two, and is dropped as soon as the product has
 * opened its own box.
 *
 * A product never trusts the public half because the server sent it. It
 * accepts one it derived itself, from a private half it just opened with the
 * password or the recovery key; one its own pin vouches for (`pin.ts`); or one
 * a person confirmed by comparing two screens (`rootConfirmCode`).
 */
import { DecryptionError, open, seal, type SealedBox } from '../crypto/aead.js';
import { CURVE, importPublicPoint, publicPointOf, transcript } from '../crypto/ecdh.js';
import type { AccountKeys } from '../sync/account.js';
import { isWellFormedRecoveryKey, normaliseRecoveryKey } from '../sync/kit.js';
import { toBase64, utf8, wipe } from '../util/bytes.js';
import { crockfordDecode, crockfordEncode, group } from '../util/crockford.js';
import { assertAccountId } from './product.js';

const RECOVERY_INFO = 'keyrook:v1:root-recovery';
const CHECK_INFO = 'keyrook:v1:root-check';
const CONFIRM_INFO = 'keyrook:v1:root-confirm';
const wrapAad = (accountId: string, under: 'password' | 'recovery') => {
  assertAccountId(accountId);
  return utf8(`keyrook.root:v1:${accountId}:${under}`);
};

export interface AccountRoot {
  /** Extractable, so it can be wrapped again under a new password or recovery key. Never stored as it is. */
  privateKey: CryptoKey;
  /** The raw public point, base64: what the server holds and every product seals to. */
  publicKey: string;
}

/** A new root, for a new account or for one replacing its root. */
export async function newAccountRoot(): Promise<AccountRoot> {
  const pair = await crypto.subtle.generateKey(CURVE, true, ['deriveBits']);
  return { privateKey: pair.privateKey, publicKey: await publicPointOf(pair.privateKey) };
}

/** Checks a root's public half from the server is a point on the curve. */
export async function assertRootPublicKey(publicKey: string): Promise<void> {
  if (!(await importPublicPoint(publicKey))) throw new Error('Malformed account key.');
}

async function sealRoot(root: AccountRoot, key: CryptoKey, aad: Uint8Array): Promise<SealedBox> {
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', root.privateKey));
  try {
    return await seal(key, pkcs8, aad);
  } finally {
    wipe(pkcs8);
  }
}

async function openRoot(box: SealedBox, key: CryptoKey, aad: Uint8Array): Promise<AccountRoot> {
  const pkcs8 = await open(key, box, aad);
  try {
    const privateKey = await crypto.subtle.importKey('pkcs8', pkcs8 as BufferSource, CURVE, true, ['deriveBits']);
    // The public half comes from the private key just opened, not from the
    // server: a box that opens under the password is the account's.
    return { privateKey, publicKey: await publicPointOf(privateKey) };
  } catch (error) {
    if (error instanceof DecryptionError) throw error;
    throw new DecryptionError('That is not an account key.');
  } finally {
    wipe(pkcs8);
  }
}

/** The root, wrapped under the account password, for the server to hold. */
export function wrapRootUnderPassword(root: AccountRoot, keys: AccountKeys, accountId: string): Promise<SealedBox> {
  return sealRoot(root, keys.rootWrapKey, wrapAad(accountId, 'password'));
}

/** Opens the root with the account password. A wrong password fails as a `DecryptionError`. */
export function openRootWithPassword(box: SealedBox, keys: AccountKeys, accountId: string): Promise<AccountRoot> {
  return openRoot(box, keys.rootWrapKey, wrapAad(accountId, 'password'));
}

/**
 * The key a recovery key wraps the root under. The recovery key is 160 random
 * bits, so HKDF is all the stretching it needs.
 */
async function recoveryWrapKey(recoveryKey: string): Promise<CryptoKey> {
  if (!isWellFormedRecoveryKey(recoveryKey)) throw new Error('That does not look like a recovery key.');
  const bytes = crockfordDecode(normaliseRecoveryKey(recoveryKey));
  try {
    const material = await crypto.subtle.importKey('raw', bytes as BufferSource, 'HKDF', false, ['deriveKey']);
    return await crypto.subtle.deriveKey(
      { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0) as BufferSource, info: utf8(RECOVERY_INFO) as BufferSource },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
  } finally {
    wipe(bytes);
  }
}

/** The root, wrapped under the printed recovery key, for the server to hold. */
export async function wrapRootUnderRecoveryKey(root: AccountRoot, recoveryKey: string, accountId: string): Promise<SealedBox> {
  return sealRoot(root, await recoveryWrapKey(recoveryKey), wrapAad(accountId, 'recovery'));
}

/** Opens the root with the printed recovery key, however it was typed. */
export async function openRootWithRecoveryKey(box: SealedBox, recoveryKey: string, accountId: string): Promise<AccountRoot> {
  return openRoot(box, await recoveryWrapKey(recoveryKey), wrapAad(accountId, 'recovery'));
}

/**
 * Proof of holding the root's private half, for the server to check before a
 * change only its holder should make: resetting the password with the
 * recovery key, issuing a new one. ECDH of the root with itself, through HKDF:
 * only the private half computes it, and the server, which keeps it hashed,
 * learns nothing it could open anything with.
 */
export async function deriveRootCheck(root: AccountRoot): Promise<string> {
  const point = await importPublicPoint(root.publicKey);
  if (!point) throw new Error('Malformed account key.');
  const shared = await crypto.subtle.deriveBits({ name: 'ECDH', public: point }, root.privateKey, 256);
  const material = await crypto.subtle.importKey('raw', shared, 'HKDF', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0) as BufferSource, info: utf8(CHECK_INFO) as BufferSource },
    material,
    256,
  );
  return toBase64(new Uint8Array(bits));
}

export type RootConfirmPurpose = 'join' | 'rotate';

/**
 * The code two screens show when one device vouches for the root to another:
 * a product joining an account with no password, or accepting a new root.
 * Bound to the account, the public key and the purpose, so it never matches a
 * pairing code or a code shown for another account. Fifteen characters, for
 * the same reason as a pairing code: the server sees what it is computed over.
 */
export async function rootConfirmCode(accountId: string, publicKey: string, purpose: RootConfirmPurpose): Promise<string> {
  assertAccountId(accountId);
  await assertRootPublicKey(publicKey);
  const digest = new Uint8Array(
    await crypto.subtle.digest('SHA-256', transcript(CONFIRM_INFO, purpose, accountId, publicKey) as BufferSource),
  );
  return group(crockfordEncode(digest.subarray(0, 10)).slice(0, 15), 5);
}

