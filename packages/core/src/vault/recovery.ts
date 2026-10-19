/**
 * The emergency recovery kit.
 *
 * A vault encrypted under a master password is unopenable if that password is
 * forgotten — by us as much as by the user, which is the whole point. The kit
 * is the escape hatch that does not weaken it: a second, independent wrapping
 * of the *same data key* under a high-entropy secret the user keeps on paper.
 *
 * Because it wraps the data key rather than the password, the kit survives a
 * password change, and switching between device and passphrase protection, with
 * no re-encryption. It also rescues a device-protected vault whose device key
 * was lost while its storage survived — the state the UI otherwise has to call
 * unrecoverable.
 *
 * This has to exist before the first real user does. Adding it afterwards
 * cannot help anyone who already lost a password.
 */
import { newRecoveryWrap, unwrapRecoveryWrap, type AccountRecoveryState } from '@keyrook/account';
import type { VaultFile } from './model.js';
import { readPayload, type UnlockedVault } from './vault.js';

/*
 * The kit's format — the key on paper, how it wraps a data key, how it opens —
 * is the Keyrook account's (@keyrook/account, sync/kit.ts), shared by every
 * product. What is here is this app's vault file holding one.
 */

export function hasRecoveryKit(file: VaultFile): boolean {
  return file.recovery !== null;
}

/**
 * Issue a kit. Returns the key exactly once — it is never stored anywhere, so
 * a caller that drops it has thrown it away for good.
 */
export async function attachRecoveryKit(
  file: VaultFile,
  dataKey: CryptoKey,
): Promise<{ file: VaultFile; recoveryKey: string }> {
  const { wrap, recoveryKey } = await newRecoveryWrap(dataKey);
  return { file: { ...file, recovery: wrap, updatedAt: Date.now() }, recoveryKey };
}

export async function unlockWithRecoveryKey(
  file: VaultFile,
  recoveryKey: string,
): Promise<UnlockedVault> {
  if (!file.recovery) {
    throw new Error('This vault does not have a recovery key.');
  }
  const dataKey = await unwrapRecoveryWrap(file.recovery, recoveryKey);
  return { file, dataKey, data: await readPayload(file, dataKey) };
}

export function removeRecoveryKit(file: VaultFile): VaultFile {
  return { ...file, recovery: null, updatedAt: Date.now() };
}

/** Installs the account's kit in a local vault file, or removes it. */
export function applyRecoveryState(file: VaultFile, state: AccountRecoveryState): VaultFile {
  return { ...file, recovery: state.wrap, updatedAt: Date.now() };
}

/** The printable sheet. Plain text on purpose: it has to survive everything. */
export function recoveryKitDocument(recoveryKey: string, createdAt = Date.now()): string {
  return [
    'KEYROOK AUTHENTICATOR — EMERGENCY RECOVERY KEY',
    '',
    `Issued: ${new Date(createdAt).toISOString().slice(0, 10)}`,
    '',
    '    ' + recoveryKey,
    '',
    'What this is for',
    '  If you forget your master password, this key is the only way back into',
    '  your accounts. Nobody can reset it for you — not us, not Google. That is',
    '  deliberate: it is the same property that stops anyone else opening your',
    '  vault.',
    '',
    'How to keep it',
    '  Print this and put it somewhere you would keep a passport. Do not store',
    '  it in the same place as your master password, and do not photograph it',
    '  onto a phone that syncs to a cloud you sign into with 2FA from this app.',
    '',
    'How to use it',
    '  Open Keyrook Authenticator, choose "Use a recovery key" on the unlock',
    '  screen, and type the key above. You will then set a new master password.',
    '',
  ].join('\n');
}
