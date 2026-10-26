import { base32Decode } from '../util/base32.js';
import { DEFAULT_OTP_PARAMS, STEAM_PARAMS, type OtpAlgorithm, type OtpParams } from './types.js';

const SUBTLE_ALGORITHM: Record<OtpAlgorithm, string> = {
  SHA1: 'SHA-1',
  SHA256: 'SHA-256',
  SHA512: 'SHA-512',
};

function counterToBytes(counter: number): Uint8Array {
  const buffer = new ArrayBuffer(8);
  // Counters never realistically exceed 2^53, but the wire format is 64-bit.
  new DataView(buffer).setBigUint64(0, BigInt(Math.floor(counter)), false);
  return new Uint8Array(buffer);
}

async function hmac(
  key: Uint8Array,
  message: Uint8Array,
  algorithm: OtpAlgorithm,
): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key as BufferSource,
    { name: 'HMAC', hash: { name: SUBTLE_ALGORITHM[algorithm] } },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, message as BufferSource);
  return new Uint8Array(signature);
}

/** RFC 4226 HOTP. */
export async function generateHotp(
  secret: string,
  counter: number,
  algorithm: OtpAlgorithm = 'SHA1',
  digits = 6,
): Promise<string> {
  if (digits < 6 || digits > 10) throw new Error('digits must be between 6 and 10');
  const key = base32Decode(secret);
  if (key.length === 0) throw new Error('Secret decoded to zero bytes');

  const digest = await hmac(key, counterToBytes(counter), algorithm);

  // RFC 4226 §5.3 dynamic truncation.
  const offset = digest[digest.length - 1]! & 0x0f;
  const binary =
    ((digest[offset]! & 0x7f) << 24) |
    ((digest[offset + 1]! & 0xff) << 16) |
    ((digest[offset + 2]! & 0xff) << 8) |
    (digest[offset + 3]! & 0xff);

  return (binary % 10 ** digits).toString().padStart(digits, '0');
}

/** RFC 6238 TOTP. `now` is epoch milliseconds. */
export async function generateTotp(
  secret: string,
  options: Partial<Pick<OtpParams, 'algorithm' | 'digits' | 'period'>> = {},
  now: number = Date.now(),
): Promise<string> {
  const { algorithm, digits, period } = { ...DEFAULT_OTP_PARAMS, ...options };
  if (period <= 0) throw new Error('period must be positive');
  const counter = Math.floor(now / 1000 / period);
  return generateHotp(secret, counter, algorithm, digits);
}

/** Steam's alphabet: digits and consonants, without the ones that read as each other. */
const STEAM_ALPHABET = '23456789BCDFGHJKMNPQRTVWXY';

/**
 * Steam Guard: RFC 6238's HMAC-SHA1 and truncation on 30-second steps, the
 * 31 bits then spelled out in Steam's alphabet, least significant first, as
 * Steam's mobile app does. Nothing about it is a setting.
 */
export async function generateSteam(secret: string, now: number = Date.now()): Promise<string> {
  const key = base32Decode(secret);
  if (key.length === 0) throw new Error('Secret decoded to zero bytes');

  const digest = await hmac(key, counterToBytes(Math.floor(now / 1000 / STEAM_PARAMS.period)), 'SHA1');
  const offset = digest[digest.length - 1]! & 0x0f;
  let value =
    ((digest[offset]! & 0x7f) << 24) |
    ((digest[offset + 1]! & 0xff) << 16) |
    ((digest[offset + 2]! & 0xff) << 8) |
    (digest[offset + 3]! & 0xff);

  let code = '';
  for (let index = 0; index < STEAM_PARAMS.digits; index++) {
    code += STEAM_ALPHABET[value % STEAM_ALPHABET.length];
    value = Math.floor(value / STEAM_ALPHABET.length);
  }
  return code;
}

/** Dispatch on `type` so callers can treat every kind of account uniformly. */
export async function generateCode(params: OtpParams, now: number = Date.now()): Promise<string> {
  if (params.type === 'hotp') {
    return generateHotp(params.secret, params.counter, params.algorithm, params.digits);
  }
  if (params.type === 'steam') return generateSteam(params.secret, now);
  return generateTotp(
    params.secret,
    { algorithm: params.algorithm, digits: params.digits, period: params.period },
    now,
  );
}

export interface TotpWindow {
  /** Seconds left before the current code expires. */
  remaining: number;
  /** 0 → just refreshed, 1 → about to expire. */
  progress: number;
  /** Index of the current time step; changes when the code changes. */
  counter: number;
}

export function totpWindow(period: number, now: number = Date.now()): TotpWindow {
  const seconds = now / 1000;
  const elapsed = seconds % period;
  return {
    remaining: period - elapsed,
    progress: elapsed / period,
    counter: Math.floor(seconds / period),
  };
}

/**
 * Group a code for readability: 123456 → "123 456", 12345678 → "1234 5678".
 * Steam Guard's five characters stay whole, as Steam shows them.
 */
export function formatCode(code: string): string {
  if (code.length === 6) return `${code.slice(0, 3)} ${code.slice(3)}`;
  if (code.length === 8) return `${code.slice(0, 4)} ${code.slice(4)}`;
  if (code.length === 7) return `${code.slice(0, 4)} ${code.slice(4)}`;
  return code;
}
