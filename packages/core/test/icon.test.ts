import { describe, expect, it } from 'vitest';
import { isStoredIcon, MAX_ICON_BYTES } from '../src/vault/model.js';
import { newKdfParams } from '@keyrook/account';
import { parseOtpUri } from '../src/otp/uri.js';
import {
  addItem,
  createVault,
  itemFromUri,
  liveItems,
  passphraseKeyring,
  readPayload,
  sealVault,
  updateItem,
} from '../src/vault/vault.js';

const PASSWORD = 'correct horse battery staple';
const PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==';

const vault = () =>
  passphraseKeyring(PASSWORD, newKdfParams(100_000)).then((keyring) => createVault(keyring));

const item = () =>
  itemFromUri(parseOtpUri('otpauth://totp/Fastmail:me?secret=JBSWY3DPEHPK3PXP&issuer=Fastmail'));

describe('what counts as a stored picture', () => {
  it('accepts the raster formats the uploader produces', () => {
    expect(isStoredIcon(PIXEL)).toBe(true);
    expect(isStoredIcon('data:image/webp;base64,UklGRg==')).toBe(true);
    expect(isStoredIcon('data:image/jpeg;base64,/9j/4AAQ')).toBe(true);
  });

  it('refuses SVG', () => {
    // SVG can carry script and pull in external references. Nothing here needs
    // it, and every icon the app stores has been through a canvas.
    expect(isStoredIcon('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=')).toBe(false);
    expect(isStoredIcon('data:image/svg+xml,<svg onload="alert(1)"/>')).toBe(false);
  });

  it('refuses anything that is not a base64 raster data URL', () => {
    expect(isStoredIcon('https://example.com/logo.png')).toBe(false);
    expect(isStoredIcon('javascript:alert(1)')).toBe(false);
    expect(isStoredIcon('data:text/html;base64,PGgxPmhp')).toBe(false);
    expect(isStoredIcon('data:image/png,notbase64')).toBe(false);
    expect(isStoredIcon('')).toBe(false);
    expect(isStoredIcon(null)).toBe(false);
    expect(isStoredIcon(42)).toBe(false);
  });

  it('refuses one large enough to break sync later', () => {
    // The server rejects an oversized record, which would otherwise surface
    // weeks later as an account that quietly stopped syncing.
    const huge = `data:image/png;base64,${'A'.repeat(MAX_ICON_BYTES)}`;
    expect(huge.length).toBeGreaterThan(MAX_ICON_BYTES);
    expect(isStoredIcon(huge)).toBe(false);
  });
});

describe('a picture on an account', () => {
  it('survives being sealed and reopened', async () => {
    const { file, dataKey, data } = await vault();
    const one = addItem(data, item());
    const withIcon = updateItem(one, one.items[0]!.id, { icon: PIXEL });

    const sealed = await sealVault(file, dataKey, withIcon);
    const reopened = await readPayload(sealed, dataKey);
    expect(liveItems(reopened)[0]!.icon).toBe(PIXEL);
  });

  it('is encrypted like everything else', async () => {
    const { file, dataKey, data } = await vault();
    const one = addItem(data, item());
    const withIcon = updateItem(one, one.items[0]!.id, { icon: PIXEL });

    const sealed = await sealVault(file, dataKey, withIcon);
    expect(JSON.stringify(sealed)).not.toContain('iVBORw0KGgo');
  });

  it('drops one that no longer passes validation', async () => {
    const { file, dataKey, data } = await vault();
    const one = addItem(data, item());

    // A vault can arrive from a backup or another device, and this field is the
    // one place user-supplied markup could reach the DOM.
    const tampered = {
      ...one,
      items: [{ ...one.items[0]!, icon: 'data:image/svg+xml,<svg onload="alert(1)"/>' }],
    };
    const sealed = await sealVault(file, dataKey, tampered);

    expect((await readPayload(sealed, dataKey)).items[0]!.icon).toBeNull();
  });

  it('starts empty on a new account', () => {
    expect(item().icon).toBeNull();
  });
});
