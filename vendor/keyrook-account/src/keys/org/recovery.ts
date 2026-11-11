/**
 * An organiser recovering a member: the organisation recovery key `K`, an ECDH
 * P-256 pair an organiser's device makes when the family turns recovery on.
 * Its public half is in the roster, under the family key's MAC; its private
 * half goes to each organiser in an authenticated box from one who holds it,
 * as the family key does.
 *
 * A member who turns recovery on seals their own root to `K`, in an
 * authenticated box from their own member key. Anyone can seal to a public
 * key, the server included; this box opens only as from the member the
 * pinned roster names, so an organiser's device never hands on a root the
 * server made up.
 *
 * Recovering hands the root to the member's new browser, which has nothing of
 * the account and no member key: it makes a key for this one request, and the
 * server carries its public half to the organiser, and the organiser's member
 * key back, so it could swap either. So both screens show a code over both
 * keys, the request and who is in it, as pairing does, and the organiser,
 * who knows the member, compares it with them before anything is opened.
 * The root then goes in an authenticated box from the organiser's member key
 * to the browser's, which opens it only as from the key the code was compared
 * over.
 */
import { DecryptionError } from '../../crypto/aead.js';
import { CURVE, publicPointOf, transcript } from '../../crypto/ecdh.js';
import { wipe } from '../../util/bytes.js';
import { crockfordEncode, group } from '../../util/crockford.js';
import { assertAccountId } from '../product.js';
import type { AccountRoot } from '../root.js';
import { openAuthBox, sealAuthBox, type AuthBox, type KeyBoxRecipient, type KeyBoxSender } from './authbox.js';
import {
  ORG_RECOVERY_BOX_INFO,
  ORG_RECOVERY_CODE,
  ORG_RECOVERY_HANDOVER_INFO,
  ORG_RECOVERY_KEY_INFO,
  orgRecoveryAad,
  orgRecoveryHandoverAad,
  orgRecoveryKeyAad,
} from './labels.js';
import { assertMemberPublicKey, type MemberKey } from './member.js';

export interface OrgRecoveryKey {
  /** Extractable, so an organiser holding it seals it again for another. Never stored as it is. */
  privateKey: CryptoKey;
  /** The raw public point, base64: what the roster lists and members seal their roots to. */
  publicKey: string;
}

/** A new recovery key, for one generation, made by an organiser's device. */
export async function newOrgRecoveryKey(): Promise<OrgRecoveryKey> {
  const pair = await crypto.subtle.generateKey(CURVE, true, ['deriveBits']);
  return { privateKey: pair.privateKey, publicKey: await publicPointOf(pair.privateKey) };
}

async function sealPrivateHalf(key: { privateKey: CryptoKey }, sender: MemberKey, recipientKey: string, info: string, aad: Uint8Array): Promise<AuthBox> {
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', key.privateKey));
  try {
    return await sealAuthBox(sender, recipientKey, pkcs8, info, aad);
  } finally {
    wipe(pkcs8);
  }
}

async function openPrivateHalf(
  recipient: MemberKey | OrgRecoveryKey | HandoverKey,
  senderKey: string,
  box: AuthBox,
  info: string,
  aad: Uint8Array,
  notOne: () => DecryptionError,
): Promise<{ privateKey: CryptoKey; publicKey: string }> {
  const pkcs8 = await openAuthBox(recipient, senderKey, box, info, aad);
  try {
    const privateKey = await crypto.subtle.importKey('pkcs8', pkcs8 as BufferSource, CURVE, true, ['deriveBits']);
    // The public half comes from what opened, never from the server.
    return { privateKey, publicKey: await publicPointOf(privateKey) };
  } catch {
    throw notOne();
  } finally {
    wipe(pkcs8);
  }
}

/** The recovery key of `generation`, sealed from one organiser's member key to another's. */
export async function sealOrgRecoveryKey(recoveryKey: OrgRecoveryKey, from: KeyBoxSender, orgId: string, generation: number): Promise<AuthBox> {
  return sealPrivateHalf(
    recoveryKey,
    from.sender,
    from.recipientKey,
    ORG_RECOVERY_KEY_INFO,
    orgRecoveryKeyAad(orgId, generation, from.senderId, from.recipientId),
  );
}

/**
 * Opens the recovery key of `generation` with an organiser's member key, as
 * sent by `to.senderId` with the key the pinned roster lists for them. It is
 * kept only if its public half is the one that roster lists (`listed`): a
 * member who sent another, though the box is theirs, gives no key the
 * family's members sealed anything to.
 */
