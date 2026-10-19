/**
 * The recovery kit, carried by the account.
 *
 * A kit is a second wrapping of the data key under a key the user keeps on
 * paper (see `kit.ts`). Once a product syncs, the same
 * kit has to work in two more places: on a new device, when every old one is
 * gone and the password is forgotten; and on the user's other devices, so one
 * printed sheet opens all of them and reissuing it retires the old sheet
 * everywhere.
 *
 * Three values make that possible without giving the server anything it can
 * use:
 *
 * - **`keyCheck`** proves a caller holds the data key. It is what authorises
 *   changing the account's kit, and what a password reset through the kit must
 *   present, so neither a stolen session token nor a stolen recovery wrap is
 *   enough to take an account over.
 * - **`recoveryAuthHash`** proves a caller holds the recovery key, so the
 *   server hands the wrapped key only to someone who could open it anyway.
 * - **The kit state**, sealed under the data key, is what other devices adopt.
 *   The server cannot forge one, and each device refuses a state older than
 *   the newest it has seen, so it cannot roll a retired kit back in either.
 */
import { openJson, sealJson, type SealedBox } from '../crypto/aead.js';
import { toBase64, utf8, wipe } from '../util/bytes.js';
import { crockfordDecode } from '../util/crockford.js';
import { isWellFormedRecoveryKey, normaliseRecoveryKey, type RecoveryWrap } from './kit.js';

const KEY_CHECK_INFO = 'authx:v1:key-check';
const RECOVERY_AUTH_INFO = 'authx:v1:recovery-auth';
const RECOVERY_STATE_AAD = 'authx.recovery:v1';

/** HKDF-Expand a high-entropy secret into an unrelated 256-bit value. */
async function expand(secret: Uint8Array, info: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', secret as BufferSource, 'HKDF', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(0) as BufferSource,
      info: utf8(info) as BufferSource,
    },
    key,
    256,
  );
  return toBase64(new Uint8Array(bits));
}

/**
 * Proof of holding the data key. Unlinkable to the key itself — HKDF under its
 * own label — so the server learns nothing it could decrypt with.
 */
export async function deriveKeyCheck(dataKey: CryptoKey): Promise<string> {
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', dataKey));
  try {
    return await expand(raw, KEY_CHECK_INFO);
  } finally {
    wipe(raw);
  }
}

/**
 * Proof of holding the recovery key. Derived from its 160 random bits, not from
 * the PBKDF2 key that unwraps the kit, so the server holding this is no closer
 * to opening it.
 */
export async function deriveRecoveryAuthHash(recoveryKey: string): Promise<string> {
  if (!isWellFormedRecoveryKey(recoveryKey)) {
    throw new Error('That does not look like a recovery key.');
  }
  const bytes = crockfordDecode(normaliseRecoveryKey(recoveryKey));
  try {
    return await expand(bytes, RECOVERY_AUTH_INFO);
  } finally {
    wipe(bytes);
  }
}

/**
 * The account's kit as its devices see it. `wrap: null` records a removal, so
 * that removing the kit on one device removes it on the others — the reason
 * to remove it is usually that the sheet was lost.
 */
export interface AccountRecoveryState {
  wrap: RecoveryWrap | null;
  /** When this state was made. Orders states; a device never goes backwards. */
  issuedAt: number;
}

export function sealRecoveryState(dataKey: CryptoKey, state: AccountRecoveryState): Promise<SealedBox> {
  return sealJson(dataKey, state, utf8(RECOVERY_STATE_AAD));
}

/** Opens a state from the server. Throws `DecryptionError` on a forgery. */
export async function openRecoveryState(
  dataKey: CryptoKey,
  box: SealedBox,
): Promise<AccountRecoveryState> {
  const state = await openJson<AccountRecoveryState>(dataKey, box, utf8(RECOVERY_STATE_AAD));
  // Authentic means one of this account's own devices wrote it, not that it
  // is well formed; a buggy build is still a possibility.
  if (!Number.isFinite(state?.issuedAt)) throw new Error('Malformed recovery state.');
  if (state.wrap !== null && !isRecoveryWrap(state.wrap)) throw new Error('Malformed recovery state.');
  return { wrap: state.wrap, issuedAt: state.issuedAt };
}

function isRecoveryWrap(value: unknown): value is RecoveryWrap {
  const wrap = value as RecoveryWrap;
  return (
    typeof wrap === 'object' &&
    wrap !== null &&
    typeof wrap.wrappedKey?.iv === 'string' &&
    typeof wrap.wrappedKey?.ct === 'string' &&
    typeof wrap.kdf?.salt === 'string' &&
    Number.isInteger(wrap.kdf?.iterations) &&
    Number.isFinite(wrap.createdAt)
  );
}
