/**
 * The join code: fifteen Crockford characters, 75 bits, that two screens show
 * when someone joins. It is the digest of both member keys, the newcomer's and
 * the confirming organiser's, so a server that swapped either one shows two
 * codes that differ: the organiser then seals nothing, and the newcomer takes
 * no box. Seventy-five bits, as a pairing code has, so the server cannot
 * search for a key of its own that gives the same code.
 *
 * A QR code carries the code alone, so scanning it is as safe as reading it
 * out, and no safer.
 */
import { transcript } from '../../crypto/ecdh.js';
import { crockfordEncode, group } from '../../util/crockford.js';
import { assertAccountId } from '../product.js';
import { ORG_MEMBER_CONFIRM } from './labels.js';
import { assertMemberPublicKey } from './member.js';

/** Fifteen characters, in three groups of five. */
const CODE_LENGTH = 15;
const ALPHABET = /^[0-9A-HJKMNP-TV-Z]{15}$/;

export interface JoinParties {
  orgId: string;
  memberId: string;
  /** The newcomer's member key, as the organiser's screen received it, or as the newcomer made it. */
  memberKey: string;
  organiserId: string;
  /** The organiser's member key, as the newcomer's screen received it, or as the organiser holds it. */
  organiserKey: string;
}

/** The code both screens show. Each computes it from the keys it holds or was given. */
export async function orgJoinCode(parties: JoinParties): Promise<string> {
  for (const id of [parties.orgId, parties.memberId, parties.organiserId]) assertAccountId(id);
  await assertMemberPublicKey(parties.memberKey);
  await assertMemberPublicKey(parties.organiserKey);
  const digest = new Uint8Array(
    await crypto.subtle.digest(
      'SHA-256',
      transcript(ORG_MEMBER_CONFIRM, parties.orgId, parties.memberId, parties.memberKey, parties.organiserId, parties.organiserKey) as BufferSource,
    ),
  );
  return group(crockfordEncode(digest.subarray(0, 10)).slice(0, CODE_LENGTH), 5);
}

/**
 * The code two people of a family compare later, when one's device finds the
 * other's key is not the one it pinned (`OrgPin`), or sent by someone it has
 * not seen: the join code over both keys, with the two put in account order,
 * so either screen makes the same one without knowing which of them is in
 * question.
 */
export async function orgCompareCode(orgId: string, one: { accountId: string; memberKey: string }, other: { accountId: string; memberKey: string }): Promise<string> {
  const [first, second] = one.accountId < other.accountId ? [one, other] : [other, one];
  return orgJoinCode({ orgId, memberId: first.accountId, memberKey: first.memberKey, organiserId: second.accountId, organiserKey: second.memberKey });
}

/**
 * A code as a person typed it, or as a QR code carried it, in the form shown:
 * upper case, the letters people mistake for digits read as those digits, in
 * three groups of five. Null when it cannot be a join code.
 */
export function readJoinCode(input: string): string | null {
  const clean = input
    .toUpperCase()
    .replace(/[\s-]/g, '')
    .replace(/[IL]/g, '1')
    .replace(/O/g, '0');
  return ALPHABET.test(clean) ? group(clean, 5) : null;
}

/** What a QR code drawn for `code` carries: the code alone. */
export function joinCodeQrPayload(code: string): string {
  const read = readJoinCode(code);
  if (!read) throw new Error('Malformed join code.');
  return read.replace(/-/g, '');
}

/** Whether what was typed or scanned is the code this screen shows. */
export function sameJoinCode(shown: string, given: string): boolean {
  const left = readJoinCode(shown);
  return left !== null && left === readJoinCode(given);
}
