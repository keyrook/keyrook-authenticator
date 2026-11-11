import { describe, expect, it } from 'vitest';
import {
  DecryptionError,
  generateDataKey,
  joinCodeQrPayload,
  makeRoster,
  newAccountRoot,
  newCollectionKey,
  newMemberKey,
  newOrgKey,
  mergedOrgPins,
  nextOrgPin,
  pinnedKey,
  trustedOrgPin,
  orgCompareCode,
  openCollectionKey,
  openCollectionName,
  openMemberKeyWithProduct,
  openMemberKeyWithRoot,
  openOrgKey,
  openOrgPin,
  openOrgRecord,
  openOrgTombstone,
  orgJoinCode,
  readJoinCode,
  sameJoinCode,
  sealCollectionKey,
  sealCollectionName,
  sealMemberKeyToRoot,
  sealMemberKeyUnderProduct,
  sealOrgKey,
  sealOrgPin,
  sealOrgRecord,
  sealOrgTombstone,
  checkRoster,
  exportDataKey,
  openEmergencyBox,
  sealEmergencyBox,
  newOrgRecoveryKey,
  openOrgRecoveryBox,
  openOrgRecoveryKey,
  sealOrgRecoveryBox,
  sealOrgRecoveryKey,
  newHandoverKey,
  openRecoveryHandover,
  orgRecoveryCode,
  sealRecoveryHandover,
  orgTombstoneAad,
  sealJson,
  sealPagePin,
  openPagePin,
  orgPinFrom,
  type MemberKey,
  type OrgPin,
  type OrgRoster,
  type RosterBody,
  type RosterMember,
} from '../src/index.js';

/**
 * The family's keys (docs/family.md, F5), each tried against a hostile
 * server, as the key design's checklist asks: it swaps the newcomer's member
 * key or the organiser's; seals a family key of its own to a newcomer; serves
 * a roster older than the one pinned; adds or drops a roster line; changes a
 * confirmed member's key; moves a record to another collection, generation or
 * revision; hands one family's box to another, or one member's to another.
 * Each attempt has to fail on the device, where it is checked. Then the
 * roots handed to another person: the emergency box, and the organisation
 * recovery key with the roots sealed to it.
 */
const ORG = 'fam-1';
const MINH = 'acc-minh';
const LAN = 'acc-lan';
const HOA = 'acc-hoa';

const exported = async (key: CryptoKey) => exportDataKey(key);
const refused = (promise: Promise<unknown>) =>
  promise.then(
    () => 'opened',
    (error: Error) => (error instanceof DecryptionError ? 'refused' : `threw: ${error.message}`),
  );

const line = (accountId: string, key: MemberKey, role: 'owner' | 'member' = 'member', verified = true): RosterMember => ({
  accountId,
  role,
  memberKey: key.publicKey,
  verified,
  confirmedBy: MINH,
  confirmedAt: 1_700_000_000_000,
});

/** Minh, the organiser, Lan and Hoa, each with a member key, the family key, and the roster of all three at version 3. */
async function family() {
  const minh = await newMemberKey();
  const lan = await newMemberKey();
  const hoa = await newMemberKey();
  const orgKey = await newOrgKey();
  const body: RosterBody = { members: [line(MINH, minh, 'owner'), line(LAN, lan), line(HOA, hoa)], recoveryKey: null };
  const roster = await makeRoster(orgKey, ORG, 1, 3, body);
  return { minh, lan, hoa, orgKey, body, roster };
}

describe('a member key', () => {
  it('opens with the owner’s root, or the product’s key it was sealed under, and nothing else', async () => {
    const root = await newAccountRoot();
    const otherRoot = await newAccountRoot();
    const passhold = await generateDataKey();
    const authenticator = await generateDataKey();
    const member = await newMemberKey();

    const toRoot = await sealMemberKeyToRoot(member, root.publicKey, ORG, LAN);
    expect((await openMemberKeyWithRoot(toRoot, root, ORG, LAN)).publicKey).toBe(member.publicKey);
    expect(await refused(openMemberKeyWithRoot(toRoot, otherRoot, ORG, LAN))).toBe('refused');
    expect(await refused(openMemberKeyWithRoot(toRoot, root, 'fam-2', LAN))).toBe('refused');
    expect(await refused(openMemberKeyWithRoot(toRoot, root, ORG, HOA))).toBe('refused');

    const underPasshold = await sealMemberKeyUnderProduct(member, passhold, ORG, LAN, 'passhold');
    expect((await openMemberKeyWithProduct(underPasshold, passhold, ORG, LAN, 'passhold')).publicKey).toBe(member.publicKey);
    expect(await refused(openMemberKeyWithProduct(underPasshold, authenticator, ORG, LAN, 'passhold'))).toBe('refused');
    expect(await refused(openMemberKeyWithProduct(underPasshold, passhold, ORG, LAN, 'authenticator'))).toBe('refused');
    // No product may be called `root`, or its box would be bound as the root's.
    await expect(sealMemberKeyUnderProduct(member, passhold, ORG, LAN, 'root')).rejects.toThrow('Not a Keyrook product name.');
    await expect(openMemberKeyWithProduct(underPasshold, passhold, ORG, LAN, 'root')).rejects.toThrow('Not a Keyrook product name.');
  });
});

