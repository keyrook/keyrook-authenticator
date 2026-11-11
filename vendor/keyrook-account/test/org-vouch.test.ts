import { describe, expect, it } from 'vitest';
import { checkVouch, newMemberKey, toBase64, vouchedFor, vouchFor, type MemberKey, type OrgPin, type OrgVouch, type VouchFields } from '../src/index.js';

/**
 * An organiser's word that a key is someone's (docs/family.md, Keys), tried
 * as a hostile server would: one it makes itself, one moved to another
 * member, family, key or organiser, one from a member who is no organiser,
 * from an organiser whose key changed or who was never pinned, and one for
 * a key the person held before. Each must vouch for nobody.
 */
const ORG = 'fam-1';
const MINH = 'acc-minh';
const LAN = 'acc-lan';
const HOA = 'acc-hoa';
const TU = 'acc-tu';

/** Minh, the organiser, telling Lan that Hoa's new key is hers; Tú, a member; Hoa's old key, pinned on Lan's device. */
async function people() {
  const minh = await newMemberKey();
  const lan = await newMemberKey();
  const hoa = await newMemberKey();
  const hoaBefore = await newMemberKey();
  const tu = await newMemberKey();
  const fields: VouchFields = { orgId: ORG, memberId: HOA, memberKey: hoa.publicKey, organiserId: MINH, recipientId: LAN };
  const tag = await vouchFor(minh, lan.publicKey, fields);
  const members = [
    { accountId: MINH, role: 'owner', memberKey: minh.publicKey },
    { accountId: LAN, role: 'member', memberKey: lan.publicKey },
    { accountId: HOA, role: 'member', memberKey: hoa.publicKey },
    { accountId: TU, role: 'member', memberKey: tu.publicKey },
  ];
  const pin: OrgPin = { version: 3, generation: 2, keys: { [MINH]: minh.publicKey, [LAN]: lan.publicKey, [HOA]: hoaBefore.publicKey, [TU]: tu.publicKey } };
  return { minh, lan, hoa, hoaBefore, tu, fields, tag, members, pin };
}

const vouched = (lan: MemberKey, rest: Partial<Parameters<typeof vouchedFor>[0]> & Pick<Parameters<typeof vouchedFor>[0], 'members' | 'pin' | 'vouches'>) =>
  vouchedFor({ orgId: ORG, me: lan, meId: LAN, subjects: [HOA], ...rest });

describe('an organiser’s word for a key', () => {
  it('is checked by the one it is for, as from the organiser, for exactly that key, person and family', async () => {
    const { minh, lan, hoa, tu, fields, tag } = await people();
    expect(await checkVouch(lan, minh.publicKey, fields, tag)).toBe(true);

    const moved: Partial<VouchFields>[] = [
      { orgId: 'fam-2' },
      { memberId: TU },
      { memberKey: tu.publicKey },
      { organiserId: TU },
      { recipientId: TU },
    ];
    for (const change of moved) expect(await checkVouch(lan, minh.publicKey, { ...fields, ...change }, tag), JSON.stringify(change)).toBe(false);
    // Another member checking it, or it checked as from someone else.
    expect(await checkVouch(tu, minh.publicKey, { ...fields, recipientId: TU }, tag)).toBe(false);
    expect(await checkVouch(lan, tu.publicKey, fields, tag)).toBe(false);
    expect(await checkVouch(lan, hoa.publicKey, fields, tag)).toBe(false);
  });

  it('is made by nobody but the organiser and the one it is for: the server’s own, or a member’s, does not pass as the organiser’s', async () => {
    const { minh, lan, tu, fields, tag } = await people();
    const servers = await newMemberKey();
    expect(await checkVouch(lan, minh.publicKey, fields, await vouchFor(servers, lan.publicKey, fields))).toBe(false);
    expect(await checkVouch(lan, minh.publicKey, fields, await vouchFor(tu, lan.publicKey, fields))).toBe(false);
    const flipped = Uint8Array.from(atob(tag), (char) => char.charCodeAt(0));
    flipped[0]! ^= 1;
    for (const forged of [toBase64(flipped), toBase64(new Uint8Array(32)), '', 'not base64 at all!', 'A'.repeat(65)]) {
      expect(await checkVouch(lan, minh.publicKey, fields, forged), forged).toBe(false);
    }
  });

  it('is never for one’s own key', async () => {
    const { minh, lan, fields } = await people();
    await expect(vouchFor(minh, lan.publicKey, { ...fields, memberId: MINH })).rejects.toThrow('Nobody vouches for their own key.');
    await expect(vouchFor(minh, lan.publicKey, { ...fields, memberId: LAN })).rejects.toThrow('Nobody vouches for their own key.');
  });
});

