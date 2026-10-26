export type OtpAlgorithm = 'SHA1' | 'SHA256' | 'SHA512';
/**
 * `steam` is Steam Guard: TOTP's arithmetic, written as five characters from
 * Steam's own alphabet rather than as digits. Its settings never vary, so
 * whatever a file says about them, `STEAM_PARAMS` is what it uses.
 */
export type OtpType = 'totp' | 'hotp' | 'steam';

/** Everything needed to produce a code, independent of how it is stored. */
export interface OtpParams {
  type: OtpType;
  /** Base32-encoded shared secret. */
  secret: string;
  algorithm: OtpAlgorithm;
  digits: number;
  /** Step size in seconds. TOTP and Steam Guard. */
  period: number;
  /** Moving factor. HOTP only. */
  counter: number;
}

export const DEFAULT_OTP_PARAMS: Omit<OtpParams, 'secret'> = {
  type: 'totp',
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
  counter: 0,
};

/**
 * Steam Guard's, fixed by Steam. Five, not six, is also what keeps an older
 * build of this app honest about an account synced to it: its generator
 * refuses five digits, so it shows dashes rather than a numeric code Steam
 * would turn away.
 */
export const STEAM_PARAMS: Omit<OtpParams, 'secret'> = {
  type: 'steam',
  algorithm: 'SHA1',
  digits: 5,
  period: 30,
  counter: 0,
};

/** Codes that change with the clock, and so have a countdown, a next code and a window to share. */
export function isTimeBased(type: OtpType): boolean {
  return type !== 'hotp';
}
