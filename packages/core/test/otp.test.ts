import { describe, expect, it } from 'vitest';
import { base32Decode, base32Encode, isValidBase32 } from '../src/util/base32.js';
import { generateCode, generateHotp, generateSteam, generateTotp, formatCode, totpWindow } from '../src/otp/totp.js';
import { buildOtpUri, parseOtpUri, parseSteamLink } from '../src/otp/uri.js';
import { STEAM_PARAMS } from '../src/otp/types.js';
import { utf8 } from '../src/util/bytes.js';

describe('base32 (RFC 4648 §10 vectors)', () => {
  const vectors: [string, string][] = [
    ['', ''],
    ['f', 'MY'],
    ['fo', 'MZXQ'],
    ['foo', 'MZXW6'],
    ['foob', 'MZXW6YQ'],
    ['fooba', 'MZXW6YTB'],
    ['foobar', 'MZXW6YTBOI'],
  ];

  it.each(vectors)('encodes %j', (input, expected) => {
    expect(base32Encode(utf8(input))).toBe(expected);
  });

  it.each(vectors.slice(1))('decodes %j back', (input, encoded) => {
    expect(new TextDecoder().decode(base32Decode(encoded))).toBe(input);
  });

  it('tolerates lower case, spaces and padding', () => {
    expect(base32Decode('mzxw 6ytb-oi===')).toEqual(base32Decode('MZXW6YTBOI'));
  });

  it('rejects characters outside the alphabet', () => {
    expect(() => base32Decode('MZXW6YTB0I')).toThrow(/Invalid base32/);
    expect(isValidBase32('has spaces but 1 is invalid')).toBe(false);
  });
});

// RFC 4226 Appendix D — secret "12345678901234567890".
const HOTP_SECRET = base32Encode(utf8('12345678901234567890'));

describe('HOTP (RFC 4226 Appendix D)', () => {
  const expected = [
    '755224', '287082', '359152', '969429', '338314',
    '254676', '287922', '162583', '399871', '520489',
  ];

  it.each(expected.map((code, counter) => [counter, code]))(
    'counter %i produces %s',
    async (counter, code) => {
      expect(await generateHotp(HOTP_SECRET, counter as number)).toBe(code);
    },
  );
});

// RFC 6238 Appendix B. Each algorithm uses a differently sized seed.
const SHA1_SECRET = base32Encode(utf8('12345678901234567890'));
const SHA256_SECRET = base32Encode(utf8('12345678901234567890123456789012'));
const SHA512_SECRET = base32Encode(
  utf8('1234567890123456789012345678901234567890123456789012345678901234'),
);

describe('TOTP (RFC 6238 Appendix B)', () => {
  const cases: [number, string, string, string][] = [
    [59, '94287082', '46119246', '90693936'],
    [1111111109, '07081804', '68084774', '25091201'],
    [1111111111, '14050471', '67062674', '99943326'],
    [1234567890, '89005924', '91819424', '93441116'],
    [2000000000, '69279037', '90698825', '38618901'],
    [20000000000, '65353130', '77737706', '47863826'],
  ];

  it.each(cases)('t=%i', async (seconds, sha1, sha256, sha512) => {
    const at = seconds * 1000;
    expect(await generateTotp(SHA1_SECRET, { algorithm: 'SHA1', digits: 8 }, at)).toBe(sha1);
    expect(await generateTotp(SHA256_SECRET, { algorithm: 'SHA256', digits: 8 }, at)).toBe(sha256);
    expect(await generateTotp(SHA512_SECRET, { algorithm: 'SHA512', digits: 8 }, at)).toBe(sha512);
  });

  it('defaults to 6 digits on a 30-second step', async () => {
    const code = await generateTotp(SHA1_SECRET, {}, 59_000);
    expect(code).toBe('287082');
  });
});

// Made by Steam's own mobile app for a throw-away account, whose key was then
// taken from the app's data: KeePassXC's tests/TestTotp.cpp, testSteamTotp.
// Independent of this code, and of every library it might have copied.
const STEAM_SECRET = '63BEDWCQZKTQWPESARIERL5DTTQFCJTK';

describe('Steam Guard (codes from Steam’s mobile app)', () => {
  it.each([
    [1511200518, 'FR8RV'],
    [1511200714, '9P3VP'],
  ])('at %i makes %s', async (seconds, code) => {
    expect(await generateSteam(STEAM_SECRET, seconds * 1000)).toBe(code);
    expect(await generateCode({ ...STEAM_PARAMS, secret: STEAM_SECRET }, seconds * 1000)).toBe(code);
  });

  it('keeps Steam’s settings whatever an account says of its own', async () => {
    const odd = { ...STEAM_PARAMS, secret: STEAM_SECRET, digits: 8, period: 60, algorithm: 'SHA512' as const };
    expect(await generateCode(odd, 1511200518_000)).toBe('FR8RV');
  });

  it('writes the code in Steam’s alphabet, five characters, ungrouped', async () => {
    for (let step = 0; step < 50; step++) {
      const code = await generateSteam(STEAM_SECRET, step * 30_000);
      expect(code).toMatch(/^[23456789BCDFGHJKMNPQRTVWXY]{5}$/);
      expect(formatCode(code)).toBe(code);
    }
  });
});