describe('the join code', () => {
  it('is the same on both screens when nobody swapped a key, and differs when the server swapped either one', async () => {
    const { minh, lan } = await family();
    const swapped = await newMemberKey();
    const parties = { orgId: ORG, memberId: LAN, memberKey: lan.publicKey, organiserId: MINH, organiserKey: minh.publicKey };
    const shown = await orgJoinCode(parties);
    expect(shown).toMatch(/^[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}$/);
    expect(await orgJoinCode({ ...parties })).toBe(shown);
    // The server gave the organiser its own key for Lan, or Lan its own key for Minh.
    expect(await orgJoinCode({ ...parties, memberKey: swapped.publicKey })).not.toBe(shown);
    expect(await orgJoinCode({ ...parties, organiserKey: swapped.publicKey })).not.toBe(shown);
    // Nor does it match for another family, or other people.
    expect(await orgJoinCode({ ...parties, orgId: 'fam-2' })).not.toBe(shown);
    expect(await orgJoinCode({ ...parties, memberId: HOA })).not.toBe(shown);
  });

  it('reads as people type it, and a QR code carries the code alone', async () => {
    const { minh, lan } = await family();
    const shown = await orgJoinCode({ orgId: ORG, memberId: LAN, memberKey: lan.publicKey, organiserId: MINH, organiserKey: minh.publicKey });
    const typed = shown.toLowerCase().replace(/-/g, ' ').replace(/1/g, 'l').replace(/0/g, 'o');
    expect(sameJoinCode(shown, typed)).toBe(true);
    expect(joinCodeQrPayload(shown)).toBe(shown.replace(/-/g, ''));
    expect(sameJoinCode(shown, joinCodeQrPayload(shown))).toBe(true);
    expect(sameJoinCode(shown, shown.slice(0, -1) + (shown.endsWith('A') ? 'B' : 'A'))).toBe(false);
    expect(readJoinCode('too short')).toBeNull();
    expect(readJoinCode(`${shown}X`)).toBeNull();
  });
});

describe('the family key, in a box from a member', () => {
  it('opens only for its recipient, as from the sender the pinned roster names', async () => {
    const { minh, lan, hoa, orgKey } = await family();
    const box = await sealOrgKey(orgKey, { sender: minh, senderId: MINH, recipientKey: lan.publicKey, recipientId: LAN }, ORG, 1);
    const opened = await openOrgKey(box, { recipient: lan, recipientId: LAN, senderKey: minh.publicKey, senderId: MINH }, ORG, 1);
    expect(await exported(opened)).toBe(await exported(orgKey));

    // Handed to Hoa instead of Lan, or for another family or generation.
    expect(await refused(openOrgKey(box, { recipient: hoa, recipientId: HOA, senderKey: minh.publicKey, senderId: MINH }, ORG, 1))).toBe('refused');
    expect(await refused(openOrgKey(box, { recipient: hoa, recipientId: LAN, senderKey: minh.publicKey, senderId: MINH }, ORG, 1))).toBe('refused');
    expect(await refused(openOrgKey(box, { recipient: lan, recipientId: LAN, senderKey: minh.publicKey, senderId: MINH }, 'fam-2', 1))).toBe('refused');
    expect(await refused(openOrgKey(box, { recipient: lan, recipientId: LAN, senderKey: minh.publicKey, senderId: MINH }, ORG, 2))).toBe('refused');
    // Said to be from Hoa, whose key the roster lists for Hoa.
    expect(await refused(openOrgKey(box, { recipient: lan, recipientId: LAN, senderKey: hoa.publicKey, senderId: HOA }, ORG, 1))).toBe('refused');
  });

  it('never opens when the server made it, whatever key of its own it used', async () => {
    const { minh, lan } = await family();
    const servers = await newMemberKey();
    const madeUp = await newOrgKey();
    // Sealed by the server's own key, under Minh's name: it holds no private half of Minh's.
    const box = await sealOrgKey(madeUp, { sender: servers, senderId: MINH, recipientKey: lan.publicKey, recipientId: LAN }, ORG, 1);
    expect(await refused(openOrgKey(box, { recipient: lan, recipientId: LAN, senderKey: minh.publicKey, senderId: MINH }, ORG, 1))).toBe('refused');
    // The server swapped Minh's key in what Lan was given at the join: the codes differ, so Lan pins nothing of it.
    const code = (organiserKey: string) => orgJoinCode({ orgId: ORG, memberId: LAN, memberKey: lan.publicKey, organiserId: MINH, organiserKey });
    expect(await code(servers.publicKey)).not.toBe(await code(minh.publicKey));
  });
});

