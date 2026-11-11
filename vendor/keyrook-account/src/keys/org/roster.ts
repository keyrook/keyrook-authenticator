/**
 * The roster: who is in the organisation, as every device believes it. Each
 * line says whose member key is whose, who is an organiser, and whether the
 * join code was compared. Its MAC is under a key from the organisation key,
 * which the server never holds, so the server can neither add a line nor drop
 * one, nor change a key or a role, without every device refusing the list.
 *
 * A MAC, not a signature: every member holds the organisation key, so a
 * member could make a roster too. That stops the server, not someone in the
 * family, who can already read what it shares; a business will want an
 * organiser's signature, later.
 *
 * Each device also pins, under its product's key, the newest version it has
 * seen and each member's key (`OrgPin`). It refuses an older roster, and a
 * member whose key changed is reported, so the device seals nothing more to
 * them until the two compare a code again.
 */
import { openJson, sealJson, type SealedBox } from '../../crypto/aead.js';
import { importPublicPoint, transcript } from '../../crypto/ecdh.js';
import type { OrgRole, OrgRoster } from '../../sync/protocol.js';
import { concatBytes, fromBase64, toBase64, utf8, wipe } from '../../util/bytes.js';
import { assertAccountId } from '../product.js';
import type { AccountRoot } from '../root.js';
import { assertGeneration, ORG_PAGE_PIN_INFO, ORG_ROSTER_INFO, orgPinAad, rosterMacPrefix } from './labels.js';
import { assertMemberPublicKey } from './member.js';

/** A family has six; teams, later, more. A roster longer than this is not one. */
const MAX_MEMBERS = 256;

export interface RosterMember {
  accountId: string;
  role: OrgRole;
  /** The member key's public half, base64. */
  memberKey: string;
  /** Whether the join code was compared when they were confirmed. */
  verified: boolean;
  /** The organiser who confirmed them; their own id for the one who made the organisation. */
  confirmedBy: string;
  confirmedAt: number;
}

export interface RosterBody {
  members: RosterMember[];
  /** The organisation recovery key's public half, once an organiser turns recovery on. */
  recoveryKey: string | null;
}

/** What a device keeps of an organisation, sealed under its product's key. */
export interface OrgPin {
  version: number;
  generation: number;
  /** Each member's key as last accepted, by account id. */
  keys: Record<string, string>;
  /**
   * Keys this device saw end: their holder left the roster, or took another.
   * One still opens what it handed over, up to `seen`, but sends no family key
   * and no newer collection key, and no organiser's word takes it again; only
   * two screens comparing a code do. Absent when there are none.
   */
  retired?: string[];
  /**
   * By collection, the newest generation whose key this device had from
   * someone still in the family, or from someone before they went: as far as
   * a retired key's boxes are taken. Absent when there are none.
   */
  seen?: Record<string, number>;
}

/** A pinned key by account id, read as the pin's own: an id such as `__proto__` is an id, not the object's prototype. */
export const pinnedKey = (pin: OrgPin | null, accountId: string): string | undefined =>
  pin && Object.hasOwn(pin.keys, accountId) ? pin.keys[accountId] : undefined;

/** Whether this device saw `memberKey` end (`OrgPin.retired`). */
export const retiredKey = (pin: OrgPin | null, memberKey: string | undefined): boolean => memberKey !== undefined && (pin?.retired ?? []).includes(memberKey);

const seenOf = (pin: OrgPin | null, collectionId: string): number => (pin?.seen && Object.hasOwn(pin.seen, collectionId) ? pin.seen[collectionId]! : 0);

/**
 * The key to take a collection's key of `generation` as from `senderId`: the
 * one pinned, unless it is retired and the generation is one this device had
 * not seen by then. Otherwise someone gone, with the server's help, could
 * hand over a key of their own, and read all that is sealed under it.
 */
export function collectionSenderKey(pin: OrgPin | null, senderId: string, collectionId: string, generation: number): string | undefined {
  const key = pinnedKey(pin, senderId);
  return retiredKey(pin, key) && generation > seenOf(pin, collectionId) ? undefined : key;
}

/** `keys` with what a pin remembers beside them, each only when it holds anything. */
function pinWith(base: Omit<OrgPin, 'retired' | 'seen'>, retired: Set<string>, seen: Record<string, number>): OrgPin {
  return { ...base, ...(retired.size > 0 ? { retired: [...retired].sort() } : {}), ...(Object.keys(seen).length > 0 ? { seen } : {}) };
}

