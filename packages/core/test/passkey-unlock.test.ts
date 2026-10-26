import { describe, expect, it } from 'vitest';
import { DecryptionError, exportDataKey, generateDataKey, newKdfParams } from '@keyrook/account';
import {
  adoptDataKey,
  createVault,
  deviceKeyring,
  passphraseKeyring,
  rewrapVault,
  unlockVaultWithPassword,
  updateAccount,
} from '../src/vault/vault.js';
import {
  attachPasskeyUnlock,
  detachPasskeyUnlock,
  newPasskeyUnlockInput,
  passkeyUnlockOf,
  unlockVaultWithPasskey,
  type PasskeyUnlockKind,
} from '../src/vault/passkey-unlock.js';
import type { VaultFile } from '../src/vault/model.js';
import { fromBase64, toBase64 } from '../src/util/bytes.js';

/**
 * Each case is someone trying to open a vault without the person's check: with
 * the file alone, with another vault's way in, with an answer that is not the
 * passkey's, with the other kind's way in, or after the key it wrapped has
 * gone.
 */
const PASSWORD = 'correct horse battery staple';
const keyring = (password = PASSWORD) => passphraseKeyring(password, newKdfParams(100_000));
/** What a passkey's PRF answers: 32 bytes only its authenticator can make. */
const answer = () => crypto.getRandomValues(new Uint8Array(32));
const KINDS: PasskeyUnlockKind[] = ['platform', 'securityKey'];
const other = (kind: PasskeyUnlockKind): PasskeyUnlockKind => (kind === 'platform' ? 'securityKey' : 'platform');

async function withUnlock(kind: PasskeyUnlockKind) {
  const vault = await createVault(await keyring());
  const prf = answer();
  const file = await attachPasskeyUnlock(vault.file, kind, vault.dataKey, {
    credentialId: 'cred-1',
    prfInput: newPasskeyUnlockInput(),
    prf,
  });
  return { ...vault, file, prf };
}

for (const kind of KINDS) {
  describe(`opening with a passkey: ${kind}`, () => {
    it('opens the vault with the passkey’s answer, and the password still does', async () => {
      const { file, prf, data } = await withUnlock(kind);
      expect((await unlockVaultWithPasskey(file, kind, prf)).data).toEqual(data);
      expect((await unlockVaultWithPassword(file, PASSWORD)).data).toEqual(data);
    });

    it('keeps nothing on disk that opens the vault without the passkey', async () => {
      const { file, prf, dataKey } = await withUnlock(kind);
      const disk = JSON.stringify(file);
      expect(disk).not.toContain(toBase64(prf));
      expect(disk).not.toContain(await exportDataKey(dataKey));
      // The input the passkey is asked about is there, and is no key.
      const input = fromBase64(passkeyUnlockOf(file, kind)!.prfInput);
      await expect(unlockVaultWithPasskey(file, kind, input)).rejects.toBeInstanceOf(DecryptionError);
    });

    it('refuses an answer that is not the passkey’s, or not an answer at all', async () => {
      const { file, prf } = await withUnlock(kind);
      await expect(unlockVaultWithPasskey(file, kind, answer())).rejects.toBeInstanceOf(DecryptionError);
      await expect(unlockVaultWithPasskey(file, kind, prf.slice(0, 31))).rejects.toBeInstanceOf(DecryptionError);
    });

    it('is bound to its vault: the same answer, carried into another vault’s file, opens nothing', async () => {
      const first = await withUnlock(kind);
      const second = await createVault(await keyring());
      const grafted: VaultFile = {
        ...second.file,
        platformUnlock: first.file.platformUnlock ?? null,
        securityKeyUnlock: first.file.securityKeyUnlock ?? null,
      };
      await expect(unlockVaultWithPasskey(grafted, kind, first.prf)).rejects.toBeInstanceOf(DecryptionError);
    });

    it('is bound to its kind: moved into the other slot, the same answer opens nothing', async () => {
      const { file, prf } = await withUnlock(kind);
      const moved: VaultFile = {
        ...file,
        platformUnlock: file.securityKeyUnlock ?? null,
        securityKeyUnlock: file.platformUnlock ?? null,
      };
      expect(passkeyUnlockOf(moved, other(kind))).not.toBeNull();
      await expect(unlockVaultWithPasskey(moved, other(kind), prf)).rejects.toBeInstanceOf(DecryptionError);
      await expect(unlockVaultWithPasskey(file, other(kind), prf)).rejects.toBeInstanceOf(DecryptionError);
    });

    it('survives a new password, which wraps the same key', async () => {
      const { file, prf, dataKey, data } = await withUnlock(kind);
      const changed = await rewrapVault(file, dataKey, await keyring('a different long password'));
      expect((await unlockVaultWithPasskey(changed, kind, prf)).data).toEqual(data);
    });

    it('goes with the password: a vault that opens with the device key keeps no second way in', async () => {
      const { file, prf, dataKey } = await withUnlock(kind);
      const deviceKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['wrapKey', 'unwrapKey']);
      const device = await rewrapVault(file, dataKey, deviceKeyring(deviceKey));
      expect(device.platformUnlock).toBeNull();
      expect(device.securityKeyUnlock).toBeNull();
      await expect(unlockVaultWithPasskey(device, kind, prf)).rejects.toBeInstanceOf(DecryptionError);
      // Even with the block put back by hand: the mode decides, not the field.
      const restored: VaultFile = { ...device, platformUnlock: file.platformUnlock ?? null, securityKeyUnlock: file.securityKeyUnlock ?? null };
      await expect(unlockVaultWithPasskey(restored, kind, prf)).rejects.toBeInstanceOf(DecryptionError);
      await expect(
        attachPasskeyUnlock(device, kind, dataKey, { credentialId: 'x', prfInput: newPasskeyUnlockInput(), prf }),
      ).rejects.toThrow(/not protected by a master password/);
    });

    it('is dropped when the data key changes, as joining an account changes it', async () => {
      const { file, prf, data } = await withUnlock(kind);
      const joined = await adoptDataKey(
        file,
        await keyring(),
        await generateDataKey(),
        updateAccount(data, { email: 'a@example.com' }),
      );
      expect(joined.platformUnlock).toBeNull();
      expect(joined.securityKeyUnlock).toBeNull();
      await expect(unlockVaultWithPasskey(joined, kind, prf)).rejects.toBeInstanceOf(DecryptionError);
    });

    it('is gone once turned off', async () => {
      const { file, prf } = await withUnlock(kind);
      await expect(unlockVaultWithPasskey(detachPasskeyUnlock(file, kind), kind, prf)).rejects.toBeInstanceOf(
        DecryptionError,
      );
    });
  });
}

