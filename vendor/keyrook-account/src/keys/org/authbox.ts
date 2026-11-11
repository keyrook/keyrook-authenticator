/**
 * The authenticated box: how one member hands another the organisation key,
 * a collection's key, and later a root.
 *
 * A product's box (`../box.ts`) can be made by anyone, since it is sealed to a
 * public key with no secret. For an organisation that is not enough: a server
 * could make up an organisation key, seal it to a newcomer, and read all they
 * write under it. So this box takes two ECDH: one with a fresh ephemeral key,
 * one with the sender's member key, as HPKE's Auth mode does. It opens only
 * with the sender's public half, which the recipient takes from the roster it
 * pinned and never from the server; and the server, holding no member's
 * private half, cannot make one.
 */
import { DecryptionError, importDataKey, open, seal } from '../../crypto/aead.js';
import { CURVE, importPublicPoint, transcript } from '../../crypto/ecdh.js';
import { concatBytes, toBase64, utf8, wipe } from '../../util/bytes.js';
import { ORG_KEY_BOX_INFO, orgKeyBoxAad } from './labels.js';
import type { MemberKey } from './member.js';

export interface AuthBox {
  /** The ephemeral public point, base64. */
  epk: string;
  iv: string;
  ct: string;
}

async function point(publicKey: string): Promise<CryptoKey> {
  const imported = await importPublicPoint(publicKey);
  if (!imported) throw new DecryptionError('That box is not from a member key.');
  return imported;
}

/** The box key: both shared secrets, through HKDF over everything the box binds of who sent it to whom. */
async function authKey(
  ephemeralShared: ArrayBuffer,
  staticShared: ArrayBuffer,
  epk: string,
  recipientKey: string,
  senderKey: string,
  info: string,
): Promise<CryptoKey> {
  const ikm = concatBytes(new Uint8Array(ephemeralShared), new Uint8Array(staticShared));
  try {
    const material = await crypto.subtle.importKey('raw', ikm as BufferSource, 'HKDF', false, ['deriveKey']);
    return await crypto.subtle.deriveKey(
      { name: 'HKDF', hash: 'SHA-256', salt: transcript(epk, recipientKey, senderKey) as BufferSource, info: utf8(info) as BufferSource },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
  } finally {
    wipe(ikm);
  }
}

/** Seals `plaintext` from `sender` to the holder of `recipientKey`, under `info` and bound to `aad`. */
export async function sealAuthBox(sender: MemberKey, recipientKey: string, plaintext: Uint8Array, info: string, aad: Uint8Array): Promise<AuthBox> {
  const recipient = await importPublicPoint(recipientKey);
  if (!recipient) throw new Error('Malformed member key.');
  const ephemeral = await crypto.subtle.generateKey(CURVE, false, ['deriveBits']);
  const epk = toBase64(new Uint8Array(await crypto.subtle.exportKey('raw', ephemeral.publicKey)));
  const key = await authKey(
    await crypto.subtle.deriveBits({ name: 'ECDH', public: recipient }, ephemeral.privateKey, 256),
    await crypto.subtle.deriveBits({ name: 'ECDH', public: recipient }, sender.privateKey, 256),
    epk,
    recipientKey,
    sender.publicKey,
    info,
  );
  return { epk, ...(await seal(key, plaintext, aad)) };
}

/**
 * Opens a box with the recipient's member key, as from `senderKey`: the
 * sender's public half from the pinned roster. A box made by anyone else, for
 * anyone else, under another `info` or `aad`, or tampered with, fails as a
 * `DecryptionError`.
 */
export async function openAuthBox(recipient: MemberKey, senderKey: string, box: AuthBox, info: string, aad: Uint8Array): Promise<Uint8Array> {
  const key = await authKey(
    await crypto.subtle.deriveBits({ name: 'ECDH', public: await point(box.epk) }, recipient.privateKey, 256),
    await crypto.subtle.deriveBits({ name: 'ECDH', public: await point(senderKey) }, recipient.privateKey, 256),
    box.epk,
    recipient.publicKey,
    senderKey,
    info,
  );
  return open(key, box, aad);
}

/** Who a key box goes from and to: account ids, with the members' keys. */
export interface KeyBoxSender {
  sender: MemberKey;
  senderId: string;
  recipientKey: string;
  recipientId: string;
}
export interface KeyBoxRecipient {
  recipient: MemberKey;
  recipientId: string;
  /** From the pinned roster, never from the server. */
  senderKey: string;
  senderId: string;
}

/** Seals an AES key's raw bytes in an authenticated box. */
export async function sealKeyInAuthBox(key: CryptoKey, from: KeyBoxSender, info: string, aad: Uint8Array): Promise<AuthBox> {
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', key));
  try {
    return await sealAuthBox(from.sender, from.recipientKey, raw, info, aad);
  } finally {
    wipe(raw);
  }
}

/** Opens an AES key from an authenticated box: extractable, as the one who holds it seals it again for others. */
export async function openKeyFromAuthBox(box: AuthBox, to: KeyBoxRecipient, info: string, aad: Uint8Array): Promise<CryptoKey> {
  const raw = await openAuthBox(to.recipient, to.senderKey, box, info, aad);
  try {
    if (raw.length !== 32) throw new DecryptionError('That box does not hold a key.');
    return await importDataKey(toBase64(raw));
  } finally {
    wipe(raw);
  }
}

/** A new organisation key: AES-256, made by an organiser's device, for one generation. */
export async function newOrgKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

/** The organisation key of `generation`, sealed from one member to another. */
export async function sealOrgKey(orgKey: CryptoKey, from: KeyBoxSender, orgId: string, generation: number): Promise<AuthBox> {
  return sealKeyInAuthBox(orgKey, from, ORG_KEY_BOX_INFO, orgKeyBoxAad(orgId, generation, from.senderId, from.recipientId));
}

/** Opens the organisation key of `generation`, as sent by `to.senderId` with the key the pinned roster lists for them. */
export async function openOrgKey(box: AuthBox, to: KeyBoxRecipient, orgId: string, generation: number): Promise<CryptoKey> {
  return openKeyFromAuthBox(box, to, ORG_KEY_BOX_INFO, orgKeyBoxAad(orgId, generation, to.senderId, to.recipientId));
}