/** A pin's `seen` in one record with no prototype, so `__proto__` is set as an id; the newest generation of any pin stands. */
const seenIn = (...pins: (OrgPin | null)[]): Record<string, number> => {
  const seen = Object.create(null) as Record<string, number>;
  for (const pin of pins) for (const [id, generation] of Object.entries(pin?.seen ?? {})) seen[id] = Math.max(seen[id] ?? 0, generation);
  return seen;
};

/** Pins' keys in one record with no prototype, so `__proto__` is set as an id; a later pin's key stands over an earlier's. */
const keysOf = (...pins: (OrgPin | null)[]): Record<string, string> => {
  const keys = Object.create(null) as Record<string, string>;
  for (const pin of pins) for (const [accountId, key] of Object.entries(pin?.keys ?? {})) keys[accountId] = key;
  return keys;
};

/** `pin`, or an empty one, with `memberKey` pinned as `accountId`'s: after the two screens showed the same code. */
export function trustedOrgPin(pin: OrgPin | null, accountId: string, memberKey: string): OrgPin {
  const keys = keysOf(pin);
  const retired = new Set(pin?.retired);
  const kept = pinnedKey(pin, accountId);
  if (kept !== undefined && kept !== memberKey) retired.add(kept);
  retired.delete(memberKey);
  keys[accountId] = memberKey;
  return pinWith({ version: pin?.version ?? 0, generation: pin?.generation ?? 0, keys }, retired, seenIn(pin));
}

/** Two pins of one family put together, the newest version and generation of either, `over`'s key standing where they differ. */
export function mergedOrgPins(under: OrgPin, over: OrgPin): OrgPin {
  const base = { version: Math.max(under.version, over.version), generation: Math.max(under.generation, over.generation), keys: keysOf(under, over) };
  const retired = new Set([...(under.retired ?? []), ...(over.retired ?? [])]);
  // What `over` took after comparing, where `under` pinned another, stands; a pin behind `under` has not seen what ended since.
  if (over.version >= under.version) {
    for (const [accountId, key] of Object.entries(over.keys)) if (pinnedKey(under, accountId) !== key && !retiredKey(over, key)) retired.delete(key);
  }
  return pinWith(base, retired, seenIn(under, over));
}

export interface RosterCheck {
  version: number;
  generation: number;
  body: RosterBody;
  /** Members whose key differs from the one pinned, or is one this device saw end: nothing more is sealed to them until a code is compared again. */
  changed: string[];
}

async function macKey(orgKey: CryptoKey): Promise<CryptoKey> {
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', orgKey));
  try {
    const base = await crypto.subtle.importKey('raw', raw as BufferSource, 'HKDF', false, ['deriveKey']);
    return await crypto.subtle.deriveKey(
      { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0) as BufferSource, info: utf8(ORG_ROSTER_INFO) as BufferSource },
      base,
      { name: 'HMAC', hash: 'SHA-256', length: 256 },
      false,
      ['sign', 'verify'],
    );
  } finally {
    wipe(raw);
  }
}

/**
 * The bytes the MAC covers: the organisation, generation and version, then
 * each line in account order, field by field, each with its length. The order
 * a server sends the lines in changes nothing; anything else in them does.
 */
function macInput(orgId: string, generation: number, version: number, body: RosterBody): Uint8Array {
  const lines = [...body.members].sort((a, b) => (a.accountId < b.accountId ? -1 : a.accountId > b.accountId ? 1 : 0));
  return concatBytes(
    rosterMacPrefix(orgId, generation, version),
    transcript(
      String(lines.length),
      ...lines.flatMap((line) => [line.accountId, line.role, line.memberKey, line.verified ? '1' : '0', line.confirmedBy, String(line.confirmedAt)]),
      body.recoveryKey ?? '',
    ),
  );
}

/** A roster's body as a device must find it, or a throw: what the server sends is checked field by field. */
async function bodyOf(value: unknown): Promise<RosterBody> {
  const body = value as Partial<RosterBody> | null;
  if (!body || typeof body !== 'object' || !Array.isArray(body.members) || body.members.length === 0 || body.members.length > MAX_MEMBERS) {
    throw new Error('Malformed family roster.');
  }
  const seen = new Set<string>();
  const members: RosterMember[] = [];
  for (const entry of body.members as unknown[]) {
    const line = entry as Partial<RosterMember> | null;
    if (
      !line ||
      typeof line.accountId !== 'string' ||
      (line.role !== 'owner' && line.role !== 'member') ||
      typeof line.memberKey !== 'string' ||
      typeof line.verified !== 'boolean' ||
      typeof line.confirmedBy !== 'string' ||
      !Number.isSafeInteger(line.confirmedAt) ||
      (line.confirmedAt as number) < 0 ||
      seen.has(line.accountId)
    ) {
      throw new Error('Malformed family roster.');
    }
    assertAccountId(line.accountId);
    assertAccountId(line.confirmedBy);
    await assertMemberPublicKey(line.memberKey);
    seen.add(line.accountId);
    members.push({
      accountId: line.accountId,
      role: line.role,
      memberKey: line.memberKey,
      verified: line.verified,
      confirmedBy: line.confirmedBy,
      confirmedAt: line.confirmedAt as number,
    });
  }
  if (body.recoveryKey !== null && body.recoveryKey !== undefined) {
    if (typeof body.recoveryKey !== 'string') throw new Error('Malformed family roster.');
    await assertMemberPublicKey(body.recoveryKey);
  }
  return { members, recoveryKey: body.recoveryKey ?? null };
}