describe('the roster', () => {
  it('checks under the family key, and pins its version and every member’s key', async () => {
    const { orgKey, roster, minh, lan, hoa } = await family();
    const check = await checkRoster(orgKey, ORG, roster, null);
    expect(check).toMatchObject({ version: 3, generation: 1, changed: [] });
    expect(nextOrgPin(null, check)).toEqual({ version: 3, generation: 1, keys: { [MINH]: minh.publicKey, [LAN]: lan.publicKey, [HOA]: hoa.publicKey } });
  });

  it('is refused when the server adds a line, drops one, changes a key or a role, or reorders nothing but the lines', async () => {
    const { orgKey, roster, body } = await family();
    const stranger = await newMemberKey();
    const tampered = (next: Partial<RosterBody>): OrgRoster => ({ ...roster, body: { ...body, ...next } as unknown as OrgRoster['body'] });
    const said = 'threw: That family roster was not made by anyone in the family.';
    const check = (value: OrgRoster) => refused(checkRoster(orgKey, ORG, value, null));
    expect(await check(tampered({ members: [...body.members, line('acc-server', stranger)] }))).toBe(said);
    expect(await check(tampered({ members: body.members.slice(0, 2) }))).toBe(said);
    expect(await check(tampered({ members: body.members.map((entry) => (entry.accountId === LAN ? { ...entry, memberKey: stranger.publicKey } : entry)) }))).toBe(said);
    expect(await check(tampered({ members: body.members.map((entry) => (entry.accountId === LAN ? { ...entry, role: 'owner' as const } : entry)) }))).toBe(said);
    expect(await check(tampered({ members: body.members.map((entry) => ({ ...entry, verified: true })).map((entry, index) => (index === 2 ? { ...entry, verified: false } : entry)) }))).toBe(said);
    // Minh's line sorts last: each of its fields is covered too, who confirmed and when as much as the key.
    expect(await check(tampered({ members: body.members.map((entry) => (entry.accountId === MINH ? { ...entry, confirmedBy: LAN } : entry)) }))).toBe(said);
    expect(await check(tampered({ members: body.members.map((entry) => (entry.accountId === MINH ? { ...entry, confirmedAt: entry.confirmedAt + 1 } : entry)) }))).toBe(said);
    expect(await check(tampered({ members: body.members.map((entry) => (entry.accountId === MINH ? { ...entry, role: 'member' as const } : entry)) }))).toBe(said);
    expect(await check(tampered({ recoveryKey: stranger.publicKey }))).toBe(said);
    expect(await check({ ...roster, version: 4 })).toBe(said);
    expect(await check({ ...roster, generation: 2 })).toBe(said);
    // The order a server sends the lines in changes nothing.
    expect(await check(tampered({ members: [...body.members].reverse() }))).toBe('opened');
    // Nor does another family's key make it.
    expect(await refused(checkRoster(await newOrgKey(), ORG, roster, null))).toBe(said);
    expect(await refused(checkRoster(orgKey, 'fam-2', roster, null))).toBe(said);
  });

  it('is refused when older than the one pinned, and the pin is kept', async () => {
    const { orgKey, body, roster } = await family();
    const pin = nextOrgPin(null, await checkRoster(orgKey, ORG, await makeRoster(orgKey, ORG, 1, 5, body), null));
    expect(await refused(checkRoster(orgKey, ORG, roster, pin))).toBe('threw: That family roster is older than one this device has seen.');
    const rotatedKey = await newOrgKey();
    const newer = await makeRoster(rotatedKey, ORG, 2, 6, body);
    const pinNewer = nextOrgPin(pin, await checkRoster(rotatedKey, ORG, newer, pin));
    // A roster of the old generation, even at a higher version, is behind the pin.
    expect(await refused(checkRoster(orgKey, ORG, await makeRoster(orgKey, ORG, 1, 7, body), pinNewer))).toBe(
      'threw: That family roster is older than one this device has seen.',
    );
  });

  it('reports a confirmed member whose key changed, and keeps the old key pinned until they compare a code again', async () => {
    const { orgKey, body, roster, lan } = await family();
    const pin: OrgPin = nextOrgPin(null, await checkRoster(orgKey, ORG, roster, null));
    // Someone holding the family key, not the server, made it: the MAC holds.
    const replaced = await newMemberKey();
    const next = await makeRoster(orgKey, ORG, 1, 4, {
      ...body,
      members: body.members.map((entry) => (entry.accountId === LAN ? { ...entry, memberKey: replaced.publicKey } : entry)),
    });
    const check = await checkRoster(orgKey, ORG, next, pin);
    expect(check.changed).toEqual([LAN]);
    expect(nextOrgPin(pin, check).keys[LAN]).toBe(lan.publicKey);
    expect(nextOrgPin(pin, check, [LAN]).keys[LAN]).toBe(replaced.publicKey);
  });

  it('keeps the key of someone no longer listed, so coming back with another key is a change', async () => {
    const { orgKey, body, roster, hoa } = await family();
    const pin = nextOrgPin(null, await checkRoster(orgKey, ORG, roster, null));
    const others = body.members.filter((entry) => entry.accountId !== HOA);
    const left = nextOrgPin(pin, await checkRoster(orgKey, ORG, await makeRoster(orgKey, ORG, 1, 4, { ...body, members: others }), pin));
    expect(left.keys[HOA]).toBe(hoa.publicKey);
    const again = await makeRoster(orgKey, ORG, 1, 5, { ...body, members: [...others, line(HOA, await newMemberKey())] });
    expect((await checkRoster(orgKey, ORG, again, left)).changed).toEqual([HOA]);
  });

  it('is compared again by a code either side makes alike, and that changes with either key', async () => {
    const { minh, lan } = await family();
    const one = { accountId: MINH, memberKey: minh.publicKey };
    const other = { accountId: LAN, memberKey: lan.publicKey };
    const code = await orgCompareCode(ORG, one, other);
    expect(await orgCompareCode(ORG, other, one)).toBe(code);
    expect(await orgCompareCode(ORG, one, { ...other, memberKey: (await newMemberKey()).publicKey })).not.toBe(code);
    expect(await orgCompareCode(ORG, { ...one, memberKey: (await newMemberKey()).publicKey }, other)).not.toBe(code);
    expect(await orgCompareCode('fam-2', one, other)).not.toBe(code);
  });

  it('reads an id that names the prototype as an id', async () => {
    const orgKey = await newOrgKey();
    const odd = await newMemberKey();
    const minh = await newMemberKey();
    const roster = await makeRoster(orgKey, ORG, 1, 1, { members: [line(MINH, minh, 'owner'), line('__proto__', odd)], recoveryKey: null });
    const pin = nextOrgPin(null, await checkRoster(orgKey, ORG, roster, null));
    expect(Object.getPrototypeOf(pin.keys)).toBeNull();
    expect(pin.keys['__proto__']).toBe(odd.publicKey);
    expect((await checkRoster(orgKey, ORG, roster, pin)).changed).toEqual([]);
  });

  it('is trusted and put together with `__proto__` an id like any other, the later pin standing, the pins it came from left as they were', async () => {
    const odd = await newMemberKey();
    const other = await newMemberKey();
    const minh = await newMemberKey();
    const under = trustedOrgPin({ ...trustedOrgPin(null, '__proto__', odd.publicKey), version: 3 }, MINH, minh.publicKey);
    const over = { ...trustedOrgPin(null, '__proto__', other.publicKey), generation: 2 };
    const merged = mergedOrgPins(under, over);
    for (const pin of [under, over, merged]) expect(Object.getPrototypeOf(pin.keys)).toBeNull();
    expect(merged).toMatchObject({ version: 3, generation: 2 });
    expect([pinnedKey(merged, '__proto__'), pinnedKey(merged, MINH)]).toEqual([other.publicKey, minh.publicKey]);
    expect([pinnedKey(under, '__proto__'), pinnedKey(over, MINH)]).toEqual([odd.publicKey, undefined]);
    // A pin made by hand, its keys an ordinary object, has no key for an id its prototype answers to.
    expect(['__proto__', 'toString'].map((id) => pinnedKey({ version: 1, generation: 1, keys: {} }, id))).toEqual([undefined, undefined]);
  });

  it('is pinned under the product’s key, for its organisation, account and product only', async () => {
    const { orgKey, roster } = await family();
    const passhold = await generateDataKey();
    const pin = nextOrgPin(null, await checkRoster(orgKey, ORG, roster, null));
    const sealed = await sealOrgPin(passhold, pin, ORG, LAN, 'passhold');
    expect(await openOrgPin(passhold, sealed, ORG, LAN, 'passhold')).toEqual(pin);
    expect(await refused(openOrgPin(await generateDataKey(), sealed, ORG, LAN, 'passhold'))).toBe('refused');
    expect(await refused(openOrgPin(passhold, sealed, 'fam-2', LAN, 'passhold'))).toBe('refused');
    expect(await refused(openOrgPin(passhold, sealed, ORG, HOA, 'passhold'))).toBe('refused');
    expect(await refused(openOrgPin(passhold, sealed, ORG, LAN, 'authenticator'))).toBe('refused');
  });
});