export async function openOrgRecoveryKey(box: AuthBox, to: KeyBoxRecipient, orgId: string, generation: number, listed: string): Promise<OrgRecoveryKey> {
  const opened = await openPrivateHalf(
    to.recipient,
    to.senderKey,
    box,
    ORG_RECOVERY_KEY_INFO,
    orgRecoveryKeyAad(orgId, generation, to.senderId, to.recipientId),
    () => new DecryptionError('That box does not hold a recovery key.'),
  );
  if (opened.publicKey !== listed) throw new DecryptionError('That is not the recovery key the family’s roster lists.');
  return opened;
}

/** A member's root sealed to the recovery key, from their own member key. */
export async function sealOrgRecoveryBox(
  root: AccountRoot,
  from: { member: MemberKey; accountId: string; recoveryKey: string },
  orgId: string,
): Promise<AuthBox> {
  return sealPrivateHalf(root, from.member, from.recoveryKey, ORG_RECOVERY_BOX_INFO, orgRecoveryAad(orgId, from.accountId));
}

/**
 * Opens a member's root with the recovery key, as from the member key the
 * pinned roster lists for `accountId`. One sealed by anyone else, for another
 * member or family, to another recovery key, or tampered with, fails as a
 * `DecryptionError`.
 */
export async function openOrgRecoveryBox(
  box: AuthBox,
  to: { recoveryKey: OrgRecoveryKey; accountId: string; memberKey: string },
  orgId: string,
): Promise<AccountRoot> {
  return openPrivateHalf(
    to.recoveryKey,
    to.memberKey,
    box,
    ORG_RECOVERY_BOX_INFO,
    orgRecoveryAad(orgId, to.accountId),
    () => new DecryptionError('That box does not hold an account key.'),
  );
}

/** The new browser's key for one request: made there, held in memory until the root arrives, never stored. */
export interface HandoverKey {
  privateKey: CryptoKey;
  /** The raw public point, base64: what the server carries to the organisers. */
  publicKey: string;
}

export async function newHandoverKey(): Promise<HandoverKey> {
  const pair = await crypto.subtle.generateKey(CURVE, true, ['deriveBits']);
  return { privateKey: pair.privateKey, publicKey: await publicPointOf(pair.privateKey) };
}

/** Who a handover is between, and the keys each screen holds or was given. */
export interface HandoverParties {
  orgId: string;
  memberId: string;
  requestId: string;
  organiserId: string;
  /** The organiser's member key: as they hold it, or as the member's screen received it. */
  organiserKey: string;
  /** The new browser's key: as it made it, or as the organiser's screen received it. */
  browserKey: string;
}

/**
 * The code both screens show, fifteen Crockford characters as the join code
 * is, so the server cannot search for a key of its own that gives the same.
 */
export async function orgRecoveryCode(parties: HandoverParties): Promise<string> {
  for (const id of [parties.orgId, parties.memberId, parties.requestId, parties.organiserId]) assertAccountId(id);
  await assertMemberPublicKey(parties.organiserKey);
  await assertMemberPublicKey(parties.browserKey);
  const digest = new Uint8Array(
    await crypto.subtle.digest(
      'SHA-256',
      transcript(
        ORG_RECOVERY_CODE,
        parties.orgId,
        parties.memberId,
        parties.requestId,
        parties.organiserId,
        parties.organiserKey,
        parties.browserKey,
      ) as BufferSource,
    ),
  );
  return group(crockfordEncode(digest.subarray(0, 10)).slice(0, 15), 5);
}

/** The member's root, from the organiser's member key to the new browser's key of the request. */
export async function sealRecoveryHandover(root: AccountRoot, organiser: MemberKey, parties: Omit<HandoverParties, 'organiserKey'>): Promise<AuthBox> {
  return sealPrivateHalf(
    root,
    organiser,
    parties.browserKey,
    ORG_RECOVERY_HANDOVER_INFO,
    orgRecoveryHandoverAad(parties.orgId, parties.memberId, parties.organiserId, parties.requestId),
  );
}

/**
 * Opens the root handed to this browser, as from the organiser's member key
 * the codes were compared over. One from anyone else, for another request,
 * member or family, or tampered with, fails as a `DecryptionError`. That it
 * opens says who sent it, not that it is the account's root: the caller
 * proves that to the server before anything is sealed under it.
 */
export async function openRecoveryHandover(box: AuthBox, browser: HandoverKey, parties: Omit<HandoverParties, 'browserKey'>): Promise<AccountRoot> {
  return openPrivateHalf(
    browser,
    parties.organiserKey,
    box,
    ORG_RECOVERY_HANDOVER_INFO,
    orgRecoveryHandoverAad(parties.orgId, parties.memberId, parties.organiserId, parties.requestId),
    () => new DecryptionError('That box does not hold an account key.'),
  );
}
