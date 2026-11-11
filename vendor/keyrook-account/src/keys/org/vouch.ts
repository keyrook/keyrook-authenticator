/**
 * An organiser's word that a key is someone's: once the join code matched, the
 * organiser's device tells each member of the family, itself included, which
 * key it compared, so their devices take that key without comparing a code of
 * their own.
 *
 * The roster's MAC will not do for this: every member holds the family key
 * and could make one. So each word is a MAC under a key from ECDH of the
 * organiser's member key and the one member's it is for. Only those two can
 * make it, and the member's device made none, so it is the organiser's; the
 * server, holding neither private half, can drop one but never make one. It
 * is taken only from an organiser the device pinned, with the key it pinned.
 *
 * A word has no date, and a server keeps what it was sent. So one is never
 * taken for a key this device saw end (`OrgPin.retired`), or from one: else a
 * word from when someone joined would bring back the key they left with.
 */
import { importPublicPoint, transcript } from '../../crypto/ecdh.js';
import { concatBytes, fromBase64, toBase64, utf8 } from '../../util/bytes.js';
import { ORG_VOUCH_INFO, orgVouchPrefix } from './labels.js';
import { assertMemberPublicKey, type MemberKey } from './member.js';
import { pinnedKey, retiredKey, type OrgPin } from './roster.js';

/** Whose key, compared by which organiser, told to whom. Ids as an account's are. */
export interface VouchFields {
  orgId: string;
  memberId: string;
  /** The key the organiser compared: the one the roster lists for them. */
  memberKey: string;
  organiserId: string;
  recipientId: string;
}

/** An organiser's word as the server keeps it for the one it is for: whose key, from whom, and the tag. */
export interface OrgVouch {
  accountId: string;
  by: string;
  tag: string;
}

async function vouchKey(own: MemberKey, peerKey: string, organiserKey: string, recipientKey: string): Promise<CryptoKey> {
  const point = await importPublicPoint(peerKey);
  if (!point) throw new Error('Malformed member key.');
  const shared = await crypto.subtle.deriveBits({ name: 'ECDH', public: point }, own.privateKey, 256);
  const material = await crypto.subtle.importKey('raw', shared, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: transcript(organiserKey, recipientKey) as BufferSource, info: utf8(ORG_VOUCH_INFO) as BufferSource },
    material,
    { name: 'HMAC', hash: 'SHA-256', length: 256 },
    false,
    ['sign', 'verify'],
  );
}

async function macInput(fields: VouchFields): Promise<Uint8Array> {
  if (fields.memberId === fields.organiserId || fields.memberId === fields.recipientId) throw new Error('Nobody vouches for their own key.');
  await assertMemberPublicKey(fields.memberKey);
  return concatBytes(orgVouchPrefix(fields.orgId, fields.memberId, fields.organiserId, fields.recipientId), transcript(fields.memberKey));
}

/** The organiser's word to the holder of `recipientKey`, made with the organiser's own member key. */
export async function vouchFor(organiser: MemberKey, recipientKey: string, fields: VouchFields): Promise<string> {
  const key = await vouchKey(organiser, recipientKey, organiser.publicKey, recipientKey);
  return toBase64(new Uint8Array(await crypto.subtle.sign('HMAC', key, (await macInput(fields)) as BufferSource)));
}

/** Whether `tag` is the word of the holder of `organiserKey` to `recipient`, for exactly these fields. */
export async function checkVouch(recipient: MemberKey, organiserKey: string, fields: VouchFields, tag: string): Promise<boolean> {
  let presented: Uint8Array;
  try {
    if (typeof tag !== 'string' || tag.length > 64) return false;
    presented = fromBase64(tag);
  } catch {
    return false;
  }
  const key = await vouchKey(recipient, organiserKey, organiserKey, recipient.publicKey);
  return crypto.subtle.verify('HMAC', key, presented as BufferSource, (await macInput(fields)) as BufferSource);
}

/** A roster's line as far as a word needs it: what the server sent, before or after the MAC is checked. */
interface Line {
  accountId: string;
  role?: string;
  memberKey: string;
}

/**
 * Those of `subjects` whose key, as `members` lists it, an organiser vouched
 * for to this device's person: an organiser `members` lists as one, with the
 * key this device pinned for them, or the person themselves, whose own key
 * opened their box. An organiser whose key changed, or who is not one now,
 * vouches for nobody; nor does anyone for their own key, nor for a key this
 * device saw end.
 */
export async function vouchedFor(input: {
  orgId: string;
  me: MemberKey;
  meId: string;
  pin: OrgPin | null;
  members: readonly Line[];
  vouches: readonly OrgVouch[] | undefined;
  subjects: readonly string[];
}): Promise<string[]> {
  const lineOf = (accountId: string) => input.members.find((line) => line.accountId === accountId);
  const vouched: string[] = [];
  for (const subject of new Set(input.subjects)) {
    const line = lineOf(subject);
    if (!line || typeof line.memberKey !== 'string' || retiredKey(input.pin, line.memberKey)) continue;
    for (const vouch of input.vouches ?? []) {
      // One for the person's own key fails `macInput` below, as a malformed one does.
      if (!vouch || vouch.accountId !== subject || typeof vouch.by !== 'string') continue;
      const organiser = lineOf(vouch.by);
      if (organiser?.role !== 'owner') continue;
      const organiserKey = vouch.by === input.meId ? input.me.publicKey : pinnedKey(input.pin, vouch.by);
      if (organiserKey === undefined || organiserKey !== organiser.memberKey || retiredKey(input.pin, organiserKey)) continue;
      const fields = { orgId: input.orgId, memberId: subject, memberKey: line.memberKey, organiserId: vouch.by, recipientId: input.meId };
      let good = false;
      try {
        good = await checkVouch(input.me, organiserKey, fields, vouch.tag);
      } catch {
        // A malformed id or key in what the server sent vouches for nobody.
      }
      if (good) {
        vouched.push(subject);
        break;
      }
    }
  }
  return vouched;
}
