import { toBase64, fromBase64, utf8 } from '../util/bytes.js';
import { randomBytes } from '../util/id.js';

/**
 * Key derivation is versioned and self-describing so a vault encrypted today
 * still opens after we add a stronger KDF (Argon2id) in a later release.
 */
export type KdfAlgorithm = 'PBKDF2-SHA256';

export interface KdfParams {
  algorithm: KdfAlgorithm;
  iterations: number;
  /** Base64. */
  salt: string;
}

/** OWASP's 2023 floor for PBKDF2-HMAC-SHA256. */
export const DEFAULT_PBKDF2_ITERATIONS = 600_000;

export function newKdfParams(iterations = DEFAULT_PBKDF2_ITERATIONS): KdfParams {
  return {
    algorithm: 'PBKDF2-SHA256',
    iterations,
    salt: toBase64(randomBytes(16)),
  };
}

/**
 * Derive the key-encryption key from the master password. The result is
 * non-extractable: it can wrap and unwrap the data key but can never be read
 * back out of the browser's crypto engine.
 */
export async function deriveKek(password: string, params: KdfParams): Promise<CryptoKey> {
  if (params.algorithm !== 'PBKDF2-SHA256') {
    throw new Error(`Unsupported KDF: ${params.algorithm}`);
  }
  if (params.iterations < 100_000) {
    throw new Error('KDF iteration count is below the safe minimum');
  }

  const passwordKey = await crypto.subtle.importKey(
    'raw',
    utf8(password.normalize('NFKC')) as BufferSource,
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: fromBase64(params.salt) as BufferSource,
      iterations: params.iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['wrapKey', 'unwrapKey', 'encrypt', 'decrypt'],
  );
}

export interface PasswordStrength {
  /** 0–4, mirroring the familiar zxcvbn scale. */
  score: number;
  label: 'very weak' | 'weak' | 'fair' | 'strong' | 'very strong';
  warnings: string[];
}

/**
 * A deliberately simple structural check — enough to steer users away from the
 * obvious mistakes without shipping a 400 KB dictionary into the popup.
 */
export function scorePassword(password: string): PasswordStrength {
  const warnings: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (password.length >= 20) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^\w\s]/.test(password)) score++;

  if (password.length < 10) warnings.push('Use at least 10 characters — length matters most.');
  if (/^\d+$/.test(password)) {
    warnings.push('Digits only is easy to guess.');
    score = Math.min(score, 1);
  }
  if (/(.)\1{2,}/.test(password)) warnings.push('Avoid repeated characters.');

  score = Math.max(0, Math.min(4, score - 1));
  const labels: PasswordStrength['label'][] = ['very weak', 'weak', 'fair', 'strong', 'very strong'];
  return { score, label: labels[score]!, warnings };
}