describe('the computer’s own check and a security key together', () => {
  it('each opens the vault with its own answer, and turning one off leaves the other', async () => {
    const vault = await createVault(await keyring());
    const computer = answer();
    const key = answer();
    let file = await attachPasskeyUnlock(vault.file, 'platform', vault.dataKey, {
      credentialId: 'computer',
      prfInput: newPasskeyUnlockInput(),
      prf: computer,
    });
    file = await attachPasskeyUnlock(file, 'securityKey', vault.dataKey, {
      credentialId: 'key',
      prfInput: newPasskeyUnlockInput(),
      prf: key,
    });

    expect((await unlockVaultWithPasskey(file, 'platform', computer)).data).toEqual(vault.data);
    expect((await unlockVaultWithPasskey(file, 'securityKey', key)).data).toEqual(vault.data);
    // One's answer is not the other's.
    await expect(unlockVaultWithPasskey(file, 'platform', key)).rejects.toBeInstanceOf(DecryptionError);
    await expect(unlockVaultWithPasskey(file, 'securityKey', computer)).rejects.toBeInstanceOf(DecryptionError);

    const keyOnly = detachPasskeyUnlock(file, 'platform');
    await expect(unlockVaultWithPasskey(keyOnly, 'platform', computer)).rejects.toBeInstanceOf(DecryptionError);
    expect((await unlockVaultWithPasskey(keyOnly, 'securityKey', key)).data).toEqual(vault.data);
    const computerOnly = detachPasskeyUnlock(file, 'securityKey');
    expect((await unlockVaultWithPasskey(computerOnly, 'platform', computer)).data).toEqual(vault.data);
    await expect(unlockVaultWithPasskey(computerOnly, 'securityKey', key)).rejects.toBeInstanceOf(DecryptionError);
  });

  it('opens a file written before there were security keys, which names only the computer’s', async () => {
    const { file, prf, data } = await withUnlock('platform');
    const before = { ...file };
    delete before.securityKeyUnlock;
    expect((await unlockVaultWithPasskey(before, 'platform', prf)).data).toEqual(data);
    expect(passkeyUnlockOf(before, 'securityKey')).toBeNull();
  });
});
