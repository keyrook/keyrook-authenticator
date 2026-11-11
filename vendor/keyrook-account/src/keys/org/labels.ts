/**
 * Every label of an organisation's keys, and what each binds. Nothing else in
 * the package spells one.
 *
 * Frozen before anything was stored under them anywhere but a test: fixtures
 * made once open what they sealed. As every other label, they never change; a
 * new format is a new label beside them.
 *
 * Ids go in as an account's do (`assertAccountId`): no colon, so each string
 * reads one way. Generations and versions are positive integers, revisions
 * not negative.
 */
import { utf8 } from '../../util/bytes.js';
import { assertAccountId, assertProductName } from '../product.js';

/** HKDF info: a member key's private half sealed to its owner's root. */
export const MEMBER_ROOT_BOX_INFO = 'keyrook:v1:member-root-box';
/** HKDF info: the organisation key in a box from one member to another. */
export const ORG_KEY_BOX_INFO = 'keyrook:v1:org-key-box';
/** HKDF info: a collection's key in a box from one member to another. */
export const COLLECTION_BOX_INFO = 'keyrook:v1:collection-box';
/** The first field of the transcript the join code is the digest of. */
export const ORG_MEMBER_CONFIRM = 'keyrook:v1:org-member-confirm';
/** HKDF info: the roster's MAC key, from the organisation key. */
export const ORG_ROSTER_INFO = 'keyrook:v1:org-roster';
/** HKDF info: a root handed to an emergency contact. */
export const EMERGENCY_BOX_INFO = 'keyrook:v1:emergency-box';
/** HKDF info: the organisation recovery key's private half handed to an organiser. */
export const ORG_RECOVERY_KEY_INFO = 'keyrook:v1:org-recovery-key';
/** HKDF info: a member's root sealed to the organisation recovery key. */
export const ORG_RECOVERY_BOX_INFO = 'keyrook:v1:org-recovery-box';
/** The first field of the transcript the code of a recovery's handover is the digest of. */
export const ORG_RECOVERY_CODE = 'keyrook:v1:org-recovery-code';
/** HKDF info: a member's root handed by an organiser to the member's new browser. */
export const ORG_RECOVERY_HANDOVER_INFO = 'keyrook:v1:org-recovery-handover';
/** HKDF info: the key the account page seals its pin of a family under, from the root alone. */
export const ORG_PAGE_PIN_INFO = 'keyrook:v1:org-page-pin';
/**
 * HKDF info: the key of an organiser's word to one member that a key is
 * someone's (`vouch.ts`). Added later, and frozen the same way, with
 * `orgVouchPrefix`.
 */
export const ORG_VOUCH_INFO = 'keyrook:v1:org-vouch';

/** What a member key is sealed under: its owner's root, or a product's key. */
export type MemberKeyUnder = 'root' | string;

export function assertGeneration(generation: number): void {
  if (!Number.isSafeInteger(generation) || generation < 1) throw new Error('Malformed key generation.');
}

function assertRevision(rev: number): void {
  if (!Number.isSafeInteger(rev) || rev < 0) throw new Error('Malformed record revision.');
}

const ids = (...values: string[]) => {
  for (const value of values) assertAccountId(value);
};

/** AAD of a member key's private half, under the root or under one product's key. */
export function memberKeyAad(orgId: string, accountId: string, under: MemberKeyUnder): Uint8Array {
  ids(orgId, accountId);
  // A product named `root` would read as the root's box: no product may be.
  if (under !== 'root') assertProductName(under);
  return utf8(`keyrook.member-key:v1:${orgId}:${accountId}:${under}`);
}

/** AAD of the organisation key of one generation, from one member to another. */
export function orgKeyBoxAad(orgId: string, generation: number, senderId: string, recipientId: string): Uint8Array {
  ids(orgId, senderId, recipientId);
  assertGeneration(generation);
  return utf8(`keyrook.org-key-box:v1:${orgId}:${generation}:${senderId}:${recipientId}`);
}

/** AAD of a collection's key of one generation, from one member to another. */
export function collectionBoxAad(orgId: string, collectionId: string, generation: number, senderId: string, recipientId: string): Uint8Array {
  ids(orgId, collectionId, senderId, recipientId);
  assertGeneration(generation);
  return utf8(`keyrook.collection-box:v1:${orgId}:${collectionId}:${generation}:${senderId}:${recipientId}`);
}

