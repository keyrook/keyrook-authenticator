import { concatBytes, fromBase64, toBase64, utf8 } from '../util/bytes.js';

export const CURVE: EcKeyImportParams = { name: 'ECDH', namedCurve: 'P-256' };
/** An uncompressed P-256 point: 0x04, then 32 bytes of x and 32 of y. */
const PUBLIC_KEY_BYTES = 65;

/**
 * Imports a public key that came over the network, or null when it is not
 * one. Importing checks the point is on the curve; a malformed or off-curve
 * point is a reason to stop, not to proceed with whatever ECDH would make of
 * it. Each caller says so in its own words, written where it throws, so the
 * products' language files find every sentence.
 */
export async function importPublicPoint(publicKey: string): Promise<CryptoKey | null> {
  let raw: Uint8Array;
  try {
    raw = fromBase64(publicKey);
  } catch {
    return null;
  }
  if (raw.length !== PUBLIC_KEY_BYTES || raw[0] !== 0x04) return null;
  try {
    return await crypto.subtle.importKey('raw', raw as BufferSource, CURVE, false, []);
  } catch {
    return null;
  }
}

/**
 * The public point that belongs to a private key, base64. Read from the key
 * itself — the JWK of a private EC key carries its x and y — so a caller that
 * opened a private key never has to take its public half on anyone's word.
 */
export async function publicPointOf(privateKey: CryptoKey): Promise<string> {
  const jwk = await crypto.subtle.exportKey('jwk', privateKey);
  if (!jwk.x || !jwk.y) throw new Error('Malformed account key.');
  return toBase64(concatBytes(new Uint8Array([0x04]), fromBase64(jwk.x), fromBase64(jwk.y)));
}

/**
 * Fields joined into one unambiguous byte string: each one prefixed with its
 * length, so no two different lists of fields ever produce the same bytes.
 */
export function transcript(...fields: string[]): Uint8Array {
  return concatBytes(
    ...fields.map((value) => {
      const bytes = utf8(value);
      const length = new Uint8Array(4);
      new DataView(length.buffer).setUint32(0, bytes.length);
      return concatBytes(length, bytes);
    }),
  );
}