describe('the account page’s pin', () => {
  it('is sealed under a key only the root makes, for its family and account only', async () => {
    const { orgKey, roster } = await family();
    const root = await newAccountRoot();
    const pin = nextOrgPin(null, await checkRoster(orgKey, ORG, roster, null));
    const sealed = await sealPagePin(root, pin, ORG, LAN);
    expect(await openPagePin(root, sealed, ORG, LAN)).toEqual(pin);
    expect(await refused(openPagePin(await newAccountRoot(), sealed, ORG, LAN))).toBe('refused');
    // The root's public half, which the server holds, makes nothing of it without the private half.
    expect(await refused(openPagePin({ ...(await newAccountRoot()), publicKey: root.publicKey }, sealed, ORG, LAN))).toBe('refused');
    expect(await refused(openPagePin(root, sealed, 'fam-2', LAN))).toBe('refused');
    expect(await refused(openPagePin(root, sealed, ORG, HOA))).toBe('refused');
  });

  it('is read back from a browser field by field', async () => {
    const { orgKey, roster } = await family();
    const pin = nextOrgPin(null, await checkRoster(orgKey, ORG, roster, null));
    expect(await orgPinFrom(JSON.parse(JSON.stringify(pin)))).toEqual(pin);
    for (const odd of [null, 'pin', { ...pin, version: '3' }, { ...pin, keys: null }, { ...pin, keys: { [LAN]: 'not a key' } }, { ...pin, keys: { 'a:b': pin.keys[LAN] } }]) {
      expect(await refused(orgPinFrom(odd)), JSON.stringify(odd)).not.toBe('opened');
    }
  });
});