/** A roster at `version`, MAC'd under the organisation key of `generation`: what `PUT /orgs/:org/roster` and its siblings send. */
export async function makeRoster(orgKey: CryptoKey, orgId: string, generation: number, version: number, body: RosterBody): Promise<OrgRoster> {
  const checked = await bodyOf(body);
  const mac = await crypto.subtle.sign('HMAC', await macKey(orgKey), macInput(orgId, generation, version, checked) as BufferSource);
  return { version, generation, body: checked as unknown as OrgRoster['body'], mac: toBase64(new Uint8Array(mac)) };
}

/**
 * Checks a roster from the server with the organisation key of its
 * generation, against what this device pinned. Throws when its MAC fails, or
 * when it is older than the pin: either way the device keeps what it pinned.
 * A member whose key changed is reported in `changed`, not refused, so the
 * rest of the family carries on while those two compare a code again.
 */
export async function checkRoster(orgKey: CryptoKey, orgId: string, roster: OrgRoster, pin: OrgPin | null): Promise<RosterCheck> {
  const { version, generation, mac } = (roster ?? {}) as Partial<OrgRoster>;
  if (!Number.isSafeInteger(version) || (version as number) < 1 || typeof mac !== 'string' || mac.length > 64) {
    throw new Error('Malformed family roster.');
  }
  assertGeneration(generation as number);
  const body = await bodyOf(roster.body);
  let presented: Uint8Array;
  try {
    presented = fromBase64(mac);
  } catch {
    throw new Error('Malformed family roster.');
  }
  const authentic = await crypto.subtle.verify(
    'HMAC',
    await macKey(orgKey),
    presented as BufferSource,
    macInput(orgId, generation as number, version as number, body) as BufferSource,
  );
  if (!authentic) throw new Error('That family roster was not made by anyone in the family.');
  if (pin && ((version as number) < pin.version || (generation as number) < pin.generation)) {
    throw new Error('That family roster is older than one this device has seen.');
  }
  const changed = body.members.filter((line) => {
    const kept = pinnedKey(pin, line.accountId);
    return (kept !== undefined && kept !== line.memberKey) || retiredKey(pin, line.memberKey);
  });
  return { version: version as number, generation: generation as number, body, changed: changed.map((line) => line.accountId) };
}

/** A collection's key handed to this device: who from, and of which generation. */
export interface HandedKey {
  collectionId: string;
  generation: number;
  senderId: string;
}

/**
 * What to pin after `check`: its version and generation, and each member's
 * key, but the old key kept for anyone whose key changed and who has not
 * compared a code again (`compared`). Someone no longer listed keeps the key
 * they had: an older collection key they handed over still opens as from
 * them, and coming back with another key is a change, compared again. That
 * key, as one replaced, is retired. `handed` are the collection keys about to
 * be taken: each from someone not retired till now moves `seen` on.
 */
export function nextOrgPin(pin: OrgPin | null, check: RosterCheck, compared: string[] = [], handed: readonly HandedKey[] = []): OrgPin {
  const keys = keysOf(pin);
  const retired = new Set(pin?.retired);
  const uncompared = (accountId: string) => check.changed.includes(accountId) && !compared.includes(accountId);
  for (const line of check.body.members) {
    const kept = pinnedKey(pin, line.accountId);
    const stays = kept !== undefined && uncompared(line.accountId);
    keys[line.accountId] = stays ? kept : line.memberKey;
    if (!stays && kept !== undefined && kept !== line.memberKey) retired.add(kept);
    if (compared.includes(line.accountId)) retired.delete(line.memberKey);
  }
  const listed = new Set(check.body.members.map((line) => line.accountId));
  for (const [accountId, key] of Object.entries(keys)) if (!listed.has(accountId)) retired.add(key);
  const seen = seenIn(pin);
  for (const { collectionId, generation, senderId } of handed) {
    const key = keys[senderId];
    if (key === undefined || retiredKey(pin, key) || uncompared(senderId) || !Number.isSafeInteger(generation)) continue;
    seen[collectionId] = Math.max(seen[collectionId] ?? 0, generation);
  }
  return pinWith({ version: check.version, generation: check.generation, keys }, retired, seen);
}