describe('a key taken on an organiser’s word', () => {
  it('is taken from an organiser this device pinned, with the key it pinned', async () => {
    const { lan, members, pin, tag } = await people();
    expect(await vouched(lan, { members, pin, vouches: [{ accountId: HOA, by: MINH, tag }] })).toEqual([HOA]);
  });

  it('is not taken from an organiser whose key changed, one never pinned, nor one no longer an organiser', async () => {
    const { lan, members, pin, tag } = await people();
    const vouches = [{ accountId: HOA, by: MINH, tag }];
    const other = (await newMemberKey()).publicKey;
    // Lan's device pinned another key for Minh: the roster's is a change, not his.
    expect(await vouched(lan, { members, pin: { ...pin, keys: { ...pin.keys, [MINH]: other } }, vouches })).toEqual([]);
    // The roster lists another key for Minh than the one pinned.
    expect(await vouched(lan, { members: members.map((line) => (line.accountId === MINH ? { ...line, memberKey: other } : line)), pin, vouches })).toEqual([]);
    const { [MINH]: _minh, ...withoutMinh } = pin.keys;
    expect(await vouched(lan, { members, pin: { ...pin, keys: withoutMinh }, vouches })).toEqual([]);
    expect(await vouched(lan, { members, pin: null, vouches })).toEqual([]);
    expect(await vouched(lan, { members: members.map((line) => (line.accountId === MINH ? { ...line, role: 'member' } : line)), pin, vouches })).toEqual([]);
    expect(await vouched(lan, { members: members.filter((line) => line.accountId !== MINH), pin, vouches })).toEqual([]);
  });

  it('is not taken from a member, nor from the one whose key it is, nor for a key the roster does not list', async () => {
    const { tu, hoa, hoaBefore, lan, minh, members, pin, fields } = await people();
    const fromTu = await vouchFor(tu, lan.publicKey, { ...fields, organiserId: TU });
    expect(await vouched(lan, { members, pin, vouches: [{ accountId: HOA, by: TU, tag: fromTu }] })).toEqual([]);
    // Tú made an organiser by a line the server changed would fail the roster's MAC; here the lines are as given.
    expect(
      await vouched(lan, { members: members.map((line) => (line.accountId === TU ? { ...line, role: 'owner' } : line)), pin, vouches: [{ accountId: HOA, by: TU, tag: fromTu }] }),
    ).toEqual([HOA]);
    // Hoa cannot vouch for herself: there is no such word to make.
    expect(await vouched(lan, { members, pin, vouches: [{ accountId: HOA, by: HOA, tag: await vouchFor(hoa, lan.publicKey, { ...fields, organiserId: TU }) }] })).toEqual([]);
    // Minh's word for the key Hoa had is no word for the one the roster lists now.
    const before = await vouchFor(minh, lan.publicKey, { ...fields, memberKey: hoaBefore.publicKey });
    expect(await vouched(lan, { members, pin, vouches: [{ accountId: HOA, by: MINH, tag: before }] })).toEqual([]);
  });

  it('is taken on the person’s own word, from the page that compared it, when they are an organiser', async () => {
    const { minh, members, pin, fields } = await people();
    const own = await vouchFor(minh, minh.publicKey, { ...fields, recipientId: MINH });
    const vouches = [{ accountId: HOA, by: MINH, tag: own }];
    expect(await vouchedFor({ orgId: ORG, me: minh, meId: MINH, pin, members, vouches, subjects: [HOA] })).toEqual([HOA]);
    const asMember = members.map((line) => (line.accountId === MINH ? { ...line, role: 'member' } : line));
    expect(await vouchedFor({ orgId: ORG, me: minh, meId: MINH, pin, members: asMember, vouches, subjects: [HOA] })).toEqual([]);
  });

  it('vouches for nobody from whatever else the server sends in place of a word', async () => {
    const { lan, members, pin, tag } = await people();
    const junk = [null, { accountId: HOA }, { accountId: HOA, by: 7, tag }, { accountId: HOA, by: 'a:b', tag }, { accountId: HOA, by: MINH, tag: 7 }] as unknown as OrgVouch[];
    expect(await vouched(lan, { members, pin, vouches: junk })).toEqual([]);
    expect(await vouched(lan, { members, pin, vouches: undefined })).toEqual([]);
    expect(await vouched(lan, { members, pin, vouches: [{ accountId: HOA, by: MINH, tag }], subjects: [TU] })).toEqual([]);
  });
});
