import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DecryptionError, fromBase64, fromUtf8, openRootWithPasskey, PASSKEY_PRF_INPUT, toBase64Url } from '../src/index.js';

/**
 * The labels of a root wrapped under a passkey — the PRF input every page and
 * product asks for, the HKDF info, the wrap's additional data — frozen before
 * anything is stored under them. These fixtures were made once, by the code
 * that added this file, and are never regenerated: the account's root wrapped
 * under a passkey must keep opening with that passkey's answer.
 *
 * A failure here means a label, a parameter or a format changed. Put it back;
 * a new format is a new label beside the old one.
 */
const fixture = JSON.parse(readFileSync(new URL('./fixtures/passkey-labels.json', import.meta.url), 'utf8'));
const { ACCOUNT_ID, CREDENTIAL_ID, PRF_OUTPUT } = fixture.inputs;
const prf = () => fromBase64(PRF_OUTPUT);

describe('the account’s root under a passkey', () => {
  it('asks every passkey the same question (keyrook:v1:passkey-prf)', () => {
    expect(fromUtf8(PASSKEY_PRF_INPUT)).toBe('keyrook:v1:passkey-prf');
  });

  it('opens with that passkey’s answer (keyrook:v1:root-passkey, keyrook.root:v1:<account>:passkey:<credential>)', async () => {
    expect((await openRootWithPasskey(fixture.rootPasskeyWrap, prf(), ACCOUNT_ID, CREDENTIAL_ID)).publicKey).toBe(fixture.rootPublicKey);
  });
});

describe('these fixtures notice a change', () => {
  it('because the wrap opens only for its own account, its own passkey and that passkey’s answer', async () => {
    const otherAccount = '00000000-0000-4000-8000-000000000000';
    const otherCredential = toBase64Url(new Uint8Array(32).fill(7));
    const otherAnswer = prf();
    otherAnswer[0] ^= 1;
    await expect(openRootWithPasskey(fixture.rootPasskeyWrap, prf(), otherAccount, CREDENTIAL_ID)).rejects.toBeInstanceOf(DecryptionError);
    await expect(openRootWithPasskey(fixture.rootPasskeyWrap, prf(), ACCOUNT_ID, otherCredential)).rejects.toBeInstanceOf(DecryptionError);
    await expect(openRootWithPasskey(fixture.rootPasskeyWrap, otherAnswer, ACCOUNT_ID, CREDENTIAL_ID)).rejects.toBeInstanceOf(DecryptionError);
  });

  it('because an answer that is not 32 bytes, or an id that is not a credential’s, is refused before anything opens', async () => {
    await expect(openRootWithPasskey(fixture.rootPasskeyWrap, prf().subarray(0, 31), ACCOUNT_ID, CREDENTIAL_ID)).rejects.toThrow(
      'That passkey did not answer as one that unlocks.',
    );
    await expect(openRootWithPasskey(fixture.rootPasskeyWrap, prf(), ACCOUNT_ID, 'short')).rejects.toThrow('Malformed passkey id.');
  });
});