describe('a collection', () => {
  it('hands its key only from a member to the member it was sealed to, for its collection and generation', async () => {
    const { minh, lan, hoa } = await family();
    const key = await newCollectionKey();
    const place = { orgId: ORG, collectionId: 'vault', generation: 2 };
    const box = await sealCollectionKey(key, { sender: minh, senderId: MINH, recipientKey: lan.publicKey, recipientId: LAN }, place);
    const to = { recipient: lan, recipientId: LAN, senderKey: minh.publicKey, senderId: MINH };
    expect(await exported(await openCollectionKey(box, to, place))).toBe(await exported(key));
    expect(await refused(openCollectionKey(box, to, { ...place, collectionId: 'other' }))).toBe('refused');
    expect(await refused(openCollectionKey(box, to, { ...place, generation: 1 }))).toBe('refused');
    expect(await refused(openCollectionKey(box, to, { ...place, orgId: 'fam-2' }))).toBe('refused');
    expect(await refused(openCollectionKey(box, { ...to, recipient: hoa, recipientId: HOA }, place))).toBe('refused');
    // A box of the family key is not a collection's key box, though both hold 32 bytes.
    const orgBox = await sealOrgKey(key, { sender: minh, senderId: MINH, recipientKey: lan.publicKey, recipientId: LAN }, ORG, 2);
    expect(await refused(openCollectionKey(orgBox, to, place))).toBe('refused');
  });

  it('opens a record only in its collection, under its generation, at its id and revision', async () => {
    const key = await newCollectionKey();
    const place = { orgId: ORG, collectionId: 'vault', generation: 1, id: 'login-1', rev: 3 };
    const sealed = await sealOrgRecord(key, { site: 'example.com' }, place);
    expect(await openOrgRecord(key, sealed, place)).toEqual({ site: 'example.com' });
    for (const moved of [
      { ...place, collectionId: 'kids' },
      { ...place, generation: 2 },
      { ...place, id: 'login-2' },
      { ...place, rev: 2 },
      { ...place, orgId: 'fam-2' },
    ]) {
      expect(await refused(openOrgRecord(key, sealed, moved)), JSON.stringify(moved)).toBe('refused');
    }
    expect(await refused(openOrgRecord(await newCollectionKey(), sealed, place))).toBe('refused');
  });

  it('deletes a record only under its key, sealed apart: a record never opens as its deletion, nor a deletion as the record', async () => {
    const key = await newCollectionKey();
    const place = { orgId: ORG, collectionId: 'vault', generation: 1, id: 'login-1', rev: 4 };
    const deletion = await sealOrgTombstone(key, place);
    expect(await refused(openOrgTombstone(key, deletion, place))).toBe('opened');
    // Nor even a record whose value says it is deleted.
    const record = await sealOrgRecord(key, { deleted: true }, place);
    expect(await refused(openOrgTombstone(key, record, place))).toBe('refused');
    expect(await refused(openOrgRecord(key, deletion, place))).toBe('refused');
    for (const moved of [
      { ...place, collectionId: 'kids' },
      { ...place, generation: 2 },
      { ...place, id: 'login-2' },
      { ...place, rev: 3 },
      { ...place, orgId: 'fam-2' },
    ]) {
      expect(await refused(openOrgTombstone(key, deletion, moved)), JSON.stringify(moved)).toBe('refused');
    }
    expect(await refused(openOrgTombstone(await newCollectionKey(), deletion, place))).toBe('refused');
    // Sealed under its label but saying something else, by someone holding the key: not a deletion.
    const odd = await sealJson(key, { deleted: false }, orgTombstoneAad(ORG, 'vault', 1, 'login-1', 4));
    expect(await refused(openOrgTombstone(key, odd, place))).toBe('threw: Malformed family record.');
  });

  it('keeps its name under its key, for its own generation', async () => {
    const key = await newCollectionKey();
    const place = { orgId: ORG, collectionId: 'vault', generation: 1 };
    const sealed = await sealCollectionName(key, 'Gia đình', place);
    expect(await openCollectionName(key, sealed, place)).toBe('Gia đình');
    expect(await refused(openCollectionName(key, sealed, { ...place, generation: 2 }))).toBe('refused');
    expect(await refused(openCollectionName(key, sealed, { ...place, collectionId: 'kids' }))).toBe('refused');
    await expect(sealCollectionName(key, ' ', place)).rejects.toThrow('A collection needs a name of up to 128 characters.');
  });
});

