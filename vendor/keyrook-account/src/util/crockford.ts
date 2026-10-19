/**
 * Crockford's base32 — the encoding for anything a human has to copy off a
 * screen onto paper and type back in months later.
 *
 * It drops I, L, O and U from the alphabet: the first three because they are
 * indistinguishable from 1 and 0 in most fonts, and U so that no randomly
 * generated code can spell something the user would rather not write down.
 * Decoding then maps the confusable characters back, so someone who writes an
 * O and types a zero still gets in.
 */
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

const DECODE = new Map<string, number>();
for (const [index, char] of [...ALPHABET].entries()) DECODE.set(char, index);
// What people actually write when they meant the other thing.
DECODE.set('I', 1);
DECODE.set('L', 1);
DECODE.set('O', 0);

export function crockfordEncode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = '';

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function crockfordDecode(input: string): Uint8Array {
  // Hyphens and spaces are formatting we added; the user may add their own.
  const clean = input.toUpperCase().replace(/[\s-]/g, '');
  if (clean.length === 0) throw new Error('Recovery key is empty');

  const out = new Uint8Array(Math.floor((clean.length * 5) / 8));
  let bits = 0;
  let value = 0;
  let index = 0;

  for (const char of clean) {
    const digit = DECODE.get(char);
    if (digit === undefined) throw new Error(`"${char}" is not part of a recovery key`);
    value = (value << 5) | digit;
    bits += 5;
    if (bits >= 8) {
      out[index++] = (value >>> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }
  return out.subarray(0, index);
}

/** Break a long code into groups so the eye can track its place. */
export function group(code: string, size = 4, separator = '-'): string {
  return (code.match(new RegExp(`.{1,${size}}`, 'g')) ?? []).join(separator);
}