describe('totpWindow', () => {
  it('reports the time left in the current step', () => {
    // 999_990 is an exact multiple of the 30-second step, so +7s lands 7 in.
    const window_ = totpWindow(30, 999_990 * 1000 + 7_000);
    expect(window_.remaining).toBeCloseTo(23, 5);
    expect(window_.progress).toBeCloseTo(7 / 30, 5);
  });
});

describe('formatCode', () => {
  it('groups by threes for 6-digit codes and fours for 8', () => {
    expect(formatCode('123456')).toBe('123 456');
    expect(formatCode('12345678')).toBe('1234 5678');
    expect(formatCode('1234567890')).toBe('1234567890');
  });
});

describe('otpauth URI', () => {
  it('parses a fully specified URI', () => {
    const parsed = parseOtpUri(
      'otpauth://totp/ACME%20Co:john.doe@email.com?secret=JBSWY3DPEHPK3PXP&issuer=ACME%20Co&algorithm=SHA256&digits=8&period=60',
    );
    expect(parsed).toMatchObject({
      type: 'totp',
      issuer: 'ACME Co',
      label: 'john.doe@email.com',
      secret: 'JBSWY3DPEHPK3PXP',
      algorithm: 'SHA256',
      digits: 8,
      period: 60,
    });
  });

  it('falls back to the issuer embedded in the label', () => {
    const parsed = parseOtpUri('otpauth://totp/GitHub:octocat?secret=JBSWY3DPEHPK3PXP');
    expect(parsed.issuer).toBe('GitHub');
    expect(parsed.label).toBe('octocat');
  });

  it('applies defaults when parameters are omitted', () => {
    const parsed = parseOtpUri('otpauth://totp/solo?secret=JBSWY3DPEHPK3PXP');
    expect(parsed).toMatchObject({ issuer: '', label: 'solo', algorithm: 'SHA1', digits: 6, period: 30 });
  });

  it('requires a counter for HOTP', () => {
    expect(() => parseOtpUri('otpauth://hotp/x?secret=JBSWY3DPEHPK3PXP')).toThrow(/counter/);
    expect(parseOtpUri('otpauth://hotp/x?secret=JBSWY3DPEHPK3PXP&counter=7').counter).toBe(7);
  });

  it('rejects malformed input with a readable message', () => {
    expect(() => parseOtpUri('https://example.com')).toThrow(/Not an otpauth/);
    expect(() => parseOtpUri('otpauth://totp/x')).toThrow(/missing the "secret"/);
    expect(() => parseOtpUri('otpauth://totp/x?secret=not-base32!')).toThrow(/not valid base32/);
    expect(() => parseOtpUri('otpauth://motp/x?secret=JBSWY3DPEHPK3PXP')).toThrow(/Unsupported OTP type/);
  });

  it('round-trips through buildOtpUri', () => {
    const original = parseOtpUri(
      'otpauth://totp/ACME:jane?secret=JBSWY3DPEHPK3PXP&issuer=ACME&algorithm=SHA512&digits=8&period=45',
    );
    expect(parseOtpUri(buildOtpUri(original))).toEqual(original);
  });

  it('reads Steam Guard however a link says it', () => {
    const steam = { ...STEAM_PARAMS, secret: STEAM_SECRET };
    // Aegis, Ente and 2FAS.
    expect(
      parseOtpUri(`otpauth://steam/Steam:gaben?secret=${STEAM_SECRET}&issuer=Steam&algorithm=SHA1&digits=5&period=30`),
    ).toEqual({ ...steam, issuer: 'Steam', label: 'gaben' });
    // KeePassXC, whatever else the link claims.
    expect(parseOtpUri(`otpauth://totp/Valve:gaben?secret=${STEAM_SECRET}&digits=5&encoder=steam`)).toEqual({
      ...steam,
      issuer: 'Valve',
      label: 'gaben',
    });
    // The link Steam hands out, which Steam Desktop Authenticator shows: a
    // plain TOTP, issued by Steam, whose six digits Steam would refuse.
    expect(parseOtpUri(`otpauth://totp/Steam:gaben?secret=${STEAM_SECRET}&issuer=Steam`)).toEqual({
      ...steam,
      issuer: 'Steam',
      label: 'gaben',
    });
    // Bitwarden's, Proton's and the spreadsheets'.
    expect(parseSteamLink(`steam://${STEAM_SECRET.toLowerCase()}`)).toEqual({ ...steam, issuer: '', label: '' });
    expect(() => parseSteamLink('steam://not-base32!')).toThrow(/not valid base32/);
  });

  it('leaves a counter-based account issued by Steam as it is', () => {
    expect(parseOtpUri(`otpauth://hotp/Steam:x?secret=${STEAM_SECRET}&counter=3`).type).toBe('hotp');
  });

  it('writes Steam Guard as otpauth://steam/, and reads it back the same', () => {
    const original = parseOtpUri(`otpauth://steam/Steam:gaben?secret=${STEAM_SECRET}&issuer=Steam`);
    const uri = buildOtpUri(original);
    expect(uri).toBe(`otpauth://steam/Steam:gaben?secret=${STEAM_SECRET}&issuer=Steam&digits=5`);
    expect(parseOtpUri(uri)).toEqual(original);
  });

  it('round-trips HOTP counters', () => {
    const original = parseOtpUri('otpauth://hotp/Bank:acct?secret=JBSWY3DPEHPK3PXP&counter=42');
    expect(parseOtpUri(buildOtpUri(original))).toEqual(original);
  });
});
