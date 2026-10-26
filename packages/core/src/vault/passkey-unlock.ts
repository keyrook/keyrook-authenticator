/**
 * Opening a master-password vault with a passkey instead of typing the
 * password: the computer's own check of the person — Touch ID, Windows Hello
 * and its PIN, a phone's screen lock — or a security key and its PIN.
 *
 * Not a gate in front of a key kept nearby: that would make the password
 * optional for anyone who can read the disk. The key comes from a passkey of
 * this app's own. Its PRF answer for the input kept here is a secret only that
 * authenticator can produce, and only after it has checked the person; HKDF
 * turns it into the key that wraps the data key, bound to this vault's id. The
 * file holds the wrapped data key and the input, neither of which opens
 * anything alone.
 *
 * Each kind has a slot of its own, so a vault can open with both: a security
 * key is most use as a second way in beside the computer's, and losing either
 * leaves the other and the password.
 *
 * The password still opens the vault, and everything that needs the owner
 * still asks for it: this is a second way in, never a way around.
 */
import { unwrapDataKey, wrapDataKey } from '@keyrook/account';
import { DecryptionError, readPayload, type UnlockedVault } from './vault.js';
import type { VaultPasskeyUnlock, VaultFile } from './model.js';
import { fromBase64, toBase64, utf8 } from '../util/bytes.js';

/**
 * Where the passkey lives: the computer's own authenticator, or a security
 * key that roams between computers.
 */
export type PasskeyUnlockKind = 'platform' | 'securityKey';

export const PASSKEY_UNLOCK_KINDS: readonly PasskeyUnlockKind[] = ['platform', 'securityKey'];

const SLOT = {
  platform: 'platformUnlock',
  securityKey: 'securityKeyUnlock',
} as const satisfies Record<PasskeyUnlockKind, keyof VaultFile>;

// A salt per kind, so a way in moved into the other slot opens nothing there.
// The platform's predates the security key, and is kept as it was written.
const SALT: Record<PasskeyUnlockKind, string> = {
  platform: 'authx.platform-unlock:v1',
  securityKey: 'authx.security-key-unlock:v1',
};

/** The PRF answers 32 bytes, and asks about as many. */
const PRF_BYTES = 32;

/** A fresh input for a new passkey, base64. */
export function newPasskeyUnlockInput(): string {
  return toBase64(crypto.getRandomValues(new Uint8Array(PRF_BYTES)));
}

/**
 * The way in of this kind, where the vault takes one. The mode decides, not
 * the field: a device-key vault has no password for a passkey to stand in for.
 */
export function passkeyUnlockOf(file: VaultFile, kind: PasskeyUnlockKind): VaultPasskeyUnlock | null {
  return file.protection.mode === 'passphrase' ? (file[SLOT[kind]] ?? null) : null;
}

/**
 * The key-encryption key from a PRF answer. Bound to the vault's id, so the
 * same passkey's answer, carried to another vault's file, opens nothing.
 */
async function kekFrom(prf: Uint8Array, file: Pick<VaultFile, 'id'>, kind: PasskeyUnlockKind): Promise<CryptoKey> {
  // An answer of any other length is not one this passkey gave.
  if (prf.length !== PRF_BYTES) throw new DecryptionError();
  const material = await crypto.subtle.importKey('raw', prf as BufferSource, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: utf8(SALT[kind]) as BufferSource,
      info: utf8(`authx.vault:${file.id}`) as BufferSource,
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['wrapKey', 'unwrapKey'],
  );
}

/**
 * The file with a way in for this passkey, in its kind's slot; the other kind's
 * is left as it is. Only a master-password vault takes one: a device-key vault
 * already opens with nothing to type.
 */
export async function attachPasskeyUnlock(
  file: VaultFile,
  kind: PasskeyUnlockKind,
  dataKey: CryptoKey,
  passkey: { credentialId: string; prfInput: string; prf: Uint8Array },
): Promise<VaultFile> {
  if (file.protection.mode !== 'passphrase') throw new Error('This vault is not protected by a master password.');
  if (fromBase64(passkey.prfInput).length !== PRF_BYTES) throw new DecryptionError();
  return {
    ...file,
    [SLOT[kind]]: {
      credentialId: passkey.credentialId,
      prfInput: passkey.prfInput,
      wrappedKey: await wrapDataKey(await kekFrom(passkey.prf, file, kind), dataKey),
      createdAt: Date.now(),
    } satisfies VaultPasskeyUnlock,
    updatedAt: Date.now(),
  };
}

export function detachPasskeyUnlock(file: VaultFile, kind: PasskeyUnlockKind): VaultFile {
  return { ...file, [SLOT[kind]]: null, updatedAt: Date.now() };
}

/**
 * Opens the vault with the answer of this kind's passkey. Throws
 * `DecryptionError` for an answer that is not its — another passkey's, or a
 * file whose key changed since.
 */
export async function unlockVaultWithPasskey(
  file: VaultFile,
  kind: PasskeyUnlockKind,
  prf: Uint8Array,
): Promise<UnlockedVault> {
  const unlock = passkeyUnlockOf(file, kind);
  if (!unlock) throw new DecryptionError();
  const dataKey = await unwrapDataKey(await kekFrom(prf, file, kind), unlock.wrappedKey);
  return { file, dataKey, data: await readPayload(file, dataKey) };
}