describe('emergency access', () => {
  it('hands the root to the chosen contact alone, as from the one who chose them, for their family', async () => {
    const { minh, lan, hoa } = await family();
    const root = await newAccountRoot();
    const box = await sealEmergencyBox(root, { sender: minh, senderId: MINH, recipientKey: lan.publicKey, recipientId: LAN }, ORG);
    const to = { recipient: lan, recipientId: LAN, senderKey: minh.publicKey, senderId: MINH };
    expect((await openEmergencyBox(box, to, ORG)).publicKey).toBe(root.publicKey);

    // Given to someone else, said to be from someone else, or for another family.
    expect(await refused(openEmergencyBox(box, { ...to, recipient: hoa, recipientId: HOA }, ORG))).toBe('refused');
    expect(await refused(openEmergencyBox(box, { ...to, recipient: hoa }, ORG))).toBe('refused');
    expect(await refused(openEmergencyBox(box, { ...to, senderKey: hoa.publicKey, senderId: HOA }, ORG))).toBe('refused');
    expect(await refused(openEmergencyBox(box, to, 'fam-2'))).toBe('refused');
    // Made by the server, with a key of its own under Minh's name.
    const servers = await newMemberKey();
    const forged = await sealEmergencyBox(await newAccountRoot(), { sender: servers, senderId: MINH, recipientKey: lan.publicKey, recipientId: LAN }, ORG);
    expect(await refused(openEmergencyBox(forged, to, ORG))).toBe('refused');
    // A family key's box is not an emergency box, though both are from Minh to Lan.
    const orgBox = await sealOrgKey(await newOrgKey(), { sender: minh, senderId: MINH, recipientKey: lan.publicKey, recipientId: LAN }, ORG, 1);
    expect(await refused(openEmergencyBox(orgBox, to, ORG))).toBe('refused');
  });
});

