import jsQR from 'jsqr';
import { describe, expect, it } from 'vitest';
import { encodeMigrationUris, itemFromUri, parseOtpUri } from '@authx/core';
import { qrMatrix } from '../src/components/QrCode.js';

/**
 * A code that will not scan is worse than none: someone moves their accounts,
 * trusts the result, and wipes the old device. So every kind of code the
 * extension shows is read back here by a real decoder — the one the extension
 * itself scans with.
 */
function scan(text: string): string | undefined {
  const matrix = qrMatrix(text);
  const scale = 4;
  const size = matrix.length * scale;
  const pixels = new Uint8ClampedArray(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const value = matrix[Math.floor(y / scale)]![Math.floor(x / scale)] ? 0 : 255;
      pixels.set([value, value, value, 255], (y * size + x) * 4);
    }
  }
  return jsQR(pixels, size, size)?.data;
}

describe('QR codes the extension shows', () => {
  it('carry one account exactly', () => {
    const uri =
      'otpauth://totp/Ng%C3%A2n%20h%C3%A0ng:an%40example.com?secret=MZXW6YTBOIQWY3DPEB3W64TMMQ&issuer=Ng%C3%A2n%20h%C3%A0ng&algorithm=SHA256&digits=8&period=30';
    expect(scan(uri)).toBe(uri);
  });

  it('carry a full Google Authenticator transfer batch exactly', () => {
    const items = Array.from({ length: 8 }, (_, index) =>
      itemFromUri(
        parseOtpUri(
          `otpauth://totp/A%20rather%20long%20service%20name%20${index}:someone.with.a.long.address@example-company.com?secret=JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP&issuer=A%20rather%20long%20service%20name%20${index}`,
        ),
      ),
    );
    const [uri] = encodeMigrationUris(items).uris;
    expect(scan(uri!)).toBe(uri);
  });

  it('keep the margin a camera needs', () => {
    const matrix = qrMatrix('otpauth://totp/x?secret=JBSWY3DPEHPK3PXP');
    for (const row of matrix.slice(0, 4)) expect(row.every((on) => !on)).toBe(true);
    for (const row of matrix) expect(row.slice(0, 4).every((on) => !on)).toBe(true);
  });
});