/** Those `pin` had in the family that `check` no longer lists, each reported once: whoever went, or whoever the server put out. */
export function leftSince(pin: OrgPin | null, check: RosterCheck): string[] {
  if (!pin) return [];
  const listed = new Set(check.body.members.map((line) => line.accountId));
  return Object.keys(pin.keys).filter((accountId) => !listed.has(accountId) && !retiredKey(pin, pinnedKey(pin, accountId)));
}

/** Seals what this device pinned of an organisation under its product's key. */
export async function sealOrgPin(productKey: CryptoKey, pin: OrgPin, orgId: string, accountId: string, product: string): Promise<SealedBox> {
  return sealJson(productKey, pin, orgPinAad(orgId, accountId, product));
}

/** Opens a pin. One under another key, or for another organisation, account or product, fails as a `DecryptionError`. */
export async function openOrgPin(productKey: CryptoKey, box: SealedBox, orgId: string, accountId: string, product: string): Promise<OrgPin> {
  // Authentic means a device of this product wrote it, not that it is well formed.
  return orgPinFrom(await openJson<unknown>(productKey, box, orgPinAad(orgId, accountId, product)));
}

/** A pin as read back from where a device kept it, or a throw: checked field by field, as one the server sent would be. */
export async function orgPinFrom(value: unknown): Promise<OrgPin> {
  const pin = value as Partial<OrgPin> | null;
  if (!pin || typeof pin !== 'object' || !Number.isSafeInteger(pin.version) || !Number.isSafeInteger(pin.generation) || typeof pin.keys !== 'object' || pin.keys === null) {
    throw new Error('Malformed family pin.');
  }
  const keys: Record<string, string> = Object.create(null) as Record<string, string>;
  for (const [accountId, key] of Object.entries(pin.keys)) {
    assertAccountId(accountId);
    if (typeof key !== 'string') throw new Error('Malformed family pin.');
    await assertMemberPublicKey(key);
    keys[accountId] = key;
  }
  const retired = new Set<string>();
  if (pin.retired !== undefined) {
    if (!Array.isArray(pin.retired)) throw new Error('Malformed family pin.');
    for (const key of pin.retired as unknown[]) {
      if (typeof key !== 'string') throw new Error('Malformed family pin.');
      await assertMemberPublicKey(key);
      retired.add(key);
    }
  }
  const seen = Object.create(null) as Record<string, number>;
  if (pin.seen !== undefined) {
    if (typeof pin.seen !== 'object' || pin.seen === null) throw new Error('Malformed family pin.');
    for (const [collectionId, generation] of Object.entries(pin.seen)) {
      if (!Number.isSafeInteger(generation)) throw new Error('Malformed family pin.');
      seen[collectionId] = generation;
    }
  }
  return pinWith({ version: pin.version as number, generation: pin.generation as number, keys }, retired, seen);
}

/**
 * The key the account page seals its pin of a family under: ECDH of the root
 * with itself, through HKDF, as the root check is, under a label of its own.
 * Only the root's holder makes it, so a pin kept on the server is one the
 * person's own page wrote; it goes with the root (`dropRootHeldByOthers`).
 */
async function pagePinKey(root: AccountRoot): Promise<CryptoKey> {
  const point = await importPublicPoint(root.publicKey);
  if (!point) throw new Error('Malformed account key.');
  const shared = await crypto.subtle.deriveBits({ name: 'ECDH', public: point }, root.privateKey, 256);
  const material = await crypto.subtle.importKey('raw', shared, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0) as BufferSource, info: utf8(ORG_PAGE_PIN_INFO) as BufferSource },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/** The page's pin of a family, sealed under the key only the root makes, for `PUT /orgs/:org/me/page-pin`. */
export async function sealPagePin(root: AccountRoot, pin: OrgPin, orgId: string, accountId: string): Promise<SealedBox> {
  return sealOrgPin(await pagePinKey(root), pin, orgId, accountId, 'console');
}

/** Opens the page's pin. One sealed under another root, or for another family or account, fails as a `DecryptionError`. */
export async function openPagePin(root: AccountRoot, box: SealedBox, orgId: string, accountId: string): Promise<OrgPin> {
  return openOrgPin(await pagePinKey(root), box, orgId, accountId, 'console');
}
