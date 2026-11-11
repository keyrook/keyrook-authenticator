/**
 * A member key: one ECDH P-256 pair per person per organisation, made by
 * their own browser or device when they accept.
 *
 * It stands between the account's keys and the organisation's. Every box that
 * hands someone the organisation key or a collection's key is sealed to its
 * public half, and only someone holding a member key can make such a box
 * (`authbox.ts`). Its private half is sealed twice over: to its owner's root,
 * which opens it after the password or a passkey, and under each product's
 * key, so that product's devices, which never hold the root, open it every
 * day without asking.
 */
import { DecryptionError, open, seal, type SealedBox } from '../../crypto/aead.js';
import { CURVE, importPublicPoint, publicPointOf, transcript } from '../../crypto/ecdh.js';
import { toBase64, utf8, wipe } from '../../util/bytes.js';
import type { AccountRoot } from '../root.js';
import { MEMBER_ROOT_BOX_INFO, memberKeyAad } from './labels.js';

export interface MemberKey {
  /** Extractable, so it can be sealed again under another product's key. Never stored as it is. */
  privateKey: CryptoKey;
  /** The raw public point, base64: what the roster lists and every box is sealed to. */
  publicKey: string;
}

/** A member key's private half sealed to the owner's root: an ephemeral key, as a product's box is. */
export interface MemberRootBox {
  epk: string;
  iv: string;
  ct: string;
}

/** A new member key, made by the device of the person accepting. */
export async function newMemberKey(): Promise<MemberKey> {
  const pair = await crypto.subtle.generateKey(CURVE, true, ['deriveBits']);
  return { privateKey: pair.privateKey, publicKey: await publicPointOf(pair.privateKey) };
}

/** Checks a member key's public half, from a roster or from the server, is a point on the curve. */
export async function assertMemberPublicKey(publicKey: string): Promise<void> {
  if (!(await importPublicPoint(publicKey))) throw new Error('Malformed member key.');
}

async function rootBoxKey(privateKey: CryptoKey, peer: string, epk: string, root: string): Promise<CryptoKey> {
  const point = await importPublicPoint(peer);
  if (!point) throw new Error('Malformed account key.');
  const shared = await crypto.subtle.deriveBits({ name: 'ECDH', public: point }, privateKey, 256);
  const material = await crypto.subtle.importKey('raw', shared, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: transcript(epk, root) as BufferSource, info: utf8(MEMBER_ROOT_BOX_INFO) as BufferSource },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function sealPrivateHalf(member: MemberKey, key: CryptoKey, aad: Uint8Array): Promise<SealedBox> {
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', member.privateKey));
  try {
    return await seal(key, pkcs8, aad);
  } finally {
    wipe(pkcs8);
  }
}

async function openPrivateHalf(box: SealedBox, key: CryptoKey, aad: Uint8Array): Promise<MemberKey> {
  const pkcs8 = await open(key, box, aad);
  try {
    const privateKey = await crypto.subtle.importKey('pkcs8', pkcs8 as BufferSource, CURVE, true, ['deriveBits']);
    // The public half comes from what opened, never from a roster or the server.
    return { privateKey, publicKey: await publicPointOf(privateKey) };
  } catch (error) {
    if (error instanceof DecryptionError) throw error;
    throw new DecryptionError('That is not a member key.');
  } finally {
    wipe(pkcs8);
  }
}

/**
 * Seals a member key's private half to the owner's root. Only the public half
 * of the root is needed, so the device accepting asks for no password: it
 * seals to the root its product pinned.
 */
export async function sealMemberKeyToRoot(member: MemberKey, rootPublicKey: string, orgId: string, accountId: string): Promise<MemberRootBox> {
  const aad = memberKeyAad(orgId, accountId, 'root');
  const ephemeral = await crypto.subtle.generateKey(CURVE, false, ['deriveBits']);
  const epk = toBase64(new Uint8Array(await crypto.subtle.exportKey('raw', ephemeral.publicKey)));
  const key = await rootBoxKey(ephemeral.privateKey, rootPublicKey, epk, rootPublicKey);
  return { epk, ...(await sealPrivateHalf(member, key, aad)) };
}

/** Opens a member key with the owner's root. One for another root, organisation or account fails as a `DecryptionError`. */
export async function openMemberKeyWithRoot(box: MemberRootBox, root: AccountRoot, orgId: string, accountId: string): Promise<MemberKey> {
  const aad = memberKeyAad(orgId, accountId, 'root');
  let key: CryptoKey;
  try {
    key = await rootBoxKey(root.privateKey, box.epk, box.epk, root.publicKey);
  } catch {
    throw new DecryptionError('That member key was not sealed to this account.');
  }
  return openPrivateHalf(box, key, aad);
}

/** A product's binding: `root` is the root's, and no product may take it. */
function underProduct(orgId: string, accountId: string, product: string): Uint8Array {
  if (product === 'root') throw new Error('Not a Keyrook product name.');
  return memberKeyAad(orgId, accountId, product);
}

/** Seals a member key's private half under a product's key, for that product's devices. */
export async function sealMemberKeyUnderProduct(member: MemberKey, productKey: CryptoKey, orgId: string, accountId: string, product: string): Promise<SealedBox> {
  return sealPrivateHalf(member, productKey, underProduct(orgId, accountId, product));
}

/** Opens a member key with a product's key. One for another product, organisation or account fails as a `DecryptionError`. */
export async function openMemberKeyWithProduct(box: SealedBox, productKey: CryptoKey, orgId: string, accountId: string, product: string): Promise<MemberKey> {
  return openPrivateHalf(box, productKey, underProduct(orgId, accountId, product));
}
