import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CURVE, publicPointOf } from '../src/crypto/ecdh.js';
import { checkVouch, fromBase64, vouchFor, type MemberKey } from '../src/index.js';

/**
 * The two labels of an organiser's word for a key (docs/family.md, Keys):
 * `keyrook:v1:org-vouch`, the HKDF info of its key, and
 * `keyrook.org-vouch:v1:<org>:<member>:<organiser>:<recipient>`, what it
 * covers before the key — frozen before families are offered, as the 23 of
 * `org-labels.test.ts` were at F11. These fixtures were made once, by the
 * code at keyrook-account 5aff3ea, and are never regenerated: a word one copy
 * of this package made must keep checking out on a device that copied
 * another, or everyone it vouched for is compared again.
 *
 * A failure here means a label, a parameter or a format changed. Put it back.
 * A new format is a new label beside the old one, never a replacement for it.
 */
const fixture = JSON.parse(readFileSync(new URL('./fixtures/org-vouch-labels.json', import.meta.url), 'utf8'));
const { ORG_ID, MINH_ID, LAN_ID, HOA_ID } = fixture.inputs;
const keys = fixture.publicKeys;
const toLan = { orgId: ORG_ID, memberId: HOA_ID, memberKey: keys.hoa, organiserId: MINH_ID, recipientId: LAN_ID };
const toMinh = { ...toLan, recipientId: MINH_ID };
const OTHER = '00000000-0000-4000-8000-000000000000';

async function pair(pkcs8: string): Promise<MemberKey> {
  const privateKey = await crypto.subtle.importKey('pkcs8', fromBase64(pkcs8) as BufferSource, CURVE, true, ['deriveBits']);
  return { privateKey, publicKey: await publicPointOf(privateKey) };
}
const minh = () => pair(fixture.inputs.MINH_MEMBER_PKCS8);
const lan = () => pair(fixture.inputs.LAN_MEMBER_PKCS8);

describe('an organiser’s word for a key', () => {
  it('is made the same way (keyrook:v1:org-vouch, keyrook.org-vouch:v1), to another member and to the organiser', async () => {
    expect(await vouchFor(await minh(), keys.lan, toLan)).toBe(fixture.toLan);
    expect(await vouchFor(await minh(), keys.minh, toMinh)).toBe(fixture.toMinh);
  });

  it('checks out on the device it is for, as from the organiser', async () => {
    expect(await checkVouch(await lan(), keys.minh, toLan, fixture.toLan)).toBe(true);
    expect(await checkVouch(await minh(), keys.minh, toMinh, fixture.toMinh)).toBe(true);
  });

  it('notices a change: another family, person, key, organiser or recipient', async () => {
    const changes = [{ orgId: OTHER }, { memberId: OTHER }, { memberKey: keys.lan }, { organiserId: OTHER }, { recipientId: OTHER }];
    for (const change of changes) expect(await checkVouch(await lan(), keys.minh, { ...toLan, ...change }, fixture.toLan), JSON.stringify(change)).toBe(false);
  });
});