describe('the organisation recovery key', () => {
  it('reaches an organiser only from one the pinned roster names, for its family and generation, and only as the roster lists it', async () => {
    const { minh, lan, hoa } = await family();
    const recoveryKey = await newOrgRecoveryKey();
    // Minh makes it and hands it to Lan, made an organiser.
    const box = await sealOrgRecoveryKey(recoveryKey, { sender: minh, senderId: MINH, recipientKey: lan.publicKey, recipientId: LAN }, ORG, 1);
    const to = { recipient: lan, recipientId: LAN, senderKey: minh.publicKey, senderId: MINH };
    expect((await openOrgRecoveryKey(box, to, ORG, 1, recoveryKey.publicKey)).publicKey).toBe(recoveryKey.publicKey);

    // To someone else, said to be from someone else, for another family or generation.
    expect(await refused(openOrgRecoveryKey(box, { ...to, recipient: hoa, recipientId: HOA }, ORG, 1, recoveryKey.publicKey))).toBe('refused');
    expect(await refused(openOrgRecoveryKey(box, { ...to, senderKey: hoa.publicKey, senderId: HOA }, ORG, 1, recoveryKey.publicKey))).toBe('refused');
    expect(await refused(openOrgRecoveryKey(box, to, 'fam-2', 1, recoveryKey.publicKey))).toBe('refused');
    expect(await refused(openOrgRecoveryKey(box, to, ORG, 2, recoveryKey.publicKey))).toBe('refused');
    // Made by the server, with a member key of its own under Minh's name.
    const servers = await newMemberKey();
    const forged = await sealOrgRecoveryKey(await newOrgRecoveryKey(), { sender: servers, senderId: MINH, recipientKey: lan.publicKey, recipientId: LAN }, ORG, 1);
    expect(await refused(openOrgRecoveryKey(forged, to, ORG, 1, recoveryKey.publicKey))).toBe('refused');
    // Minh's own box, but of a key the roster does not list: nobody sealed a root to it.
    const other = await sealOrgRecoveryKey(await newOrgRecoveryKey(), { sender: minh, senderId: MINH, recipientKey: lan.publicKey, recipientId: LAN }, ORG, 1);
    expect(await refused(openOrgRecoveryKey(other, to, ORG, 1, recoveryKey.publicKey))).toBe('refused');
    // The family key's box from Minh to Lan is not this.
    const orgBox = await sealOrgKey(await newOrgKey(), { sender: minh, senderId: MINH, recipientKey: lan.publicKey, recipientId: LAN }, ORG, 1);
    expect(await refused(openOrgRecoveryKey(orgBox, to, ORG, 1, recoveryKey.publicKey))).toBe('refused');
  });

  it('opens a member’s root only as sealed by that member, to this recovery key, for their family', async () => {
    const { minh, lan, hoa } = await family();
    const recoveryKey = await newOrgRecoveryKey();
    const root = await newAccountRoot();
    const box = await sealOrgRecoveryBox(root, { member: lan, accountId: LAN, recoveryKey: recoveryKey.publicKey }, ORG);
    const to = { recoveryKey, accountId: LAN, memberKey: lan.publicKey };
    expect((await openOrgRecoveryBox(box, to, ORG)).publicKey).toBe(root.publicKey);

    // Said to be Hoa's, from Hoa's key, for another family, or with the next recovery key.
    expect(await refused(openOrgRecoveryBox(box, { ...to, accountId: HOA }, ORG))).toBe('refused');
    expect(await refused(openOrgRecoveryBox(box, { ...to, memberKey: hoa.publicKey }, ORG))).toBe('refused');
    expect(await refused(openOrgRecoveryBox(box, to, 'fam-2'))).toBe('refused');
    expect(await refused(openOrgRecoveryBox(box, { ...to, recoveryKey: await newOrgRecoveryKey() }, ORG))).toBe('refused');
    // Made by the server: a root of its own, sealed to the public half the roster shows everyone, from a key of its own under Lan's name.
    const servers = await newMemberKey();
    const forged = await sealOrgRecoveryBox(await newAccountRoot(), { member: servers, accountId: LAN, recoveryKey: recoveryKey.publicKey }, ORG);
    expect(await refused(openOrgRecoveryBox(forged, to, ORG))).toBe('refused');
    // Hoa's own root, sealed by Hoa, passed off as Lan's.
    const hoas = await sealOrgRecoveryBox(await newAccountRoot(), { member: hoa, accountId: HOA, recoveryKey: recoveryKey.publicKey }, ORG);
    expect(await refused(openOrgRecoveryBox(hoas, to, ORG))).toBe('refused');
    // Lan's emergency box to Minh holds the same root, and is not this.
    const emergency = await sealEmergencyBox(root, { sender: lan, senderId: LAN, recipientKey: minh.publicKey, recipientId: MINH }, ORG);
    expect(await refused(openOrgRecoveryBox(emergency, { ...to, recoveryKey: { ...minh } }, ORG))).toBe('refused');
  });
});