/** What the roster's MAC covers before its fields. */
export function rosterMacPrefix(orgId: string, generation: number, version: number): Uint8Array {
  ids(orgId);
  assertGeneration(generation);
  if (!Number.isSafeInteger(version) || version < 1) throw new Error('Malformed roster version.');
  return utf8(`keyrook.org-roster:v1:${orgId}:${generation}:${version}`);
}

/** AAD of what a device pins of an organisation, under its product's key. */
export function orgPinAad(orgId: string, accountId: string, product: string): Uint8Array {
  ids(orgId, accountId);
  assertProductName(product);
  return utf8(`keyrook.org-pin:v1:${orgId}:${accountId}:${product}`);
}

/** AAD of a record, so it opens only in its collection, under its generation, at its revision. */
export function orgRecordAad(orgId: string, collectionId: string, generation: number, id: string, rev: number): Uint8Array {
  ids(orgId, collectionId, id);
  assertGeneration(generation);
  assertRevision(rev);
  return utf8(`keyrook.org-record:v1:${orgId}:${collectionId}:${generation}:${id}:${rev}`);
}

/**
 * AAD of a record's deletion: its own label, so a deletion never opens as the
 * record, nor the record as its deletion, and a server can neither mark a
 * record deleted nor bring a deleted one back.
 */
export function orgTombstoneAad(orgId: string, collectionId: string, generation: number, id: string, rev: number): Uint8Array {
  ids(orgId, collectionId, id);
  assertGeneration(generation);
  assertRevision(rev);
  return utf8(`keyrook.org-tombstone:v1:${orgId}:${collectionId}:${generation}:${id}:${rev}`);
}

/** AAD of a collection's name. */
export function collectionNameAad(orgId: string, collectionId: string, generation: number): Uint8Array {
  ids(orgId, collectionId);
  assertGeneration(generation);
  return utf8(`keyrook.collection-name:v1:${orgId}:${collectionId}:${generation}`);
}

/**
 * AAD of who holds a collection's key of one generation, under that key. Added
 * later, and frozen the same way.
 */
export function collectionHoldersAad(orgId: string, collectionId: string, generation: number): Uint8Array {
  ids(orgId, collectionId);
  assertGeneration(generation);
  return utf8(`keyrook.collection-holders:v1:${orgId}:${collectionId}:${generation}`);
}

/** AAD of a root handed from one member to their emergency contact. */
export function emergencyAad(orgId: string, grantorId: string, granteeId: string): Uint8Array {
  ids(orgId, grantorId, granteeId);
  return utf8(`keyrook.emergency:v1:${orgId}:${grantorId}:${granteeId}`);
}

/** AAD of the organisation recovery key's private half, from one organiser to another. */
export function orgRecoveryKeyAad(orgId: string, generation: number, senderId: string, recipientId: string): Uint8Array {
  ids(orgId, senderId, recipientId);
  assertGeneration(generation);
  return utf8(`keyrook.org-recovery-key:v1:${orgId}:${generation}:${senderId}:${recipientId}`);
}

/** AAD of a member's root sealed to the organisation recovery key. */
export function orgRecoveryAad(orgId: string, accountId: string): Uint8Array {
  ids(orgId, accountId);
  return utf8(`keyrook.org-recovery:v1:${orgId}:${accountId}`);
}

/** What an organiser's word covers before the key it is for: whose key, from which organiser, to whom. */
export function orgVouchPrefix(orgId: string, memberId: string, organiserId: string, recipientId: string): Uint8Array {
  ids(orgId, memberId, organiserId, recipientId);
  return utf8(`keyrook.org-vouch:v1:${orgId}:${memberId}:${organiserId}:${recipientId}`);
}

/** AAD of a member's root handed by one organiser to the new browser of one request. */
export function orgRecoveryHandoverAad(orgId: string, memberId: string, organiserId: string, requestId: string): Uint8Array {
  ids(orgId, memberId, organiserId, requestId);
  return utf8(`keyrook.org-recovery-handover:v1:${orgId}:${memberId}:${organiserId}:${requestId}`);
}
