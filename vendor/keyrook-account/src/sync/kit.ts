/**
 * The emergency recovery kit, as every Keyrook product writes it.
 *
 * An account encrypted under a password is unopenable if that password is
 * forgotten — by us as much as by the user, which is the whole point. The kit
 * is the escape hatch that does not weaken it: a second, independent wrapping
 * of the *same data key* under a high-entropy secret the user keeps on paper.
 *
 * Because it wraps the data key rather than the password, the kit survives a
 * password change with no re-encryption. Where a product keeps the wrap on the
 * device as well, and what it prints on the sheet, is the product's own.
 *
 * This has to exist before the first real user does. Adding it afterwards
 * cannot help anyone who already lost a password.
 */
import { unwrapDataKey, wrapDataKey, type SealedBox } from '../crypto/aead.js';
import { deriveKek, newKdfParams, type KdfParams } from '../crypto/kdf.js';
import { crockfordDecode, crockfordEncode, group } from '../util/crockford.js';
import { randomBytes } from '../util/id.js';

/**
 * A second, independent wrapping of the data key under the user's emergency
 * recovery key, beside the one under the password, so a forgotten password is
 * survivable.
 */
export interface RecoveryWrap {
  kdf: KdfParams;
  wrappedKey: SealedBox;
  createdAt: number;
}

/** 160 bits — exactly 32 Crockford characters, no padding, nothing to trim. */
export const RECOVERY_KEY_BYTES = 20;

/**
 * Lower than the 600,000 rounds used for a password, deliberately.
 *
 * Stretching exists to buy time against guessing a low-entropy secret. This one
 * has 160 bits of entropy from a CSPRNG, so guessing is off the table and extra
 * rounds buy nothing measurable. The count is kept at the accepted floor rather
 * than removed entirely so that the parameters are still recorded in the wrap
 * and can be raised if the kit ever accepts a user-chosen phrase.
 *
 * Do not "fix" this to match the password's count, and do not lower the
 * password's count to match this one.
 */
export const RECOVERY_KDF_ITERATIONS = 100_000;

/** A fresh recovery key, formatted the way it will be shown and written down. */
export function generateRecoveryKey(): string {
  return group(crockfordEncode(randomBytes(RECOVERY_KEY_BYTES)));
}

/**
 * Accept what a person actually types: lower case, their own spacing, and the
 * letters they confused for digits.
 */
export function normaliseRecoveryKey(input: string): string {
  return crockfordEncode(crockfordDecode(input));
}

export function isWellFormedRecoveryKey(input: string): boolean {
  try {
    return crockfordDecode(input).length === RECOVERY_KEY_BYTES;
  } catch {
    return false;
  }
}

async function deriveRecoveryKek(recoveryKey: string, kdf: KdfParams): Promise<CryptoKey> {
  return deriveKek(normaliseRecoveryKey(recoveryKey), kdf);
}

/**
 * Issue a kit for a data key. Returns the key exactly once — it is never
 * stored anywhere, so a caller that drops it has thrown it away for good.
 */
export async function newRecoveryWrap(
  dataKey: CryptoKey,
): Promise<{ wrap: RecoveryWrap; recoveryKey: string }> {
  const recoveryKey = generateRecoveryKey();
  const kdf = newKdfParams(RECOVERY_KDF_ITERATIONS);
  const kek = await deriveRecoveryKek(recoveryKey, kdf);
  return {
    wrap: { kdf, wrappedKey: await wrapDataKey(kek, dataKey), createdAt: Date.now() },
    recoveryKey,
  };
}

/**
 * Opens a kit's wrapping of the data key — kept on a device, or handed back by
 * the sync server to a device that has nothing else.
 */
export async function unwrapRecoveryWrap(
  wrap: Pick<RecoveryWrap, 'kdf' | 'wrappedKey'>,
  recoveryKey: string,
): Promise<CryptoKey> {
  if (!isWellFormedRecoveryKey(recoveryKey)) {
    // Distinguish "that is not a recovery key" from "that is the wrong one", so
    // someone who pasted the wrong thing entirely is not told their key failed.
    throw new Error('That does not look like a recovery key.');
  }
  const kek = await deriveRecoveryKek(recoveryKey, wrap.kdf);
  return unwrapDataKey(kek, wrap.wrappedKey);
}
