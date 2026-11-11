/**
 * Emergency access: someone's root, sealed by their own device to the member
 * key of the family member they chose, in an authenticated box from their own
 * member key. The server keeps it and the wait, and hands it over once the
 * wait is over and nobody refused; but it opens for the chosen contact alone,
 * and only as from the one who chose them, whose key the contact takes from
 * the pinned roster. A server that handed it over early could give it to
 * nobody else.
 */
import { DecryptionError } from '../../crypto/aead.js';
import { CURVE, publicPointOf } from '../../crypto/ecdh.js';
import { wipe } from '../../util/bytes.js';
import type { AccountRoot } from '../root.js';
import { openAuthBox, sealAuthBox, type AuthBox, type KeyBoxRecipient, type KeyBoxSender } from './authbox.js';
import { EMERGENCY_BOX_INFO, emergencyAad } from './labels.js';

/** The grantor's root, sealed from their member key to their contact's. */
export async function sealEmergencyBox(root: AccountRoot, from: KeyBoxSender, orgId: string): Promise<AuthBox> {
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', root.privateKey));
  try {
    return await sealAuthBox(from.sender, from.recipientKey, pkcs8, EMERGENCY_BOX_INFO, emergencyAad(orgId, from.senderId, from.recipientId));
  } finally {
    wipe(pkcs8);
  }
}

/**
 * Opens a grantor's root with the contact's member key, as from the grantor's
 * key in the pinned roster. One for anyone else, from anyone else, for
 * another family, or tampered with, fails as a `DecryptionError`. The public
 * half comes from what opened, never from the server.
 */
export async function openEmergencyBox(box: AuthBox, to: KeyBoxRecipient, orgId: string): Promise<AccountRoot> {
  const pkcs8 = await openAuthBox(to.recipient, to.senderKey, box, EMERGENCY_BOX_INFO, emergencyAad(orgId, to.senderId, to.recipientId));
  try {
    const privateKey = await crypto.subtle.importKey('pkcs8', pkcs8 as BufferSource, CURVE, true, ['deriveBits']);
    return { privateKey, publicKey: await publicPointOf(privateKey) };
  } catch {
    throw new DecryptionError('That box does not hold an account key.');
  } finally {
    wipe(pkcs8);
  }
}
