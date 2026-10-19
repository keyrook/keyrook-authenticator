/**
 * Account key hierarchy for zero-knowledge sync.
 *
 * The server must be able to tell that someone knows the master password
 * without ever being able to derive the key that decrypts their vault. One
 * master key is derived from the password, then split into independent
 * children:
 *
 *     masterKey    = KDF(password, salt)
 *     stretchedKey = HKDF(masterKey, info="authx:v1:enc")        ← wraps the data key,
 *                                                                   never leaves the device
 *     authHash     = HKDF(masterKey, info="authx:v1:auth")       ← sent to the server
 *     rootWrapKey  = HKDF(masterKey, info="keyrook:v1:root-wrap") ← wraps the account's
 *                                                                   root key, never leaves
 *
 * HKDF with distinct `info` strings makes the children computationally unlinkable:
 * an attacker holding `authHash` — from a server breach, or from the wire —
 * learns nothing about `stretchedKey`, and so cannot decrypt a stolen vault
 * without attacking the password itself.
 *
 * The server never stores `authHash` directly either; it stores a slow hash of
 * it under its own random salt, so a database dump is not a login credential.
 */
import { scorePassword } from '../crypto/kdf.js';
import { fromBase64, toBase64, utf8 } from '../util/bytes.js';
import { randomBytes } from '../util/id.js';

export type AccountKdfAlgorithm = 'PBKDF2-SHA256';

export interface AccountKdfParams {
  algorithm: AccountKdfAlgorithm;
  iterations: number;
  /** Base64. Random per account, handed out by the prelogin endpoint. */
  salt: string;
}

/** Matches the vault's local KDF cost so neither side is the weak one. */
export const DEFAULT_ACCOUNT_ITERATIONS = 600_000;

const ENC_INFO = 'authx:v1:enc';
const AUTH_INFO = 'authx:v1:auth';
const ROOT_WRAP_INFO = 'keyrook:v1:root-wrap';

export function newAccountKdfParams(
  iterations = DEFAULT_ACCOUNT_ITERATIONS,
): AccountKdfParams {
  return { algorithm: 'PBKDF2-SHA256', iterations, salt: toBase64(randomBytes(16)) };
}

/**
 * Refuse parameters weaker than this client would have chosen itself.
 *
 * `/auth/prelogin` answers *before* anything is authenticated, so these numbers
 * arrive from an unproven source. A hostile or compromised server could reply
 * with a far cheaper iteration count, and every login after that would hand it
 * an `authHash` correspondingly cheaper to attack offline — quietly undoing the
 * one property the whole design exists for.
 *
 * This is policy, so it lives apart from `deriveAccountKeys`: the primitive
 * keeps an absolute safety floor, and anything taking parameters off the
 * network calls this as well. Putting both in one place would have meant either
 * a test seam to weaken it, or a test suite that spends minutes on PBKDF2.
 */
export function assertAcceptableAccountKdf(params: AccountKdfParams): void {
  if (params.algorithm !== 'PBKDF2-SHA256') {
    throw new Error(`The server asked for an unsupported KDF: ${params.algorithm}`);
  }
  if (params.iterations < DEFAULT_ACCOUNT_ITERATIONS) {
    throw new Error(
      `The server asked for ${params.iterations.toLocaleString()} KDF iterations, ` +
        `below the ${DEFAULT_ACCOUNT_ITERATIONS.toLocaleString()} this app requires. ` +
        'Sign-in was stopped rather than derive your keys weakly.',
    );
  }
  // A salt short enough to precompute against defeats the point of having one.
  if (fromBase64(params.salt).length < 16) {
    throw new Error('The server returned too short a salt.');
  }
}

/**
 * How strong a password has to be before a copy of the vault may leave the
 * device.
 *
 * A local vault's password only has to hold out against someone who already
 * has the machine. An account's has to hold out against whoever ends up with
 * a copy of the server's data, and a weak password is the one thing the
 * pepper cannot fix — the server never sees the password, so this check can
 * only live here, on the client.
 */
export const ACCOUNT_PASSWORD_MIN_SCORE = 3;

/** Why a password will not do for an account, or null if it will. */
export function accountPasswordProblem(password: string): string | null {
  if (scorePassword(password).score >= ACCOUNT_PASSWORD_MIN_SCORE) return null;
  return (
    'That password is too weak to protect a copy of your vault that leaves this device. ' +
    'Use at least 12 characters mixing upper and lower case, numbers and symbols — ' +
    'or four or five unrelated words.'
  );
}

export interface AccountKeys {
  /**
   * Wraps and unwraps the vault data key. Non-extractable, and never
   * transmitted in any form.
   */
  stretchedKey: CryptoKey;
  /** Base64. Proves knowledge of the password; safe to send to the server. */
  authHash: string;
  /**
   * Wraps and unwraps the account's root key (`keys/root.ts`). A third,
   * independent child of the master key, non-extractable like the first.
   */
  rootWrapKey: CryptoKey;
}

async function deriveMasterKey(password: string, params: AccountKdfParams): Promise<CryptoKey> {
  if (params.algorithm !== 'PBKDF2-SHA256') {
    throw new Error(`Unsupported account KDF: ${params.algorithm}`);
  }
  // A hard floor, not the policy. Callers that take parameters from the
  // network must also run `assertAcceptableAccountKdf` — see its note.
  if (params.iterations < 100_000) {
    throw new Error('Account KDF iteration count is below the safe minimum');
  }

  const passwordKey = await crypto.subtle.importKey(
    'raw',
    utf8(password.normalize('NFKC')) as BufferSource,
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: fromBase64(params.salt) as BufferSource,
      iterations: params.iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    256,
  );

  // Re-imported for HKDF; this handle is the only thing that ever holds the
  // master key, and it is discarded when this function returns.
  return crypto.subtle.importKey('raw', bits, 'HKDF', false, ['deriveBits']);
}

async function expand(masterKey: CryptoKey, info: string): Promise<ArrayBuffer> {
  return crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      // The password KDF already provided the salt; HKDF-Expand needs none.
      salt: new Uint8Array(0) as BufferSource,
      info: utf8(info) as BufferSource,
    },
    masterKey,
    256,
  );
}

export async function deriveAccountKeys(
  password: string,
  params: AccountKdfParams,
): Promise<AccountKeys> {
  const masterKey = await deriveMasterKey(password, params);

  const [encBits, authBits, rootBits] = await Promise.all([
    expand(masterKey, ENC_INFO),
    expand(masterKey, AUTH_INFO),
    expand(masterKey, ROOT_WRAP_INFO),
  ]);

  const stretchedKey = await crypto.subtle.importKey(
    'raw',
    encBits,
    { name: 'AES-GCM', length: 256 },
    false,
    ['wrapKey', 'unwrapKey', 'encrypt', 'decrypt'],
  );
  const rootWrapKey = await crypto.subtle.importKey('raw', rootBits, { name: 'AES-GCM', length: 256 }, false, [
    'encrypt',
    'decrypt',
  ]);

  return { stretchedKey, authHash: toBase64(new Uint8Array(authBits)), rootWrapKey };
}

/**
 * Constant-time comparison for auth hashes. Belongs on the server, but lives
 * here so both sides use one implementation and one encoding.
 */
export function authHashEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index++) {
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return difference === 0;
}