describe('handing a recovered root to the member’s new browser', () => {
  const REQUEST = 'req-1';

  it('shows the same code on both screens, and another when the server swapped either key or moved the request', async () => {
    const { minh } = await family();
    const browser = await newHandoverKey();
    const parties = { orgId: ORG, memberId: LAN, requestId: REQUEST, organiserId: MINH, organiserKey: minh.publicKey, browserKey: browser.publicKey };
    const code = await orgRecoveryCode(parties);
    expect(code).toMatch(/^[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}$/);
    expect(await orgRecoveryCode({ ...parties })).toBe(code);

    // The server gave the organiser a browser key of its own, or the browser an organiser key of its own.
    expect(await orgRecoveryCode({ ...parties, browserKey: (await newHandoverKey()).publicKey })).not.toBe(code);
    expect(await orgRecoveryCode({ ...parties, organiserKey: (await newMemberKey()).publicKey })).not.toBe(code);
    // Or passed the request off as another's, for someone else, in another family, to another organiser.
    expect(await orgRecoveryCode({ ...parties, requestId: 'req-2' })).not.toBe(code);
    expect(await orgRecoveryCode({ ...parties, memberId: HOA })).not.toBe(code);
    expect(await orgRecoveryCode({ ...parties, orgId: 'fam-2' })).not.toBe(code);
    expect(await orgRecoveryCode({ ...parties, organiserId: HOA })).not.toBe(code);
  });

  it('opens only in the browser of the request, as from the organiser the codes were compared over', async () => {
    const { minh, lan, hoa } = await family();
    const root = await newAccountRoot();
    const browser = await newHandoverKey();
    const parties = { orgId: ORG, memberId: LAN, requestId: REQUEST, organiserId: MINH };
    const box = await sealRecoveryHandover(root, minh, { ...parties, browserKey: browser.publicKey });
    const to = { ...parties, organiserKey: minh.publicKey };
    expect((await openRecoveryHandover(box, browser, to)).publicKey).toBe(root.publicKey);

    // Another browser, said to be from Hoa, for another request, member or family.
    expect(await refused(openRecoveryHandover(box, await newHandoverKey(), to))).toBe('refused');
    expect(await refused(openRecoveryHandover(box, browser, { ...to, organiserKey: hoa.publicKey, organiserId: HOA }))).toBe('refused');
    expect(await refused(openRecoveryHandover(box, browser, { ...to, requestId: 'req-2' }))).toBe('refused');
    expect(await refused(openRecoveryHandover(box, browser, { ...to, memberId: HOA }))).toBe('refused');
    expect(await refused(openRecoveryHandover(box, browser, { ...to, orgId: 'fam-2' }))).toBe('refused');
    // Made by the server, from a member key of its own under Minh's name: a root it knows.
    const servers = await newMemberKey();
    const forged = await sealRecoveryHandover(await newAccountRoot(), servers, { ...parties, browserKey: browser.publicKey });
    expect(await refused(openRecoveryHandover(forged, browser, to))).toBe('refused');
    // Lan's own recovery box holds the same root, and is not this.
    const kept = await sealOrgRecoveryBox(root, { member: lan, accountId: LAN, recoveryKey: browser.publicKey }, ORG);
    expect(await refused(openRecoveryHandover(kept, browser, { ...to, organiserKey: lan.publicKey }))).toBe('refused');
  });
});

describe('the labels', () => {
  it('take no id a colon could make read two ways', async () => {
    const { minh, lan, orgKey } = await family();
    await expect(sealOrgKey(orgKey, { sender: minh, senderId: 'a:b', recipientKey: lan.publicKey, recipientId: LAN }, ORG, 1)).rejects.toThrow('Malformed account id.');
    await expect(sealOrgRecord(orgKey, {}, { orgId: ORG, collectionId: 'a:b', generation: 1, id: 'x', rev: 0 })).rejects.toThrow('Malformed account id.');
    await expect(sealOrgRecord(orgKey, {}, { orgId: ORG, collectionId: 'vault', generation: 0, id: 'x', rev: 0 })).rejects.toThrow('Malformed key generation.');
    await expect(sealOrgRecord(orgKey, {}, { orgId: ORG, collectionId: 'vault', generation: 1, id: 'x', rev: -1 })).rejects.toThrow('Malformed record revision.');
  });
});
