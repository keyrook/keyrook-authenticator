import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  DecryptionError,
  deriveAccountKeys,
  deriveKeyCheck,
  deriveRecoveryAuthHash,
  exportDataKey,
  importDataKey,
  importPairingKeys,
  openJson,
  openRecoveryState,
  pairingCode,
  unwrapDataKey,
  unwrapPairedDataKey,
  unwrapRecoveryWrap,
} from '../src/index.js';

/**
 * Every account, wrapped key and recovery kit in use today was made by the
 * code at authenticator-x c3b1c92. These fixtures were made by that code, once,
 * and are never regenerated: this package must keep deriving the same values
 * and keep opening the same boxes.
 *
 * A failure here means a label, a parameter or a format changed, and every
 * existing account would stop opening. Put it back. A new format is a new
 * label beside the old one, never a replacement for it.
 */
const fixture = JSON.parse(readFileSync(new URL('./fixtures/labels.json', import.meta.url), 'utf8'));
const { PASSWORD, ACCOUNT_KDF, DATA_KEY, RECOVERY_KEY, PAIRING_ID } = fixture.inputs;

describe('what the password derives', () => {
  it('sends the same auth hash to the server (authx:v1:auth)', async () => {
    expect((await deriveAccountKeys(PASSWORD, ACCOUNT_KDF)).authHash).toBe(fixture.authHash);
  });

  it('opens the protected key the server holds (authx:v1:enc)', async () => {
    const keys = await deriveAccountKeys(PASSWORD, ACCOUNT_KDF);
    expect(await exportDataKey(await unwrapDataKey(keys.stretchedKey, fixture.protectedKey))).toBe(DATA_KEY);
  });
});

describe('what the data key and the recovery key derive', () => {
  it('proves holding the data key the same way (authx:v1:key-check)', async () => {
    expect(await deriveKeyCheck(await importDataKey(DATA_KEY))).toBe(fixture.keyCheck);
  });

  it('proves holding the recovery key the same way (authx:v1:recovery-auth)', async () => {
    expect(await deriveRecoveryAuthHash(RECOVERY_KEY)).toBe(fixture.recoveryAuthHash);
  });

  it('opens a recovery wrap with the printed key', async () => {
    expect(await exportDataKey(await unwrapRecoveryWrap(fixture.recoveryWrap, RECOVERY_KEY))).toBe(DATA_KEY);
  });

  it('opens the sealed kit state under the data key (authx.recovery:v1)', async () => {
    const dataKey = await importDataKey(DATA_KEY);
    expect(await openRecoveryState(dataKey, fixture.sealedRecoveryState)).toEqual(fixture.recoveryState);
  });
});

describe('moving the key to a new browser', () => {
  it('shows the same code on both screens (authx:v1:pairing-code)', async () => {
    const { requester, approverPublicKey, code } = fixture.pairing;
    expect(await pairingCode(PAIRING_ID, requester.publicKey, approverPublicKey)).toBe(code);
  });

  it('opens the wrap the approving browser made (authx:v1:pairing-wrap, authx.pairing:v1)', async () => {
    const { requester, approverPublicKey, wrap } = fixture.pairing;
    const keys = await importPairingKeys(requester);
    expect(await exportDataKey(await unwrapPairedDataKey(keys, PAIRING_ID, approverPublicKey, wrap))).toBe(DATA_KEY);
  });
});

describe('these fixtures notice a change', () => {
  it('because each box opens only under its own label', async () => {
    const dataKey = await importDataKey(DATA_KEY);
    // The kit state without its label: what a renamed label would read.
    await expect(openJson(dataKey, fixture.sealedRecoveryState)).rejects.toBeInstanceOf(DecryptionError);
    // The pairing wrap read as another pairing's.
    const { requester, approverPublicKey, wrap } = fixture.pairing;
    await expect(
      unwrapPairedDataKey(await importPairingKeys(requester), `${PAIRING_ID}-other`, approverPublicKey, wrap),
    ).rejects.toBeInstanceOf(DecryptionError);
  });

  it('because a derived value moves with any change to its input', async () => {
    expect((await deriveAccountKeys(`${PASSWORD}!`, ACCOUNT_KDF)).authHash).not.toBe(fixture.authHash);
    const { requester, approverPublicKey, code } = fixture.pairing;
    expect(await pairingCode(PAIRING_ID, approverPublicKey, requester.publicKey)).not.toBe(code);
  });
});
